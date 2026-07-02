-- =============================================================
-- 연차관리 플랫폼 — Supabase / PostgreSQL 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN 하면
-- 테이블 + 샘플 데이터가 생성됩니다.
-- (요청 5. 데이터 구조와 1:1 매핑)
-- =============================================================

-- 확장: UUID 생성용
create extension if not exists "pgcrypto";

-- ---------- Teams ----------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  manager_name text default '',
  warning_threshold int not null default 3,
  notes text default ''
);

-- ---------- LeaveTypes ----------
create table if not exists leave_types (
  id uuid primary key default gen_random_uuid(),
  leave_type_name text not null unique,
  deduct_from_annual_leave boolean not null default true,
  color_code text not null default '#2563eb',
  notes text default ''
);

-- ---------- Employees ----------
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  english_name text default '',
  team text not null,
  position text not null default 'Staff',
  join_date date,
  annual_leave_entitlement numeric not null default 15,
  carried_over_leave numeric not null default 0,
  used_adjustment numeric not null default 0,        -- 시스템 도입 전 이미 사용한 연차
  employment_status text not null default '재직',
  role text not null default 'staff',          -- 확장: admin / manager / staff
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- LeaveRequests ----------
create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  team text not null,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  days_count numeric not null default 0,
  half_day_type text not null default 'none',   -- none / AM / PM
  reason text default '',
  status text not null default 'Approved',       -- Pending / Approved / Rejected / Cancelled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leave_requests_employee on leave_requests(employee_id);
create index if not exists idx_leave_requests_dates on leave_requests(start_date, end_date);
create index if not exists idx_leave_requests_team on leave_requests(team);

-- ---------- Holidays ----------
create table if not exists holidays (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  country text default '한국',
  holiday_name text not null,
  applicable_team text default 'ALL',
  notes text default ''
);

-- ---------- App Settings (단일 행) ----------
create table if not exists app_settings (
  id text primary key default 'singleton',
  exclude_weekends boolean not null default true,
  exclude_holidays boolean not null default true,
  default_annual_leave numeric not null default 15
);

-- =============================================================
-- RLS (Row Level Security)
--   1차 버전: 사내 공유용 — anon 키로 전체 read/write 허용.
--   2차 권한 도입 시 아래 정책을 role 기반으로 교체.
-- =============================================================
alter table teams enable row level security;
alter table leave_types enable row level security;
alter table employees enable row level security;
alter table leave_requests enable row level security;
alter table holidays enable row level security;
alter table app_settings enable row level security;

-- 1차: 모두 허용 (확장 시 이 정책만 교체)
create policy "v1 open teams"        on teams           for all using (true) with check (true);
create policy "v1 open leave_types"  on leave_types     for all using (true) with check (true);
create policy "v1 open employees"    on employees       for all using (true) with check (true);
create policy "v1 open leaves"       on leave_requests  for all using (true) with check (true);
create policy "v1 open holidays"     on holidays        for all using (true) with check (true);
create policy "v1 open settings"     on app_settings    for all using (true) with check (true);

-- =============================================================
-- Realtime — 변경사항을 접속 중인 모든 사용자에게 즉시(새로고침 없이) 전파
--   재실행해도 오류 없이 안전 (이미 추가돼 있으면 무시)
-- =============================================================
do $$
begin
  alter publication supabase_realtime add table
    employees, leave_requests, holidays, teams, leave_types, app_settings;
exception when duplicate_object then null;
end $$;

-- =============================================================
-- 샘플 데이터
-- =============================================================
insert into leave_types (leave_type_name, deduct_from_annual_leave, color_code, notes) values
  ('Annual Leave',    true,  '#2563eb', '일반 연차'),
  ('Half-day Leave',  true,  '#0ea5e9', '반차 0.5일'),
  ('Sick Leave',      false, '#dc2626', '병가 (기본 미차감)'),
  ('Unpaid Leave',    false, '#ea580c', '무급 휴가'),
  ('Business Trip',   false, '#7c3aed', '출장 (미차감)'),
  ('Public Holiday',  false, '#64748b', '공휴일'),
  ('Other',           false, '#9333ea', '기타')
on conflict (leave_type_name) do nothing;

insert into teams (team_name, manager_name, warning_threshold) values
  ('OP', '김운영', 3),
  ('CT', '이씨티', 2),
  ('Sales', '박세일', 3),
  ('GSM', '최지에스', 2),
  ('Air', '정에어', 2),
  ('Management', '대표', 1)
on conflict (team_name) do nothing;

insert into employees (name, english_name, team, position, join_date, annual_leave_entitlement, carried_over_leave, employment_status, role) values
  ('김운영','Kim Operations','OP','Manager','2021-01-15',15,3,'재직','manager'),
  ('한지훈','Han Jihoon','OP','Senior','2022-02-15',15,1,'재직','staff'),
  ('서다은','Seo Daeun','OP','Staff','2023-03-15',15,0,'재직','staff'),
  ('이씨티','Lee CT','CT','Manager','2021-01-15',15,3,'재직','manager'),
  ('오민재','Oh Minjae','CT','Senior','2022-02-15',15,1,'재직','staff'),
  ('유나래','Yu Narae','CT','Staff','2023-03-15',15,0,'재직','staff'),
  ('박세일','Park Sales','Sales','Manager','2021-01-15',15,3,'재직','manager'),
  ('강도윤','Kang Doyoon','Sales','Senior','2022-02-15',15,1,'재직','staff'),
  ('임수빈','Im Subin','Sales','Staff','2023-03-15',15,0,'재직','staff'),
  ('최지에스','Choi GSM','GSM','Manager','2021-01-15',15,3,'재직','manager'),
  ('신예린','Shin Yerin','GSM','Senior','2022-02-15',15,1,'재직','staff'),
  ('권태호','Kwon Taeho','GSM','Staff','2023-03-15',15,0,'재직','staff'),
  ('정에어','Jung Air','Air','Manager','2021-01-15',15,3,'재직','manager'),
  ('남기현','Nam Kihyun','Air','Senior','2022-02-15',15,1,'재직','staff'),
  ('조하늘','Cho Haneul','Air','Staff','2023-03-15',15,0,'재직','staff'),
  ('대표','CEO','Management','Director','2021-01-15',15,3,'재직','admin'),
  ('문비서','Moon Secretary','Management','Senior','2022-02-15',15,1,'재직','staff'),
  ('백재무','Baek Finance','Management','Staff','2023-03-15',15,0,'재직','staff')
on conflict do nothing;

insert into holidays (date, country, holiday_name, applicable_team) values
  ('2026-01-01','한국','신정','ALL'),
  ('2026-02-17','베트남','Tết (설)','ALL'),
  ('2026-04-30','베트남','통일기념일','ALL'),
  ('2026-05-01','싱가포르','Labour Day','ALL'),
  ('2026-08-09','싱가포르','National Day','ALL'),
  ('2026-09-25','한국','추석','ALL')
on conflict do nothing;

insert into app_settings (id, exclude_weekends, exclude_holidays, default_annual_leave)
values ('singleton', true, true, 15)
on conflict (id) do nothing;
