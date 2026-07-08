# HR Management (OMH Planner) 이관 문서 (OPS → CEO Office)
> 작성일: 2026-07-08 · 작성: Claude Code (본 프로젝트 전 과정 개발 이력 기반)
> 이 문서 하나로 프로젝트를 처음 보는 담당자가 목적·상태를 이해하고 바로 이어서 작업할 수 있도록 작성됨.

## 1. 프로젝트명
- **OMH Planner** (폴더명: `HR Management`, 저장소명: `HR-Request-AR`)
- 명칭 이력: "연차관리 플랫폼"으로 시작 → 파일럿 중 **팀 일정 공유 플랫폼**으로 전환(pivot)하며 OMH Planner로 리브랜딩

## 2. 프로젝트 목적
팀의 **박람회/세일즈콜 · 출장 · 내부업무 · 개인 일정**을 엑셀 대신 웹에서 등록하고 한눈에 공유하는 사내 플랫폼.
- 휴가 등 **승인은 Teams(AR)** 로 그대로 진행 — 이 툴은 **가시성(누가 언제 어디서 뭘 하는지)** 담당
- 파일럿 대상: 베트남 컨텐츠팀 + OP팀

## 3. 현재 진행 상태
✅ **운영 중 (배포 완료, 실사용 단계)**
- 배포 주소: **https://bstars00-rgb.github.io/HR-Request-AR/**
- main 브랜치 push → GitHub Actions 자동 빌드·배포
- Supabase 공유 DB 연결 → 전 사용자 실시간 동일 데이터
- git 상태: **로컬 = 원격 완전 동기화** (2026-07-08 기준, 미푸시 커밋 없음)

## 4. 주요 기능
| 화면 | 기능 |
|---|---|
| 대시보드 | 오늘/이번주/이번달 일정, 자리 비움 현황, 팀·유형별 집계 |
| 캘린더 (허브) | **날짜 클릭=일정 등록, 일정 클릭=수정/삭제**, 팀·구성원·유형 필터, 인쇄, CSV 내보내기, 박람회(초록)·공휴일(회색) 배지 |
| 구성원 | 멤버 추가/수정/삭제, CSV 내보내기 |
| 팀 현황 | 팀별 인원·일정 요약 |
| 설정 | 팀 관리(추가/삭제/매니저), 공휴일 관리, **편집 잠금 PIN**, 데이터 저장소 상태 표시 |
- 공통: 한/영 토글, 다크모드, 실시간 동기화(Supabase Realtime), 반응형(모바일 지원)

## 5. 기술 스택
- **Frontend**: Next.js 15 (App Router, 정적 export) + React 19 + TailwindCSS 3 + TypeScript
- **DB**: Supabase (PostgreSQL + Realtime) — 환경변수 없으면 localStorage 모드로 자동 폴백
- **배포**: GitHub Pages + GitHub Actions (`.github/workflows/deploy.yml`)
- 요구 환경: Node 20+ / npm

## 6. 폴더 구조
```
src/
  app/            # 페이지: /(대시보드) /calendar /employees /teams /settings
  components/     # Sidebar(테마·언어·잠금), ui.tsx, chips.tsx, LeaveForm.tsx(일정 폼)
  lib/
    store.tsx     # ★ 유일한 데이터 계층 — Supabase/localStorage 자동 전환 + Realtime
    types.ts      # 데이터 모델 (카테고리·팀·색상)
    leave-calc.ts # 일수 계산 (주말/공휴일 제외, FAIR 배지는 제외 안 함)
    i18n.tsx      # 한/영 사전
    theme.tsx     # 다크모드
    fairs.json    # ★ 2026 박람회 32개 단일 소스
    seed.ts       # 로컬 모드 샘플 데이터
    csv.ts        # CSV 내보내기(한글 안 깨지게 BOM 포함)
supabase/
  schema.sql              # 전체 스키마+RLS+샘플 (새 DB 구축 시 이것만 실행)
  migration_*.sql         # 운영 DB에 이미 적용된 마이그레이션 이력 (참고용)
  fairs_2026.sql          # 박람회 108행 (재실행 안전)
docs/USER_GUIDE.md / .docx  # 사용 설명서 (한/영/베트남어)
.github/workflows/deploy.yml # 자동 배포 워크플로우
.claude/launch.json          # dev 서버 설정 (npm run dev, port 3000)
.env.local.example           # 로컬 Supabase 연결용 환경변수 양식
```

## 7. 주요 파일 설명
- `src/lib/store.tsx` — **모든 데이터 로직의 중심.** CRUD·실시간 구독·편집잠금·연말이월. 데이터 관련 수정은 이 파일만 보면 됨.
- `src/lib/fairs.json` — 박람회 일정 단일 소스. 날짜 변경 시 이 파일 수정 → `supabase/fairs_2026.sql` 재생성 → Supabase에서 실행.
- `supabase/schema.sql` — CEO Office가 **자체 Supabase를 새로 만들 경우** 이것 하나만 SQL Editor에서 실행하면 됨.
- `docs/USER_GUIDE.docx` — 직원 배포용 설명서 (한/영/베 3개 언어).
- `README.md` — 설치·배포·Supabase 전환 방법 문서화 완료.

## 8. 실행 방법
```bash
npm install
npm run dev        # http://localhost:3000 (환경변수 없이도 localStorage 모드로 즉시 동작)
npm run build      # 정적 export → out/ (타입체크 포함)
```
- Supabase 모드 로컬 테스트: `.env.local.example`을 `.env.local`로 복사해 두 키 입력 후 dev 실행

## 9. 환경변수 / 설정값 (⚠️ 값은 이 문서에 없음 — 별도 전달 필요)
| 키 | 용도 | 현재 위치 | 값 얻는 곳 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | GitHub 저장소 Settings → Secrets → Actions | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개(anon) 키 | 〃 | 〃 |
- 로컬 `.env.local`은 현재 PC에 **없음(정상)** — 배포는 GitHub Secrets로만 주입됨
- 앱 내 설정: **편집 잠금 PIN** (Supabase `app_settings.admin_pin` 컬럼) — 현 담당자(OPS)에게 확인 또는 설정 화면에서 재설정

## 10. 외부 서비스 연동
| 서비스 | 내용 | 계정 소유 |
|---|---|---|
| **GitHub** | `https://github.com/bstars00-rgb/HR-Request-AR` — 코드 + Pages 호스팅 + Actions 자동배포 | **OPS (bstars00-rgb)** |
| **Supabase** | 프로젝트 "OAC AI CRM" 내 테이블 사용 (`dxhafnzbfmefrrpexmog.supabase.co`) — 무료 플랜 | **OPS 개인 Supabase 계정** |
- DB 테이블: `employees, leave_requests, holidays, teams, leave_types, app_settings` (+RLS 전체 허용, Realtime publication 등록됨)
- 그 외 외부 API 연동: 없음

## 11. 완료된 작업 (개발 이력 요약)
1. 연차관리 MVP 구축 (직원/휴가/공휴일 CRUD, 대시보드, 캘린더, 잔여연차 자동계산)
2. 한/영 다국어 + 다크모드
3. GitHub Pages 정적 배포 + Actions 자동화
4. Supabase 공유 DB 연결 + **실시간 동기화** (타이핑 덮어쓰기 버그 수정 포함)
5. 팀 동적 관리(추가/삭제), 편집 잠금 PIN, CSV 내보내기, 캘린더 인쇄, 잔여 초과 경고, 연말 이월
6. **일정 공유 플랫폼으로 전환** — 카테고리 체계(박람회/출장/내부/개인/기타), 화면 전면 개편
7. "내 일정"을 캘린더로 통합 (날짜 클릭 등록, 일정 클릭 수정/삭제)
8. OMH Planner 리브랜딩, 불필요 필드 정리(입사일·경고기준 제거)
9. 2026 여행 박람회 32개 캘린더 배지 반영 (fairs.json + SQL)
10. 사용 설명서 3개 언어(한/영/베) MD+Word 작성

## 12. 미완료 작업
- [ ] **개인 일정 엑셀 가져오기** — cb_park의 SharePoint 엑셀(내 일정) 반영 요청이 있었으나 링크 403(사내 인증 필요)으로 보류. 파일을 로컬 다운로드 받아 전달하면 일괄 등록 SQL로 처리 가능.
- [ ] 날짜 미정 박람회 4개 (MATTA Fair KL, WTM Africa, COTTM Beijing, VITM Hanoi) — 날짜 확정 시 `fairs.json`에 추가
- [ ] (선택, 2차 로드맵) 로그인/권한(role 컬럼 준비됨), Teams 알림, 주간 보기, Excel 일괄 import UI

## 13. CEO Office 계정에서 이어서 해야 할 다음 작업
1. **GitHub 저장소 이관**: 저장소 Settings → Danger Zone → **Transfer ownership** (bstars00-rgb → CEO Office 계정/조직)
2. **Actions Secrets 재등록**: Transfer 시 Secrets는 이전되지 않음 → §9의 두 키를 새 저장소 Settings → Secrets → Actions에 재입력 → Actions 재실행
3. **Pages 재활성화 + URL 재공지**: 새 주소는 `<새계정>.github.io/HR-Request-AR/` — Settings → Pages → Source = GitHub Actions 확인, 직원들에게 새 링크 공지 (저장소명을 유지하면 코드 수정 불필요; 저장소명 변경 시 `next.config.js`의 `repo` 값 수정)
4. **Supabase 접근 확보** (둘 중 택1):
   - A. OPS Supabase 조직에 CEO Office 이메일 초대 (Supabase → Settings → Team) — 데이터 그대로 유지, 가장 간단
   - B. CEO Office 명의 신규 Supabase 프로젝트 생성 → `supabase/schema.sql` 실행 → 기존 데이터는 CSV 내보내기로 이전 → 새 URL/키를 Secrets에 등록
5. **편집 잠금 PIN 인수** (또는 설정 화면에서 재설정)
6. 로컬 개발 환경: 이 폴더 전체 복사(또는 새 계정에서 `git clone`) 후 `npm install`

## 14. 필수 파일 점검 결과 (2026-07-08 실사)
- [x] README.md (설치·배포·DB 전환 문서화)
- [x] handover.md (본 문서)
- [x] .env.local.example (환경변수 양식)
- [x] package.json / package-lock.json (의존성 고정)
- [x] next.config.js (basePath 등 배포 설정)
- [x] supabase/schema.sql (신규 DB 구축용) + fairs_2026.sql
- [x] docs/USER_GUIDE.md + .docx (3개 언어 설명서)
- [x] .github/workflows/deploy.yml (자동 배포)
- [x] .claude/launch.json (dev 서버 설정)
- [x] 샘플 데이터 (src/lib/seed.ts — 로컬 모드 자동 주입)
- **누락 파일: 없음.** 단, ⚠️ **Supabase 키 값과 편집 잠금 PIN은 파일로 존재하지 않으므로 담당자 간 별도 전달 필요.**

## 15. 정리 필요 항목 (삭제하지 않고 표시만 — 이관 후 CEO Office 판단)
| 항목 | 상태 | 권장 |
|---|---|---|
| `src/lib/supabase.ts` | 초기 스텁, 현재 미사용 (`supabaseClient.ts`가 실사용) | 삭제 가능 |
| `supabase/migration_*.sql` 4개 | 운영 DB에 **이미 적용 완료**된 이력 | 참고용 보관 (새 DB는 schema.sql만 사용) |
| `.next/`, `out/`, `node_modules/` | 빌드 산출물 (git 미포함) | 복사 불필요, 새 환경에서 재생성 |
| `docs/USER_GUIDE.md` vs `.docx` | 동일 내용 2개 포맷 | 중복 아님 — MD는 GitHub 열람용, docx는 배포용 |

## 16. 이관 준비 체크리스트
- [x] 코드 전체 GitHub 푸시 (로컬=원격 동일)
- [x] 문서 완비 (README / 사용설명서 3개 언어 / handover.md)
- [x] DB 스키마 SQL 완비 (신규 구축 가능)
- [x] 필수 파일 누락 점검 완료 (누락 없음)
- [ ] GitHub 저장소 Transfer 실행 ← **CEO Office 계정명 확정 필요**
- [ ] Actions Secrets 재등록 (Transfer 후)
- [ ] Supabase 접근 권한 부여 (초대 또는 신규+데이터 이전)
- [ ] 편집 잠금 PIN 전달
- [ ] 새 배포 URL 직원 공지

## 17. 리스크 / 주의사항
1. **⚠️ Pages URL 변경**: 계정 이관 시 배포 주소가 바뀜 → 기존 공유 링크 전부 무효. 직원 재공지 필수.
2. **⚠️ Actions Secrets 미이전**: Transfer해도 Secrets는 안 넘어감 → 재등록 전 배포본은 공유 DB에 안 붙고 localStorage 모드로 동작 (사이트는 열리지만 데이터 공유 안 됨).
3. **⚠️ Supabase는 GitHub와 별개 소유**: 저장소만 옮기면 DB는 여전히 OPS 개인 계정. **무료 플랜은 7일 미접속 시 자동 일시정지** → 방치하면 서비스 중단. §13-4를 반드시 수행.
4. **RLS 전체 허용(v1 설계)**: anon 키만 있으면 읽기/쓰기 가능 (사내 공유 전제). 링크 외부 유출 시 데이터 조작 가능 — 2차에서 Supabase Auth 도입 권장.
5. **이관 전 백업 권장**: 구성원/캘린더 화면의 CSV 내보내기로 데이터 백업본 확보.
6. Supabase 프로젝트 "OAC AI CRM"은 이름과 달리 **이 플랫폼의 DB를 겸용** 중 — 다른 용도로 삭제/정리하지 말 것.
