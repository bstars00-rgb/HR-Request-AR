-- =============================================================
-- 마이그레이션: 국가별 기본 연차 기능 추가
-- 이미 운영 중인 Supabase 프로젝트에서 "한 번만" 실행하세요.
-- (Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN)
-- 재실행해도 안전합니다.
-- =============================================================

-- 1) 직원 테이블에 국가 컬럼 추가
alter table employees add column if not exists country text default '한국';

-- 2) 국가별 기본 연차 테이블
create table if not exists countries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_annual_leave numeric not null default 15
);

-- 3) RLS (1차: 전체 허용)
alter table countries enable row level security;
do $$
begin
  create policy "v1 open countries" on countries for all using (true) with check (true);
exception when duplicate_object then null;
end $$;

-- 4) 기본 국가 값 (원하는 대로 이후 화면에서 수정 가능)
insert into countries (name, default_annual_leave) values
  ('한국', 15),
  ('베트남', 12),
  ('싱가포르', 14),
  ('기타', 15)
on conflict (name) do nothing;

-- 5) 실시간 동기화에 countries 테이블 등록
do $$
begin
  alter publication supabase_realtime add table countries;
exception when duplicate_object then null;
end $$;
