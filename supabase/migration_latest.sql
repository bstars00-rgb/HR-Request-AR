-- =============================================================
-- 통합 마이그레이션 (최신) — 기존 Supabase 프로젝트에서 "한 번만" 실행
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. 재실행해도 안전합니다.
-- 이미 일부를 실행했어도 IF NOT EXISTS 라 문제 없습니다.
-- =============================================================

-- 1) 직원별 "이미 사용한 연차(도입 전)"
alter table employees
  add column if not exists used_adjustment numeric not null default 0;

-- 2) 편집 잠금 PIN
alter table app_settings
  add column if not exists admin_pin text default '';
