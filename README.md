# OMH Planner (팀 일정 공유 플랫폼)

팀의 **박람회/세일즈콜·출장·내부업무·개인 일정**을 Excel 대신 웹에서
등록하고 한눈에 공유하는 사내 플랫폼입니다.

- **Frontend**: Next.js 15 (App Router) + React 19 + TailwindCSS
- **다국어**: 한국어 / English 토글 (좌측 하단)
- **테마**: 라이트 / 다크 모드 토글 (시스템 설정 자동 감지)
- **데이터**: 환경변수가 있으면 **Supabase 공유 DB**, 없으면 **브라우저 localStorage** 로 자동 동작
- **배포**: GitHub Pages (정적 export, GitHub Actions 자동 배포)
- **반응형**: PC / 모바일 모두 대응

배포 주소(설정 완료 시): **https://bstars00-rgb.github.io/HR-Request-AR/**

---

## 1. 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

별도 DB·계정 없이 바로 동작합니다(localStorage 모드). 최초 실행 시 **샘플 데이터**가 자동 주입됩니다.

---

## 2. 화면 구성

| 메뉴 | 기능 |
|------|------|
| **대시보드** | 오늘/이번주/이번달 일정, 자리 비움 현황, 팀·유형별 집계 |
| **캘린더** (허브) | 월간 그리드. **날짜 클릭 = 일정 등록, 일정 클릭 = 수정/삭제**. 팀·구성원·유형 필터, 유형별 색상, 인쇄, CSV 내보내기, 박람회(초록)·공휴일(회색) 배지 |
| **구성원** | 멤버 추가/수정/삭제, 팀/직급/상태/이름 필터, CSV 내보내기 |
| **팀 현황** | 팀별 인원·일정 요약 |
| **설정** | 팀 관리(추가/삭제/매니저), 공휴일 관리, 편집 잠금 PIN, 데이터 저장소 상태 |

> 일정 카테고리: **박람회/세일즈콜(Fair) · 출장(Trip) · 내부업무(Internal) · 개인(Personal) · 기타(Other)**.
> 휴가 등 *승인*은 Teams(AR)에서 진행하며, 이 툴은 **가시성(누가·언제·어디서·무엇)** 을 담당합니다.

---

## 3. 배포 (GitHub Pages) — 한 번만 설정하면 자동

이 저장소: `https://github.com/bstars00-rgb/HR-Request-AR`

### ① 코드 푸시
```bash
git add .
git commit -m "HR leave platform"
git branch -M main
git remote add origin https://github.com/bstars00-rgb/HR-Request-AR.git
git push -u origin main
```

### ② GitHub Pages 활성화
저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 선택.

이후 `main` 에 푸시할 때마다 `.github/workflows/deploy.yml` 가 자동으로 빌드 → 배포합니다.
잠시 후 **https://bstars00-rgb.github.io/HR-Request-AR/** 에서 접속됩니다.

> ⚠️ 저장소 이름이 `HR-Request-AR` 이라는 전제로 `next.config.js` 의 `basePath = /HR-Request-AR` 가 설정돼 있습니다.
> 저장소 이름을 바꾸면 `next.config.js` 의 `repo` 값도 같이 바꿔야 합니다.

---

## 4. 개발 없이 공유 DB 사용하기 (Supabase) — 핵심

GitHub Pages 는 정적 호스팅이라 서버가 없습니다. 모든 직원이 **같은 데이터**를 보려면
무료 **Supabase**(클라우드 PostgreSQL)에 연결합니다. 코딩은 필요 없고, 아래 클릭 몇 번이면 됩니다.

1. [supabase.com](https://supabase.com) 가입 → **New Project** 생성 (무료)
2. 좌측 **SQL Editor** → `supabase/schema.sql` 전체 복붙 → **RUN**
   (테이블 + 샘플 데이터가 한 번에 생성됩니다)
3. 좌측 **Project Settings → API** 에서 두 값 복사:
   - **Project URL**
   - **anon public** key (브라우저 공개용 키 — RLS 로 보호됨)
4. GitHub 저장소 **Settings → Secrets and variables → Actions → New repository secret** 에 등록:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (anon public key)
5. **Actions** 탭에서 워크플로우를 다시 실행(Re-run) 하거나 아무 커밋이나 푸시

→ 이제 사이트가 Supabase 에 연결되어 **모든 직원이 같은 데이터**를 보고 함께 수정합니다.
설정 페이지 상단에 "Supabase 공유 DB (연결됨)" 이 표시됩니다.

> Secret 을 등록하지 않으면 앱은 자동으로 localStorage 모드(각자 브라우저 저장)로 동작하므로,
> Supabase 설정 전에도 사이트는 정상적으로 열립니다.

### 로컬에서 Supabase 모드로 테스트하려면
`.env.local.example` 를 `.env.local` 로 복사하고 두 값을 채운 뒤 `npm run dev`.

---

## 5. 연차 계산 규칙

```
잔여 연차 = 기본 연차 + 이월 연차 - 승인(Approved)된 사용 연차
```

- **Approved** 상태만 사용 연차에 반영
- 휴가 유형별 **연차 차감 여부** 설정 (Sick / Business Trip / Public Holiday 등 기본 미차감)
- **반차 = 0.5일**
- 주말·공휴일은 설정에 따라 **자동 제외** (설정 변경 시 전체 재계산)

---

## 6. 폴더 구조

```
src/
  app/                  # 대시보드/캘린더/직원/휴가/팀/설정 페이지
  components/            # Sidebar(테마·언어 토글), UI, chips, LeaveForm
  lib/
    types.ts            # 데이터 모델 (DB 스키마와 1:1)
    date.ts             # 날짜 유틸 (언어별 포맷)
    leave-calc.ts       # 연차 계산 로직
    store.tsx           # 데이터 계층 — Supabase / localStorage 자동 전환 ★
    i18n.tsx            # 한/영 사전 + Provider
    theme.tsx           # 다크/라이트 Provider
    supabaseClient.ts   # Supabase 클라이언트 (env 있을 때만 생성)
    seed.ts             # 샘플 데이터
supabase/schema.sql     # PostgreSQL 스키마 + 샘플 + RLS
.github/workflows/deploy.yml  # GitHub Pages 자동 배포
```

---

## 7. 확장 로드맵 (2차)

- [ ] 로그인 / 권한 관리 (Supabase Auth — `role` 컬럼 준비됨: admin/manager/staff)
- [ ] 승인 워크플로우 (현재 status 필드로 기반 마련)
- [ ] Excel Import / Export
- [ ] Slack / Teams / 이메일 알림
- [ ] Google Calendar 연동
```
