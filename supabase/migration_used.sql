-- =============================================================
-- 마이그레이션: "이미 사용한 연차(도입 전)" 필드 추가
-- 이미 운영 중인 Supabase 프로젝트에서 "한 번만" 실행하세요.
-- (Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. 재실행해도 안전)
-- =============================================================

alter table employees
  add column if not exists used_adjustment numeric not null default 0;
