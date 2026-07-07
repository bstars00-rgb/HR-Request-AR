-- =============================================================
-- 마이그레이션: 연차관리 → 일정 공유 플랫폼 전환
-- 기존 데이터의 옛 휴가 유형을 새 카테고리로 변환합니다.
-- (Supabase 대시보드 > SQL Editor 에 붙여넣고 RUN. 재실행해도 안전)
--
-- 새 카테고리:
--   Fair     = 박람회/세일즈콜
--   Trip     = 출장
--   Internal = 내부업무/OKR
--   Personal = 개인/휴가
--   Other    = 기타
-- =============================================================

update leave_requests set leave_type = 'Personal'
  where leave_type in ('Annual Leave', 'Half-day Leave', 'Sick Leave', 'Unpaid Leave');

update leave_requests set leave_type = 'Trip'
  where leave_type = 'Business Trip';

update leave_requests set leave_type = 'Other'
  where leave_type in ('Public Holiday', 'Other');

-- (선택) 옛 테스트 일정을 전부 지우고 새로 시작하려면 아래 주석을 해제해 실행:
-- truncate table leave_requests;
