// =============================================================
// 중앙 데이터 모델 — 요청하신 DB 스키마(5. 데이터 구조)와 1:1 매핑
// 추후 Supabase(PostgreSQL)로 그대로 옮길 수 있도록 snake_case 컬럼명 유지
// =============================================================

export type TeamName = "OP" | "CT" | "Sales" | "GSM" | "Air" | "Management";

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
  leave_type: LeaveTypeKey;
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

// 팀별 식별 색상 (UI 팀 구분용)
export const TEAM_COLORS: Record<TeamName, string> = {
  OP: "#2563eb",
  CT: "#0891b2",
  Sales: "#059669",
  GSM: "#d97706",
  Air: "#7c3aed",
  Management: "#475569",
};
