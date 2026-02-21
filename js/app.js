(function () {
  const STORAGE_KEY = 'metraj_ustasi_state_v3';
  const TARGET_ROUNDS = 10;

  function escapeHtml(str) {
    const s = String(str);
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  const rankTable = [
    { name: 'Çırak', xp: 0 },
    { name: 'Kalfa', xp: 500 },
    { name: 'Usta', xp: 1500 },
    { name: 'Başmühendis', xp: 3000 }
  ];

  const state = loadState();
  let currentQuestion = null;
  let currentItemIndex = 0;
  let itemWrongAttempts = {};
  let startedAt = 0;
  let timerId = null;
  let lastRenderedCombo = state.combo || 0;
  let audioCtx = null;
  let leaderboardPeriod = 'daily';

  const refs = {
    levelSelect: document.getElementById('levelSelect'),
    stepModeToggle: document.getElementById('stepModeToggle'),
    soundToggle: document.getElementById('soundToggle'),
    soundProfile: document.getElementById('soundProfile'),
    authOverlay: document.getElementById('authOverlay'),
    nicknameInput: document.getElementById('nicknameInput'),
    studentNoInput: document.getElementById('studentNoInput'),
    authError: document.getElementById('authError'),
    authStartBtn: document.getElementById('authStartBtn'),
    leaderboardHost: document.getElementById('leaderboardHost'),
    studentStatsHost: document.getElementById('studentStatsHost'),
    lbDailyBtn: document.getElementById('lbDailyBtn'),
    lbWeeklyBtn: document.getElementById('lbWeeklyBtn'),
    lbMonthlyBtn: document.getElementById('lbMonthlyBtn'),
    comboToast: document.getElementById('comboToast'),
    flameBackdrop: document.getElementById('flameBackdrop'),
    newQuestionBtn: document.getElementById('newQuestionBtn'),
    checkBtn: document.getElementById('checkBtn'),
    questionTitle: document.getElementById('questionTitle'),
    questionText: document.getElementById('questionText'),
    questionMeta: document.getElementById('questionMeta'),
    drawingHost: document.getElementById('drawingHost'),
    itemsHost: document.getElementById('itemsHost'),
    feedbackHost: document.getElementById('feedbackHost'),
    heatmapHost: document.getElementById('heatmapHost'),
    result: document.getElementById('result'),
    xp: document.getElementById('xp'),
    rank: document.getElementById('rank'),
    streak: document.getElementById('streak'),
    combo: document.getElementById('combo'),
    flame: document.getElementById('flame'),
    round: document.getElementById('round'),
    timer: document.getElementById('timer'),
    accuracy: document.getElementById('accuracy'),
    progressBar: document.getElementById('progressBar')
  };

  refs.newQuestionBtn.addEventListener('click', newQuestion);
  refs.checkBtn.addEventListener('click', checkCurrentItem);
  refs.stepModeToggle.addEventListener('change', renderCurrentItem);
  refs.soundToggle.addEventListener('change', onSoundToggleChange);
  refs.soundProfile.addEventListener('change', onSoundProfileChange);
  refs.itemsHost.addEventListener('keydown', onItemsKeyDown);
  document.addEventListener('keydown', onGlobalKeyDown);
  refs.authStartBtn.addEventListener('click', startWithProfile);
  refs.lbDailyBtn.addEventListener('click', () => setLeaderboardPeriod('daily'));
  refs.lbWeeklyBtn.addEventListener('click', () => setLeaderboardPeriod('weekly'));
  refs.lbMonthlyBtn.addEventListener('click', () => setLeaderboardPeriod('monthly'));

  renderStats();
  renderHeatmap();
  bootstrap();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const base = {
        xp: 0,
        streak: 0,
        combo: 0,
        roundsAsked: 0,
        roundsPerfect: 0,
        totalItems: 0,
        correctItems: 0,
        soundOn: true,
        soundProfile: 'classic',
        profile: null,
        heatmap: {}
      };
      return raw ? Object.assign(base, JSON.parse(raw)) : base;
    } catch (_) {
      return {
        xp: 0,
        streak: 0,
        combo: 0,
        roundsAsked: 0,
        roundsPerfect: 0,
        totalItems: 0,
        correctItems: 0,
        soundOn: true,
        soundProfile: 'classic',
        profile: null,
        heatmap: {}
      };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentRank() {
    let rank = rankTable[0].name;
    for (const row of rankTable) {
      if (state.xp >= row.xp) rank = row.name;
    }
    return rank;
  }

  function percent(part, whole) {
    if (!whole) return 0;
    return Math.round((part / whole) * 100);
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function flameState(combo) {
    if (combo <= 0) return { text: '❄️', cls: 'flame-off' };
    if (combo < 3) return { text: '🔥', cls: 'flame-1' };
    if (combo < 6) return { text: '🔥🔥', cls: 'flame-2' };
    return { text: '🔥🔥🔥', cls: 'flame-3' };
  }

  function renderStats() {
    refs.xp.textContent = `XP: ${state.xp}`;
    refs.rank.textContent = `Rütbe: ${currentRank()}`;
    refs.streak.textContent = `Seri: ${state.streak}`;
    refs.combo.textContent = `Kombo: ${state.combo}`;
    refs.round.textContent = `Tur: ${Math.min(state.roundsAsked, TARGET_ROUNDS)}/${TARGET_ROUNDS}`;
    refs.accuracy.textContent = `Başarı: %${percent(state.correctItems, state.totalItems)}`;
    refs.progressBar.style.width = `${Math.min(100, (state.roundsAsked / TARGET_ROUNDS) * 100)}%`;

    const flame = flameState(state.combo);
    refs.flame.textContent = flame.text;
    refs.flame.className = `flame ${flame.cls}`;
    if (state.combo > lastRenderedCombo) {
      refs.flame.classList.add('flame-pop');
      setTimeout(() => refs.flame.classList.remove('flame-pop'), 260);
      showComboToast(state.combo);
    }
    lastRenderedCombo = state.combo;
    refs.flameBackdrop.style.opacity = String(Math.min(0.65, state.combo * 0.08));
  }

  function showComboToast(combo) {
    refs.comboToast.textContent = `KOMBO x${combo}`;
    refs.comboToast.classList.remove('show');
    void refs.comboToast.offsetWidth;
    refs.comboToast.classList.add('show');
  }

  async function bootstrap() {
    if (state.profile && state.profile.nickname && state.profile.studentNoHash) {
      refs.authOverlay.classList.remove('show');
      refs.nicknameInput.value = state.profile.nickname;
      await window.MetrajBackend.upsertPlayer(state.profile);
      await refreshExternalPanels();
      newQuestion();
      return;
    }
    refs.authOverlay.classList.add('show');
    refs.authError.textContent = '';
  }

  async function startWithProfile() {
    try {
      const nickname = String(refs.nicknameInput.value || '').trim();
      const studentNo = String(refs.studentNoInput.value || '').trim();
      if (!window.MetrajBackend.isNicknameAllowed(nickname)) {
        refs.authError.textContent = 'Takma ad uygun değil. Küfür veya uygunsuz ifade içeremez.';
        return;
      }
      if (!/^\d{12}$/.test(studentNo)) {
        refs.authError.textContent = 'Öğrenci numarası tam 12 haneli ve sadece rakam olmalı.';
        return;
      }

      const profile = await window.MetrajBackend.prepareProfile({ nickname, studentNo });
      state.profile = {
        nickname: profile.nickname,
        studentNoHash: profile.studentNoHash,
        studentNoMasked: profile.studentNoMasked
      };
      await window.MetrajBackend.upsertPlayer(profile);
      saveState();

      refs.authOverlay.classList.remove('show');
      refs.authError.textContent = '';
      await refreshExternalPanels();
      newQuestion();
    } catch (err) {
      refs.authError.textContent = 'Bir hata oluştu: ' + err.message;
    }
  }

  function onSoundToggleChange() {
    state.soundOn = refs.soundToggle.checked;
    saveState();
  }

  function onSoundProfileChange() {
    state.soundProfile = refs.soundProfile.value;
    saveState();
  }

  function ensureAudioCtx() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
  }

  function playTone(freq, durationSec, type, gainLevel, startDelaySec) {
    const ctx = ensureAudioCtx();
    if (!ctx || !state.soundOn) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime + (startDelaySec || 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  function playCorrectSound(combo) {
    if (!state.soundOn) return;
    const c = Math.max(1, combo);
    if (state.soundProfile === 'minimal') {
      playTone(520 + c * 8, 0.08, 'sine', 0.04, 0);
      return;
    }
    if (state.soundProfile === 'arcade') {
      playTone(640 + c * 10, 0.07, 'square', 0.06, 0);
      playTone(860 + c * 12, 0.09, 'square', 0.05, 0.06);
      playTone(1020 + c * 8, 0.08, 'triangle', 0.04, 0.12);
      return;
    }
    playTone(420 + c * 12, 0.10, 'triangle', 0.06, 0);
    playTone(560 + c * 14, 0.12, 'triangle', 0.05, 0.08);
  }

  function playWrongSound() {
    if (!state.soundOn) return;
    if (state.soundProfile === 'minimal') {
      playTone(220, 0.08, 'sine', 0.035, 0);
      return;
    }
    if (state.soundProfile === 'arcade') {
      playTone(260, 0.08, 'square', 0.05, 0);
      playTone(180, 0.11, 'square', 0.05, 0.08);
      return;
    }
    playTone(180, 0.16, 'sawtooth', 0.05, 0);
  }

  function startTimer() {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      refs.timer.textContent = `Süre: ${formatTime((Date.now() - startedAt) / 1000)}`;
    }, 250);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function newQuestion() {
    if (!state.profile) {
      refs.authOverlay.classList.add('show');
      return;
    }
    refs.result.textContent = '';
    refs.feedbackHost.innerHTML = '<p class="feedbackMeta">Kontrol sonrası kalem bazlı geri bildirim burada gösterilir.</p>';

    currentQuestion = window.MetrajLevels.generate(refs.levelSelect.value);
    currentItemIndex = 0;
    itemWrongAttempts = {};
    startedAt = Date.now();
    state.roundsAsked += 1;

    refs.questionTitle.textContent = currentQuestion.title;
    refs.questionText.textContent = currentQuestion.text;
    refs.questionMeta.innerHTML = currentQuestion.meta.map((m) => `<li>${m}</li>`).join('');

    window.MetrajDrawing.render(refs.drawingHost, currentQuestion.drawingData);
    refs.timer.textContent = 'Süre: 00:00';
    startTimer();
    refs.soundToggle.checked = Boolean(state.soundOn);
    refs.soundProfile.value = state.soundProfile || 'classic';

    renderCurrentItem();
    saveState();
    renderStats();
  }

  function renderCurrentItem() {
    if (!currentQuestion) return;

    const item = currentQuestion.items[currentItemIndex];
    if (!item) {
      refs.itemsHost.innerHTML = '';
      return;
    }

    refs.itemsHost.innerHTML = `
      <div class="item">
        <label for="input_${item.key}">Kalem ${currentItemIndex + 1}/${currentQuestion.items.length} - ${item.label}</label>
        <input id="input_${item.key}" type="text" inputmode="decimal" placeholder="m3" />
        <span id="status_${item.key}" class="feedbackMeta">Cevabı m3 olarak gir. Hak: ${2 - Math.min(2, itemWrongAttempts[item.key] || 0)}/2</span>
        ${renderStepInputs(item)}
      </div>
    `;
    const mainInput = document.getElementById(`input_${item.key}`);
    if (mainInput) mainInput.focus();
  }

  function onItemsKeyDown(ev) {
    if (ev.key !== 'Enter') return;
    if (!currentQuestion) return;
    ev.preventDefault();
    checkCurrentItem();
  }

  function renderStepInputs(item) {
    if (!refs.stepModeToggle.checked || !item.stepInputs || item.stepInputs.length === 0) return '';
    return `
      <div class="stepInputs">
        ${item.stepInputs.map((s) => `
          <div class="stepRow">
            <label for="step_${item.key}_${s.id}">${s.label}</label>
            <input id="step_${item.key}_${s.id}" type="text" inputmode="decimal" placeholder="${s.unit || ''}" />
            <span id="step_status_${item.key}_${s.id}" class="feedbackMeta">Ara adım</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function readNumberInput(el) {
    if (!el) return NaN;
    const raw = String(el.value || '').trim();
    if (raw === '') return NaN;
    return Number(raw.replace(',', '.'));
  }

  function withinTolerance(answer, correct) {
    if (!Number.isFinite(answer)) return false;
    if (correct === 0) return Math.abs(answer) < 0.000001;
    const ratio = Math.abs(answer - correct) / Math.abs(correct);
    return ratio <= 0.02;
  }

  function withinStepTolerance(answer, expected) {
    if (!Number.isFinite(answer)) return false;
    if (Math.abs(answer - expected) <= 0.01) return true;
    return withinTolerance(answer, expected);
  }

  function evaluateStepInputs(item, revealExpected) {
    if (!refs.stepModeToggle.checked || !item.stepInputs || item.stepInputs.length === 0) {
      return { ok: true, detail: 'Adım modu kapalı.', stepOk: 0, stepTotal: 0 };
    }

    let stepOk = 0;
    for (const s of item.stepInputs) {
      const input = document.getElementById(`step_${item.key}_${s.id}`);
      const status = document.getElementById(`step_status_${item.key}_${s.id}`);
      const answer = readNumberInput(input);
      const ok = withinStepTolerance(answer, s.value);
      if (ok) stepOk += 1;
      status.textContent = ok
        ? 'Adım doğru'
        : (revealExpected ? `Adım yanlış (Doğru: ${s.value.toFixed(3)} ${s.unit || ''})` : 'Adım yanlış');
      status.className = ok ? 'badge-ok' : 'badge-bad';
    }

    return {
      ok: stepOk === item.stepInputs.length,
      detail: `Ara adım: ${stepOk}/${item.stepInputs.length} doğru`,
      stepOk,
      stepTotal: item.stepInputs.length
    };
  }

  function partialXpFromSteps(stepCheck) {
    if (!refs.stepModeToggle.checked) return 0;
    if (!stepCheck || stepCheck.stepTotal <= 0 || stepCheck.stepOk <= 0) return 0;
    return Math.max(1, Math.round((stepCheck.stepOk / stepCheck.stepTotal) * 4));
  }

  function comboBonus() {
    return Math.min(8, Math.max(0, state.combo - 1));
  }

  function diagnose(item, answer) {
    if (!Number.isFinite(answer)) return 'Sayı girilmediği için kontrol yapılamadı.';
    for (const m of item.commonMistakes || []) {
      if (withinTolerance(answer, m.value)) return m.label;
    }
    return 'Formüldeki bir ara adımda boyut veya uzunluk seçimi hatalı olabilir.';
  }

  function ensureHeatEntry(level, item) {
    const key = `L${level}:${item.key}`;
    if (!state.heatmap[key]) {
      state.heatmap[key] = { level, key: item.key, label: item.label, tries: 0, wrong: 0 };
    }
    return state.heatmap[key];
  }

  function renderHeatmap() {
    const rows = Object.values(state.heatmap || {})
      .filter((r) => r.tries > 0)
      .sort((a, b) => (b.wrong / b.tries) - (a.wrong / a.tries))
      .slice(0, 10);

    if (rows.length === 0) {
      refs.heatmapHost.innerHTML = '<p class="feedbackMeta">Henüz veri yok. Çözdükçe burada en çok zorlanılan kalemler görünür.</p>';
      return;
    }

    refs.heatmapHost.innerHTML = rows.map((r) => {
      const pct = Math.round((r.wrong / r.tries) * 100);
      return `
        <article class="heatmapItem">
          <p><strong>Seviye ${r.level} - ${r.label}</strong></p>
          <p class="feedbackMeta">Hata: ${r.wrong}/${r.tries} (%${pct})</p>
          <div class="heatBar"><div class="heatFill" style="width:${pct}%"></div></div>
        </article>
      `;
    }).join('');
  }

  function setLeaderboardPeriod(period) {
    leaderboardPeriod = period;
    refreshLeaderboards();
  }

  async function refreshLeaderboards() {
    if (!state.profile) {
      refs.leaderboardHost.innerHTML = '<p class="feedbackMeta">Liderlik tablosu için giriş yap.</p>';
      return;
    }
    const rows = await window.MetrajBackend.fetchLeaderboards(leaderboardPeriod);
    if (!rows || rows.length === 0) {
      refs.leaderboardHost.innerHTML = '<p class="feedbackMeta">Henüz veri yok.</p>';
      return;
    }

    refs.leaderboardHost.innerHTML = rows.map((r, idx) => `
      <article class="feedbackItem">
        <p><strong>#${idx + 1} ${escapeHtml(r.nickname)}</strong></p>
        <p class="feedbackMeta">XP: ${r.total_xp} | Başarı: %${r.accuracy ?? 0}</p>
      </article>
    `).join('');
  }

  async function refreshStudentStats() {
    if (!state.profile) {
      refs.studentStatsHost.innerHTML = '<p class="feedbackMeta">Öğrenci istatistiği için giriş yap.</p>';
      return;
    }
    const stats = await window.MetrajBackend.fetchStudentStats(state.profile);
    if (!stats) {
      refs.studentStatsHost.innerHTML = '<p class="feedbackMeta">Henüz kayıt yok.</p>';
      return;
    }

    refs.studentStatsHost.innerHTML = `
      <article class="feedbackItem">
        <p><strong>${escapeHtml(stats.nickname)}</strong> (${escapeHtml(stats.student_no_masked || state.profile.studentNoMasked)})</p>
        <p class="feedbackMeta">Toplam XP: ${stats.total_xp || 0}</p>
        <p class="feedbackMeta">Oynama sayısı: ${stats.play_count || 0}</p>
        <p class="feedbackMeta">Deneme: ${stats.attempt_count || 0} | Doğru: ${stats.correct_count || 0} | Başarı: %${stats.accuracy || 0}</p>
      </article>
    `;
  }

  async function refreshExternalPanels() {
    await refreshStudentStats();
    await refreshLeaderboards();
  }

  function renderFeedback(row) {
    const formulaText = row.showFormula ? `<p class="feedbackMeta">Formül: ${row.formula}</p>` : '';
    const correctText = row.correctValue != null ? `<p class="feedbackMeta">Doğru sonuç: ${row.correctValue.toFixed(3)} m3</p>` : '';
    const breakdownText = row.breakdownHtml || '';
    refs.feedbackHost.innerHTML = `
      <article class="feedbackItem">
        <p><strong>${row.label}</strong> - <span class="${row.ok ? 'badge-ok' : 'badge-bad'}">${row.ok ? 'Doğru' : 'Yanlış'}</span></p>
        ${formulaText}
        ${correctText}
        <p class="feedbackMeta">Adım: ${row.stepText}</p>
        <p class="feedbackMeta">Geri bildirim: ${row.message}</p>
        ${breakdownText}
      </article>
    `;
  }

  function buildBreakdownHtml(item) {
    if (!item.breakdown || item.breakdown.length === 0) return '';
    const rows = item.breakdown.map((r) => `
      <tr>
        <td>${r.name}</td>
        <td>${r.adet}</td>
        <td>${r.boy.toFixed(3)}</td>
        <td>${r.en.toFixed(3)}</td>
        <td>${r.yuk.toFixed(3)}</td>
        <td>${r.total.toFixed(3)}</td>
      </tr>
    `).join('');
    const total = item.breakdown.reduce((s, r) => s + r.total, 0);
    return `
      <div class="stepInputs">
        <p class="feedbackMeta"><strong>Detaylı metraj (2 hak doldu):</strong></p>
        <table class="metraj-table">
          <thead>
            <tr><th>İşin cinsi</th><th>Adet</th><th>Boy</th><th>En</th><th>Yük.</th><th>Toplam</th></tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><td colspan="5">Genel Toplam</td><td>${total.toFixed(3)} m3</td></tr></tfoot>
        </table>
      </div>
    `;
  }

  function finishRound(baseGain) {
    const elapsed = (Date.now() - startedAt) / 1000;
    let gain = baseGain + 20;
    state.roundsPerfect += 1;
    state.streak += 1;

    if (state.streak >= 3) gain = Math.round(gain * 1.5);
    if (elapsed < 60) gain += 10;

    stopTimer();
    return gain;
  }

  function checkCurrentItem() {
    if (!currentQuestion) return;
    if (!state.profile) {
      refs.authOverlay.classList.add('show');
      return;
    }

    const item = currentQuestion.items[currentItemIndex];
    const input = document.getElementById(`input_${item.key}`);
    const status = document.getElementById(`status_${item.key}`);

    const answer = readNumberInput(input);
    const currentWrong = itemWrongAttempts[item.key] || 0;
    const answerOk = withinTolerance(answer, item.correct);
    const stepCheck = evaluateStepInputs(item, currentWrong >= 1);
    const finalOk = answerOk && stepCheck.ok;
    const isLastItem = currentItemIndex >= currentQuestion.items.length - 1;

    state.totalItems += 1;
    if (finalOk) state.correctItems += 1;

    const heat = ensureHeatEntry(currentQuestion.level, item);
    heat.tries += 1;
    if (!finalOk) heat.wrong += 1;

    let gained = 0;
    if (finalOk) {
      itemWrongAttempts[item.key] = 0;
      state.combo += 1;
      playCorrectSound(state.combo);
      gained += 10 + comboBonus();

      status.textContent = `Doğru (Kombo +${comboBonus()} XP)`;
      status.className = 'badge-ok';

      if (isLastItem) {
        gained = finishRound(gained);
        refs.result.textContent = `Tur tamamlandı. +${gained} XP`;
        if (currentQuestion.level === 1) {
          refs.levelSelect.value = '2';
          refs.result.textContent += ' | Seviye 1 tamamlandı, Seviye 2 başlatılıyor...';
          setTimeout(() => {
            if (state.profile) newQuestion();
          }, 700);
        }
      } else {
        currentItemIndex += 1;
        refs.result.textContent = `Doğru. +${gained} XP, sıradaki kaleme geçildi.`;
      }
    } else {
      itemWrongAttempts[item.key] = Math.min(2, currentWrong + 1);
      const wrongTry = itemWrongAttempts[item.key];
      state.combo = 0;
      state.streak = 0;
      playWrongSound();
      const partial = partialXpFromSteps(stepCheck);
      gained += partial;

      if (wrongTry < 2) {
        status.textContent = `Yanlış. ${wrongTry}/2 hak kullanıldı. | ${stepCheck.detail}`;
      } else {
        status.textContent = `Yanlış. 2/2 hak doldu. Detaylı çözüm aşağıda.`;
      }
      status.className = 'badge-bad';
      refs.result.textContent = wrongTry < 2
        ? `Aynı kalemden devam. +${gained} XP${partial > 0 ? ' (kısmi)' : ''}`
        : `Haklar doldu. Detaylı çözümü inceleyip aynı kalemi tekrar çöz. +${gained} XP${partial > 0 ? ' (kısmi)' : ''}`;
    }

    state.xp += gained;
    const finishedRound = finalOk && isLastItem;

    const feedbackRow = {
      label: item.label,
      ok: finalOk,
      formula: item.formula,
      correctValue: item.correct,
      stepText: `${(item.steps || []).join(' ')} ${stepCheck.detail}`,
      message: finalOk
        ? 'Hesap adımları doğru ilerlemiş görünüyor.'
        : (itemWrongAttempts[item.key] >= 2
          ? `${diagnose(item, answer)} Aşağıdaki satırları Excel metraj cetveli gibi inceleyebilirsin.`
          : 'İlk hakta sonuç gizli tutulur. Aynı kalemi bir kez daha dene.'),
      showFormula: finalOk || (!finalOk && itemWrongAttempts[item.key] >= 2),
      breakdownHtml: finalOk || itemWrongAttempts[item.key] >= 2 ? buildBreakdownHtml(item) : ''
    };

    window.MetrajBackend.recordAttempt(state.profile, {
      level: currentQuestion.level,
      itemKey: item.key,
      correct: finalOk,
      gainedXp: gained,
      combo: state.combo,
      finishedRound
    }).then(refreshExternalPanels);

    renderFeedback(feedbackRow);
    saveState();
    renderStats();
    renderHeatmap();

    if (finalOk && !isLastItem) {
      renderCurrentItem();
    }

    if (state.roundsAsked >= TARGET_ROUNDS && isLastItem) {
      refs.result.textContent += ` | 10 turluk oturum tamamlandı. Tam tur: ${state.roundsPerfect}`;
    }
  }

  function onGlobalKeyDown(ev) {
    const isCheat = ev.ctrlKey && ev.shiftKey && (ev.key === 'H' || ev.key === 'h');
    if (!isCheat || !currentQuestion) return;

    ev.preventDefault();
    applyCheatForCurrentItem();
  }

  function applyCheatForCurrentItem() {
    const item = currentQuestion.items[currentItemIndex];
    if (!item) return;

    const input = document.getElementById(`input_${item.key}`);
    if (input) input.value = item.correct.toFixed(3);

    if (refs.stepModeToggle.checked && item.stepInputs) {
      for (const s of item.stepInputs) {
        const stepInput = document.getElementById(`step_${item.key}_${s.id}`);
        if (stepInput) stepInput.value = Number(s.value).toFixed(3);
      }
    }

    checkCurrentItem();
    refs.result.textContent += ' | Hile: otomatik doğru dolduruldu.';
  }
})();
