// =============================================================
// 초기 샘플 데이터 (요청 9) — 최초 실행 시 localStorage 에 주입
// =============================================================

import {
  AppData,
  Employee,
  Holiday,
  LeaveRequest,
  LeaveType,
  Team,
  TEAM_NAMES,
  TeamName,
} from "./types";

const now = "2026-01-01T00:00:00.000Z";

let idc = 0;
const uid = (p: string) => `${p}_${(++idc).toString().padStart(3, "0")}`;

const leaveTypes: LeaveType[] = [
  { id: uid("lt"), leave_type_name: "Annual Leave", deduct_from_annual_leave: true, color_code: "#2563eb", notes: "일반 연차" },
  { id: uid("lt"), leave_type_name: "Half-day Leave", deduct_from_annual_leave: true, color_code: "#0ea5e9", notes: "반차 0.5일" },
  { id: uid("lt"), leave_type_name: "Sick Leave", deduct_from_annual_leave: false, color_code: "#dc2626", notes: "병가 (기본 미차감)" },
  { id: uid("lt"), leave_type_name: "Unpaid Leave", deduct_from_annual_leave: false, color_code: "#ea580c", notes: "무급 휴가" },
  { id: uid("lt"), leave_type_name: "Business Trip", deduct_from_annual_leave: false, color_code: "#7c3aed", notes: "출장 (미차감)" },
  { id: uid("lt"), leave_type_name: "Public Holiday", deduct_from_annual_leave: false, color_code: "#64748b", notes: "공휴일" },
  { id: uid("lt"), leave_type_name: "Other", deduct_from_annual_leave: false, color_code: "#9333ea", notes: "기타" },
];

const teamMeta: Record<TeamName, { manager: string; threshold: number }> = {
  OP: { manager: "김운영", threshold: 3 },
  CT: { manager: "이씨티", threshold: 2 },
  Sales: { manager: "박세일", threshold: 3 },
  GSM: { manager: "최지에스", threshold: 2 },
  Air: { manager: "정에어", threshold: 2 },
  Management: { manager: "대표", threshold: 1 },
};

const teams: Team[] = TEAM_NAMES.map((t) => ({
  id: uid("team"),
  team_name: t,
  manager_name: teamMeta[t].manager,
  warning_threshold: teamMeta[t].threshold,
  notes: "",
}));

// 팀별 샘플 직원 3명
const sampleNames: Record<TeamName, { ko: string; en: string }[]> = {
  OP: [
    { ko: "김운영", en: "Kim Operations" },
    { ko: "한지훈", en: "Han Jihoon" },
    { ko: "서다은", en: "Seo Daeun" },
  ],
  CT: [
    { ko: "이씨티", en: "Lee CT" },
    { ko: "오민재", en: "Oh Minjae" },
    { ko: "유나래", en: "Yu Narae" },
  ],
  Sales: [
    { ko: "박세일", en: "Park Sales" },
    { ko: "강도윤", en: "Kang Doyoon" },
    { ko: "임수빈", en: "Im Subin" },
  ],
  GSM: [
    { ko: "최지에스", en: "Choi GSM" },
    { ko: "신예린", en: "Shin Yerin" },
    { ko: "권태호", en: "Kwon Taeho" },
  ],
  Air: [
    { ko: "정에어", en: "Jung Air" },
    { ko: "남기현", en: "Nam Kihyun" },
    { ko: "조하늘", en: "Cho Haneul" },
  ],
  Management: [
    { ko: "대표", en: "CEO" },
    { ko: "문비서", en: "Moon Secretary" },
    { ko: "백재무", en: "Baek Finance" },
  ],
};

const positionsByIndex = ["Manager", "Senior", "Staff"] as const;

const employees: Employee[] = [];
TEAM_NAMES.forEach((team) => {
  sampleNames[team].forEach((p, i) => {
    employees.push({
      id: uid("emp"),
      name: p.ko,
      english_name: p.en,
      team,
      position: positionsByIndex[i],
      join_date: `202${i + 1}-0${(i % 9) + 1}-15`,
      annual_leave_entitlement: 15,
      carried_over_leave: i === 0 ? 3 : i === 1 ? 1 : 0,
      used_adjustment: 0,
      employment_status: "재직",
      role: i === 0 ? "manager" : "staff",
      notes: "",
      created_at: now,
      updated_at: now,
    });
  });
});

// 공휴일 — 베트남/한국/싱가포르 예시
const holidays: Holiday[] = [
  { id: uid("hol"), date: "2026-01-01", country: "한국", holiday_name: "신정", applicable_team: "ALL", notes: "" },
  { id: uid("hol"), date: "2026-02-17", country: "베트남", holiday_name: "Tết (설)", applicable_team: "ALL", notes: "베트남 최대 명절" },
  { id: uid("hol"), date: "2026-04-30", country: "베트남", holiday_name: "통일기념일", applicable_team: "ALL", notes: "" },
  { id: uid("hol"), date: "2026-05-01", country: "싱가포르", holiday_name: "Labour Day", applicable_team: "ALL", notes: "" },
  { id: uid("hol"), date: "2026-08-09", country: "싱가포르", holiday_name: "National Day", applicable_team: "ALL", notes: "" },
  { id: uid("hol"), date: "2026-09-25", country: "한국", holiday_name: "추석", applicable_team: "ALL", notes: "" },
];

// 예시 휴가 — 대시보드/캘린더/리스크가 바로 보이도록 6월 말~7월에 배치
function mk(
  empName: string,
  type: LeaveRequest["leave_type"],
  start: string,
  end: string,
  half: LeaveRequest["half_day_type"] = "none",
  status: LeaveRequest["status"] = "Approved",
  reason = ""
): LeaveRequest {
  const emp = employees.find((e) => e.name === empName)!;
  return {
    id: uid("lv"),
    employee_id: emp.id,
    team: emp.team,
    leave_type: type,
    start_date: start,
    end_date: end,
    days_count: 0, // 주입 시 재계산
    half_day_type: half,
    reason,
    status,
    created_at: now,
    updated_at: now,
  };
}

const leaves: LeaveRequest[] = [
  // OP팀 동시 휴가 → 리스크 경고 유발 (threshold 3)
  mk("김운영", "Annual Leave", "2026-06-29", "2026-06-30", "none", "Approved", "개인 사유"),
  mk("한지훈", "Annual Leave", "2026-06-29", "2026-07-01", "none", "Approved", "가족 여행"),
  mk("서다은", "Half-day Leave", "2026-06-29", "2026-06-29", "PM", "Approved", "병원"),
  // 다른 팀
  mk("강도윤", "Sick Leave", "2026-06-29", "2026-06-29", "none", "Approved", "감기"),
  mk("오민재", "Business Trip", "2026-07-02", "2026-07-04", "none", "Approved", "고객사 방문"),
  mk("임수빈", "Annual Leave", "2026-07-06", "2026-07-10", "none", "Pending", "여름 휴가"),
  mk("신예린", "Annual Leave", "2026-07-13", "2026-07-14", "none", "Approved", ""),
  mk("조하늘", "Unpaid Leave", "2026-07-20", "2026-07-22", "none", "Approved", "개인 사정"),
];

export function buildSeed(): AppData {
  return {
    employees,
    leaves,
    holidays,
    teams,
    leaveTypes,
    settings: {
      exclude_weekends: true,
      exclude_holidays: true,
      default_annual_leave: 15,
    },
  };
}
