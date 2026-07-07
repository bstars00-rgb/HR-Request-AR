// =============================================================
// 중앙 데이터 모델 — 요청하신 DB 스키마(5. 데이터 구조)와 1:1 매핑
// 추후 Supabase(PostgreSQL)로 그대로 옮길 수 있도록 snake_case 컬럼명 유지
// =============================================================

// 팀은 이제 동적(추가/삭제 가능)이므로 문자열. 기본 6팀은 아래 상수로 시드에만 사용.
export type TeamName = string;

export type Position = "Staff" | "Senior" | "Manager" | "Director";

export type EmploymentStatus = "재직" | "퇴사" | "휴직";

// 1차 버전 확장 포인트: 추후 Admin / Manager / Staff 권한
export type Role = "admin" | "manager" | "staff";

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

export type HalfDayType = "none" | "AM" | "PM";

// 휴가 유형 키 — LeaveTypes 테이블의 식별자
export type LeaveTypeKey =
  | "Annual Leave"
  | "Half-day Leave"
  | "Sick Leave"
  | "Unpaid Leave"
  | "Business Trip"
  | "Public Holiday"
  | "Other";

export interface Employee {
  id: string;
  name: string;
  english_name: string;
  team: TeamName;
  position: Position;
  join_date: string; // YYYY-MM-DD
  annual_leave_entitlement: number; // 기본 연차 일수
  carried_over_leave: number; // 이월 연차
  used_adjustment: number; // 시스템 도입 전 이미 사용한 연차(일) — 잔여에서 차감
  employment_status: EmploymentStatus;
  role: Role; // 확장용 (1차에서는 UI 노출 최소)
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  team: TeamName; // 비정규화: 필터/캘린더 성능용
  leave_type: string; // 일정 카테고리 키 (CategoryKey) — 하위호환 위해 컬럼명 유지
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  days_count: number; // 계산된 실제 사용 일수
  half_day_type: HalfDayType;
  reason: string;
  status: LeaveStatus;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  country: string; // 베트남 / 한국 / 싱가포르 ...
  holiday_name: string;
  applicable_team: TeamName | "ALL";
  notes: string;
}

export interface Team {
  id: string;
  team_name: TeamName;
  manager_name: string;
  warning_threshold: number; // 동시 휴가 인원 경고 기준(명)
  notes: string;
}

export interface LeaveType {
  id: string;
  leave_type_name: LeaveTypeKey;
  deduct_from_annual_leave: boolean; // 연차 차감 여부
  color_code: string; // hex
  notes: string;
}

export interface Settings {
  // 연차 계산 기본 기준
  exclude_weekends: boolean; // 주말 제외
  exclude_holidays: boolean; // 공휴일 제외
  default_annual_leave: number; // 신규 직원 기본 연차
  admin_pin: string; // 편집 잠금용 PIN (빈 값이면 잠금 없음 = 누구나 편집)
}

export interface AppData {
  employees: Employee[];
  leaves: LeaveRequest[];
  holidays: Holiday[];
  teams: Team[];
  leaveTypes: LeaveType[];
  settings: Settings;
}

export const TEAM_NAMES: TeamName[] = [
  "OP",
  "CT",
  "Sales",
  "GSM",
  "Air",
  "Management",
];

export const POSITIONS: Position[] = ["Staff", "Senior", "Manager", "Director"];

export const EMPLOYMENT_STATUSES: EmploymentStatus[] = ["재직", "퇴사", "휴직"];

export const LEAVE_STATUSES: LeaveStatus[] = [
  "Pending",
  "Approved",
  "Rejected",
  "Cancelled",
];

export const LEAVE_TYPE_KEYS: LeaveTypeKey[] = [
  "Annual Leave",
  "Half-day Leave",
  "Sick Leave",
  "Unpaid Leave",
  "Business Trip",
  "Public Holiday",
  "Other",
];

// =============================================================
// 일정 카테고리 (일정 공유 플랫폼)
// =============================================================
export type CategoryKey = "Fair" | "Trip" | "Internal" | "Personal" | "Other";

export const CATEGORY_KEYS: CategoryKey[] = [
  "Fair",
  "Trip",
  "Internal",
  "Personal",
  "Other",
];

export const CATEGORY_COLORS: Record<string, string> = {
  Fair: "#16a34a", // 박람회/세일즈콜 — 초록
  Trip: "#d97706", // 출장 — 노랑/주황
  Internal: "#64748b", // 내부업무/OKR — 회색
  Personal: "#7c3aed", // 개인/휴가 — 보라
  Other: "#4f46e5", // 기타
};

export function categoryColor(key: string): string {
  return CATEGORY_COLORS[key] ?? "#6366f1";
}

// 기본 6팀의 고정 색상 (알려진 팀은 색이 유지되도록)
export const TEAM_COLORS: Record<string, string> = {
  OP: "#2563eb",
  CT: "#0891b2",
  Sales: "#059669",
  GSM: "#d97706",
  Air: "#7c3aed",
  Management: "#475569",
};

// 새로 만든 팀에 자동 배정할 색상 팔레트
export const TEAM_COLOR_PALETTE = [
  "#2563eb", "#0891b2", "#059669", "#d97706", "#7c3aed", "#475569",
  "#db2777", "#0d9488", "#ca8a04", "#4f46e5", "#dc2626", "#65a30d",
];

// 팀 이름 → 색상 (알려진 팀은 고정색, 그 외는 이름 해시로 팔레트에서 결정론적 배정)
export function teamColor(name: string): string {
  if (TEAM_COLORS[name]) return TEAM_COLORS[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TEAM_COLOR_PALETTE[h % TEAM_COLOR_PALETTE.length];
}
