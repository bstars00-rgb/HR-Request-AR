# 연차관리 플랫폼 사용 설명서 · User Guide · Hướng dẫn sử dụng

**URL:** https://bstars00-rgb.github.io/HR-Request-AR/

언어 선택 · Choose language · Chọn ngôn ngữ:
- [🇰🇷 한국어](#-한국어)
- [🇬🇧 English](#-english)
- [🇻🇳 Tiếng Việt](#-tiếng-việt)

> 참고 / Note: 휴가 **승인은 기존대로 Teams(AR)** 에서 진행합니다. 이 도구는 승인된 휴가를 등록해 **현황을 공유·확인**하는 용도입니다.
> Leave **approval stays in Teams (AR)**. This tool is for logging approved leave and sharing visibility.
> Việc **phê duyệt nghỉ phép vẫn thực hiện trên Teams (AR)**. Công cụ này để ghi nhận và xem lịch nghỉ đã duyệt.

---

## 🇰🇷 한국어

### 1. 접속
- 브라우저에서 **https://bstars00-rgb.github.io/HR-Request-AR/** 접속. 설치·회원가입 없음.
- PC·모바일 모두 사용 가능.

### 2. 언어 / 화면 모드
- 왼쪽 아래 **`EN / 한`** 버튼으로 한국어↔영어 전환.
- **달/해 아이콘**으로 다크/라이트 모드 전환.

### 3. 화면 소개
| 메뉴 | 내용 |
|------|------|
| **대시보드** | 오늘/이번주/이번달 휴가자, 팀별 인원, 잔여 연차 적은 순, 동시 휴가 경고 |
| **캘린더** | 월간 달력. 팀·직원·유형별 필터, 유형별 색상. **인쇄** 버튼으로 출력 |
| **직원 관리** | 직원 목록·연차 현황. **내보내기(CSV)** 로 엑셀 다운로드 |
| **휴가 등록** | 휴가 등록/수정, 직원별 이력 조회, 유형별 사용량 |
| **팀 현황** | 팀별 인원·잔여 연차·예정 휴가 |
| **설정** | (관리자) 연차 기준, 팀·공휴일, 편집 잠금, 연말 이월 |

### 4. 자주 하는 일

**내 휴가 확인하기**
1. **휴가 등록** 메뉴 → 상단 **직원 선택** 에서 본인 이름 선택
2. 내 휴가 이력(언제·유형·일수)과 **사용/잔여 연차**가 표시됩니다.

**휴가 등록하기** (편집 권한 필요)
1. **휴가 등록** → 우측 상단 **+ 휴가 등록**
2. 직원 / 유형 / 시작일·종료일 / 반차 / 상태 / 사유 입력
3. **예상 사용 일수** 확인 → 잔여 초과 시 ⚠️ 경고 → **휴가 등록**

**휴가 유형**: Annual(연차) · Half-day(반차 0.5일) · Sick(병가) · Unpaid(무급) · Business Trip(출장) · Public Holiday(공휴일) · Other

**엑셀로 내보내기**: 직원 관리 또는 휴가 등록 화면의 **내보내기(CSV)** 버튼 → 엑셀에서 열림.

**캘린더 인쇄**: 캘린더 화면 우측 상단 **인쇄** → 사이드바 없이 달력만 출력.

### 5. 잔여 연차 계산
```
잔여 = 기본 연차 + 이월 − (이미 사용한 연차 + 앱에 등록된 승인 휴가)
```
- **반차 = 0.5일**, 주말·공휴일은 자동 제외(설정에 따름)
- 병가·출장·공휴일은 기본적으로 연차 차감 안 함

### 6. 관리자용 (HR)
- **편집 잠금**: 설정에서 **PIN**을 정하면, 이후 편집하려면 왼쪽 아래 **잠금 해제**로 PIN 입력 필요. (실수 삭제 방지) PIN이 비어 있으면 누구나 편집 가능.
- **직원 추가/수정**: 직원 관리 → **+ 직원 추가**. **이미 사용한 연차(도입 전)** 칸에 상반기 사용일수를 넣으면 잔여가 맞춰집니다.
- **팀 관리**: 설정 → 팀 추가/삭제·매니저·경고 기준.
- **공휴일**: 설정 → 국가별 공휴일 등록.
- **연말 이월**: 설정 → 연말 이월 처리(잔여를 다음 해 이월로, 그 해 기록 초기화). **되돌릴 수 없으니 먼저 내보내기로 백업**하세요.

### 7. 자주 묻는 질문
- **다른 사람도 같은 데이터를 보나요?** 네. 모두 실시간으로 같은 데이터를 봅니다.
- **저장 버튼이 없어요.** 입력하면 자동 저장됩니다.
- **수정 버튼이 안 보여요.** 편집 잠금 상태입니다. 왼쪽 아래 **잠금 해제**로 PIN을 입력하세요.

---

## 🇬🇧 English

### 1. Access
- Open **https://bstars00-rgb.github.io/HR-Request-AR/** in a browser. No install, no sign-up.
- Works on PC and mobile.

### 2. Language / Theme
- Use the **`EN / 한`** button (bottom-left) to switch English↔Korean.
- Use the **sun/moon icon** for dark/light mode.

### 3. Screens
| Menu | What it does |
|------|------|
| **Dashboard** | Who's off today/this week/this month, headcount by team, lowest remaining leave, overlap alerts |
| **Calendar** | Monthly calendar. Filter by team/employee/type, color-coded. **Print** button |
| **Employees** | Employee list & balances. **Export (CSV)** to Excel |
| **Leave Entry** | Add/edit leave, view an employee's history, usage by type |
| **Teams** | Headcount, remaining leave, upcoming leave per team |
| **Settings** | (Admin) leave rules, teams, holidays, edit-lock, year-end rollover |

### 4. Common tasks

**Check my leave**
1. **Leave Entry** → pick your name in the **employee filter** at the top.
2. Your leave history plus **used / remaining** balance appears.

**Register leave** (requires edit rights)
1. **Leave Entry** → **+ Register Leave** (top right)
2. Fill in employee / type / start-end dates / half-day / status / reason
3. Check **estimated days** → a ⚠️ warning shows if it exceeds remaining → **Register**

**Leave types**: Annual · Half-day (0.5) · Sick · Unpaid · Business Trip · Public Holiday · Other

**Export to Excel**: **Export (CSV)** button on the Employees or Leave Entry screen → opens in Excel.

**Print calendar**: **Print** button (top-right of Calendar) → prints just the calendar.

### 5. Remaining leave formula
```
Remaining = Entitlement + Carry-over − (Already-used + approved leave logged in the app)
```
- **Half-day = 0.5**, weekends & holidays excluded automatically (per settings)
- Sick / Business Trip / Public Holiday do not deduct from annual leave by default

### 6. For Admins (HR)
- **Edit lock**: Set a **PIN** in Settings. After that, editing requires clicking **Unlock** (bottom-left) and entering the PIN. Prevents accidental changes. Empty PIN = anyone can edit.
- **Add/edit employees**: Employees → **+ Add Employee**. Put first-half usage into **"Already Used (before system)"** so balances are correct.
- **Teams**: Settings → add/remove teams, managers, alert thresholds.
- **Holidays**: Settings → register holidays by country.
- **Year-end rollover**: Settings → moves remaining into next year's carry-over and resets that year's records. **Cannot be undone — export a backup first.**

### 7. FAQ
- **Does everyone see the same data?** Yes — shared in real time.
- **There's no Save button.** Changes save automatically.
- **I don't see edit buttons.** Editing is locked. Click **Unlock** (bottom-left) and enter the PIN.

---

## 🇻🇳 Tiếng Việt

> Giao diện ứng dụng có tiếng Hàn/tiếng Anh. Hướng dẫn này dùng nhãn **tiếng Anh** (hãy bấm **`EN`** ở góc dưới bên trái).

### 1. Truy cập
- Mở **https://bstars00-rgb.github.io/HR-Request-AR/** trên trình duyệt. Không cần cài đặt hay đăng ký.
- Dùng được trên máy tính và điện thoại.

### 2. Ngôn ngữ / Giao diện
- Nút **`EN / 한`** (góc dưới trái) để đổi Anh↔Hàn.
- Biểu tượng **mặt trời/mặt trăng** để đổi nền sáng/tối.

### 3. Các màn hình
| Menu | Chức năng |
|------|------|
| **Dashboard** | Ai nghỉ hôm nay/tuần này/tháng này, số người theo nhóm, ai còn ít phép, cảnh báo trùng lịch |
| **Calendar** | Lịch tháng. Lọc theo nhóm/nhân viên/loại, có màu. Nút **Print** để in |
| **Employees** | Danh sách nhân viên & số phép. **Export (CSV)** ra Excel |
| **Leave Entry** | Thêm/sửa nghỉ phép, xem lịch sử của một nhân viên, thống kê theo loại |
| **Teams** | Số người, phép còn lại, lịch nghỉ sắp tới theo nhóm |
| **Settings** | (Quản trị) quy tắc phép, nhóm, ngày lễ, khóa chỉnh sửa, chuyển phép cuối năm |

### 4. Thao tác thường dùng

**Xem phép của tôi**
1. **Leave Entry** → chọn tên bạn ở **bộ lọc nhân viên** phía trên.
2. Lịch sử nghỉ và số phép **đã dùng / còn lại** sẽ hiển thị.

**Đăng ký nghỉ phép** (cần quyền chỉnh sửa)
1. **Leave Entry** → **+ Register Leave** (góc trên phải)
2. Nhập nhân viên / loại / ngày bắt đầu–kết thúc / nửa ngày / trạng thái / lý do
3. Xem **số ngày dự kiến** → có cảnh báo ⚠️ nếu vượt số phép còn lại → **Register**

**Các loại nghỉ**: Annual (phép năm) · Half-day (nửa ngày, 0.5) · Sick (nghỉ ốm) · Unpaid (không lương) · Business Trip (công tác) · Public Holiday (ngày lễ) · Other

**Xuất ra Excel**: nút **Export (CSV)** ở màn hình Employees hoặc Leave Entry → mở bằng Excel.

**In lịch**: nút **Print** (góc trên phải màn hình Calendar) → chỉ in phần lịch.

### 5. Công thức phép còn lại
```
Còn lại = Phép được cấp + Chuyển từ năm trước − (Đã dùng trước đó + phép đã duyệt nhập trong app)
```
- **Nửa ngày = 0.5**, cuối tuần & ngày lễ tự động loại trừ (theo cài đặt)
- Nghỉ ốm / công tác / ngày lễ mặc định **không** trừ phép năm

### 6. Dành cho Quản trị (HR)
- **Khóa chỉnh sửa**: Đặt **PIN** trong Settings. Sau đó muốn sửa phải bấm **Unlock** (góc dưới trái) và nhập PIN. Tránh xóa nhầm. PIN trống = ai cũng sửa được.
- **Thêm/sửa nhân viên**: Employees → **+ Add Employee**. Nhập số ngày đã nghỉ nửa đầu năm vào ô **"Already Used (before system)"** để số phép chính xác.
- **Nhóm**: Settings → thêm/xóa nhóm, quản lý, ngưỡng cảnh báo.
- **Ngày lễ**: Settings → thêm ngày lễ theo quốc gia.
- **Chuyển phép cuối năm**: Settings → chuyển phép còn lại sang năm sau và reset dữ liệu năm đó. **Không thể hoàn tác — hãy Export sao lưu trước.**

### 7. Câu hỏi thường gặp
- **Mọi người có xem cùng dữ liệu không?** Có — chia sẻ theo thời gian thực.
- **Không có nút Lưu.** Thay đổi được lưu tự động.
- **Tôi không thấy nút chỉnh sửa.** Đang bị khóa. Bấm **Unlock** (góc dưới trái) và nhập PIN.

---

*문서 버전 / Version: 2026-07 · 문의 / Contact: Global_OPs@ohmyhotel.com*
