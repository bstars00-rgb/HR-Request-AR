-- =============================================================
-- 마이그레이션: 편집 잠금 PIN 기능 추가
-- 이미 운영 중인 Supabase 프로젝트에서 "한 번만" 실행하세요.
-- (Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. 재실행해도 안전)
-- =============================================================

alter table app_settings
  add column if not exists admin_pin text default '';
