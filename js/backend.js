(function () {
  const PROFANITY_WORDS = [
    'amk','aq','oç','oc','sik','sikerim','sikeyim','siktir','yarrak','piç','pic','orospu','oruspu',
    'fuck','shit','bitch','asshole','motherfucker','dick','cock','pussy','nigger','faggot'
  ];

  const localKey = 'metraj_backend_local_v1';
  const cfg = window.METRAJ_CONFIG || {};
  const hasSupabase = !!(window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey);
  const supabase = hasSupabase ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  function normalize(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function isNicknameAllowed(nickname) {
    const n = normalize(nickname);
    if (!n || n.length < 2 || n.length > 24) return false;
    return !PROFANITY_WORDS.some((w) => n.includes(w));
  }

  async function sha256(text) {
    try {
      var data = new TextEncoder().encode(text);
      var hash = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (_) {
      var h = 0;
      for (var i = 0; i < text.length; i++) {
        h = ((h << 5) - h + text.charCodeAt(i)) | 0;
      }
      return Math.abs(h).toString(16).padStart(8, '0');
    }
  }

  function maskStudentNo(no) {
    const raw = String(no || '').trim();
    if (raw.length <= 8) return raw;
    return `${raw.slice(0, 4)}****${raw.slice(-4)}`;
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(localKey);
      return raw ? JSON.parse(raw) : { players: {}, attempts: [] };
    } catch (_) {
      return { players: {}, attempts: [] };
    }
  }

  function saveLocal(db) {
    localStorage.setItem(localKey, JSON.stringify(db));
  }

  async function prepareProfile(profile) {
    const nickname = String(profile.nickname || '').trim();
    const studentNo = String(profile.studentNo || '').trim();
    const studentNoHash = await sha256(studentNo);
    return {
      nickname,
      studentNo,
      studentNoHash,
      studentNoMasked: maskStudentNo(studentNo)
    };
  }

  async function upsertPlayer(profile) {
    if (!hasSupabase) {
      const db = loadLocal();
      const now = new Date().toISOString();
      const prev = db.players[profile.studentNoHash] || {};
      db.players[profile.studentNoHash] = {
        student_no_hash: profile.studentNoHash,
        student_no_masked: profile.studentNoMasked,
        nickname: profile.nickname,
        play_count: prev.play_count || 0,
        total_xp: prev.total_xp || 0,
        correct_count: prev.correct_count || 0,
        attempt_count: prev.attempt_count || 0,
        updated_at: now,
        created_at: prev.created_at || now
      };
      saveLocal(db);
      return { ok: true, mode: 'local' };
    }

    const { error } = await supabase.from('players').upsert({
      student_no_hash: profile.studentNoHash,
      student_no_masked: profile.studentNoMasked,
      nickname: profile.nickname,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_no_hash' });

    return { ok: !error, error, mode: 'supabase' };
  }

  async function recordAttempt(profile, payload) {
    if (!hasSupabase) {
      const db = loadLocal();
      const p = db.players[profile.studentNoHash] || {
        student_no_hash: profile.studentNoHash,
        student_no_masked: profile.studentNoMasked,
        nickname: profile.nickname,
        play_count: 0,
        total_xp: 0,
        correct_count: 0,
        attempt_count: 0,
        created_at: new Date().toISOString()
      };

      p.nickname = profile.nickname;
      p.total_xp += Number(payload.gainedXp || 0);
      p.attempt_count += 1;
      if (payload.correct) p.correct_count += 1;
      if (payload.finishedRound) p.play_count += 1;
      p.updated_at = new Date().toISOString();
      db.players[profile.studentNoHash] = p;

      db.attempts.push({
        student_no_hash: profile.studentNoHash,
        nickname: profile.nickname,
        level: payload.level,
        item_key: payload.itemKey,
        correct: !!payload.correct,
        gained_xp: Number(payload.gainedXp || 0),
        combo: Number(payload.combo || 0),
        created_at: new Date().toISOString()
      });

      if (db.attempts.length > 5000) db.attempts = db.attempts.slice(-5000);
      saveLocal(db);
      return { ok: true, mode: 'local' };
    }

    const { error } = await supabase.from('attempts').insert({
      student_no_hash: profile.studentNoHash,
      nickname: profile.nickname,
      level: payload.level,
      item_key: payload.itemKey,
      correct: !!payload.correct,
      gained_xp: Number(payload.gainedXp || 0),
      combo: Number(payload.combo || 0),
      finished_round: !!payload.finishedRound
    });

    return { ok: !error, error, mode: 'supabase' };
  }

  function bucketStart(date, mode) {
    const d = new Date(date);
    if (mode === 'daily') {
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    if (mode === 'weekly') {
      const day = d.getDay();
      const diff = (day + 6) % 7;
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  async function fetchLeaderboards(period) {
    if (!hasSupabase) {
      const db = loadLocal();
      const now = Date.now();
      const start = bucketStart(now, period);
      const map = {};

      for (const a of db.attempts) {
        const t = new Date(a.created_at).getTime();
        if (t < start) continue;
        const key = a.student_no_hash;
        if (!map[key]) {
          map[key] = { nickname: a.nickname, total_xp: 0, attempts: 0, correct: 0 };
        }
        map[key].total_xp += Number(a.gained_xp || 0);
        map[key].attempts += 1;
        if (a.correct) map[key].correct += 1;
      }

      return Object.values(map)
        .map((r) => ({
          nickname: r.nickname,
          total_xp: r.total_xp,
          accuracy: r.attempts ? Math.round((r.correct / r.attempts) * 100) : 0
        }))
        .sort((a, b) => b.total_xp - a.total_xp)
        .slice(0, 20);
    }

    const view = period === 'daily' ? 'leaderboard_daily' : period === 'weekly' ? 'leaderboard_weekly' : 'leaderboard_monthly';
    const { data } = await supabase.from(view).select('*').limit(20);
    return data || [];
  }

  async function fetchStudentStats(profile) {
    if (!hasSupabase) {
      const db = loadLocal();
      const p = db.players[profile.studentNoHash];
      if (!p) return null;
      return {
        nickname: p.nickname,
        student_no_masked: p.student_no_masked,
        play_count: p.play_count,
        total_xp: p.total_xp,
        attempt_count: p.attempt_count,
        correct_count: p.correct_count,
        accuracy: p.attempt_count ? Math.round((p.correct_count / p.attempt_count) * 100) : 0
      };
    }

    const { data } = await supabase
      .from('player_stats')
      .select('*')
      .eq('student_no_hash', profile.studentNoHash)
      .maybeSingle();
    return data || null;
  }

  window.MetrajBackend = {
    isEnabled: hasSupabase,
    isNicknameAllowed,
    prepareProfile,
    upsertPlayer,
    recordAttempt,
    fetchLeaderboards,
    fetchStudentStats
  };
})();
