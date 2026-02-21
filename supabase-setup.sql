-- ============================================
-- Metraj Ustasi - Supabase Veritabani Kurulumu
-- Bu SQL'i Supabase Dashboard > SQL Editor'de calistir
-- ============================================

-- 1. PLAYERS TABLOSU
create table if not exists players (
  student_no_hash text primary key,
  student_no_masked text,
  nickname text not null,
  play_count integer default 0,
  total_xp integer default 0,
  correct_count integer default 0,
  attempt_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ATTEMPTS TABLOSU
create table if not exists attempts (
  id bigint generated always as identity primary key,
  student_no_hash text not null references players(student_no_hash),
  nickname text,
  level integer,
  item_key text,
  correct boolean default false,
  gained_xp integer default 0,
  combo integer default 0,
  finished_round boolean default false,
  created_at timestamptz default now()
);

-- 3. INDEX'LER (performans)
create index if not exists idx_attempts_hash on attempts(student_no_hash);
create index if not exists idx_attempts_created on attempts(created_at);

-- 4. OGRENCI ISTATISTIK GORUNUMU
create or replace view player_stats as
select
  p.student_no_hash,
  p.student_no_masked,
  p.nickname,
  p.play_count,
  p.total_xp,
  p.attempt_count,
  p.correct_count,
  case when p.attempt_count > 0
    then round((p.correct_count::numeric / p.attempt_count) * 100)
    else 0
  end as accuracy
from players p;

-- 5. GUNLUK LIDERLIK TABLOSU
create or replace view leaderboard_daily as
select
  a.nickname,
  sum(a.gained_xp) as total_xp,
  count(*) as attempts,
  count(*) filter (where a.correct) as correct,
  case when count(*) > 0
    then round((count(*) filter (where a.correct))::numeric / count(*) * 100)
    else 0
  end as accuracy
from attempts a
where a.created_at >= date_trunc('day', now())
group by a.student_no_hash, a.nickname
order by total_xp desc
limit 20;

-- 6. HAFTALIK LIDERLIK TABLOSU
create or replace view leaderboard_weekly as
select
  a.nickname,
  sum(a.gained_xp) as total_xp,
  count(*) as attempts,
  count(*) filter (where a.correct) as correct,
  case when count(*) > 0
    then round((count(*) filter (where a.correct))::numeric / count(*) * 100)
    else 0
  end as accuracy
from attempts a
where a.created_at >= date_trunc('week', now())
group by a.student_no_hash, a.nickname
order by total_xp desc
limit 20;

-- 7. AYLIK LIDERLIK TABLOSU
create or replace view leaderboard_monthly as
select
  a.nickname,
  sum(a.gained_xp) as total_xp,
  count(*) as attempts,
  count(*) filter (where a.correct) as correct,
  case when count(*) > 0
    then round((count(*) filter (where a.correct))::numeric / count(*) * 100)
    else 0
  end as accuracy
from attempts a
where a.created_at >= date_trunc('month', now())
group by a.student_no_hash, a.nickname
order by total_xp desc
limit 20;

-- 8. ROW LEVEL SECURITY (RLS)
alter table players enable row level security;
alter table attempts enable row level security;

-- Herkes okuyabilir (liderlik tablosu icin)
create policy "Players okuma" on players for select using (true);
-- Herkes kendi kaydini ekleyip guncelleyebilir
create policy "Players yazma" on players for insert with check (true);
create policy "Players guncelleme" on players for update using (true);

-- Herkes denemeleri okuyabilir (liderlik tablosu icin)
create policy "Attempts okuma" on attempts for select using (true);
-- Herkes deneme ekleyebilir
create policy "Attempts yazma" on attempts for insert with check (true);
