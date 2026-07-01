"use client";

// =============================================================
// 다국어 (한국어 / English) — 가벼운 자체 i18n
//   t("key") 로 사용. 키가 없으면 키 자체를 반환(안전).
//   언어 설정은 localStorage 에 저장.
// =============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Lang = "ko" | "en";

type Dict = Record<string, string>;

const ko: Dict = {
  // 브랜드 / 사이드바
  "brand.title": "연차관리",
  "brand.subtitle": "사내 휴가 플랫폼",
  "brand.version": "v0.2 · 사내 공유용",
  "nav.dashboard": "대시보드",
  "nav.calendar": "캘린더",
  "nav.employees": "직원 관리",
  "nav.leaves": "휴가 등록",
  "nav.teams": "팀 현황",
  "nav.settings": "설정",
  "menu": "메뉴",

  // 공통
  "common.add": "추가",
  "common.edit": "수정",
  "common.delete": "삭제",
  "common.cancel": "취소",
  "common.save": "저장",
  "common.saveEdit": "수정 저장",
  "common.manage": "관리",
  "common.all": "전체",
  "common.allTeams": "전체 팀",
  "common.allPositions": "전체 직급",
  "common.allStatus": "전체 상태",
  "common.allEmployees": "전체 직원",
  "common.allTypes": "전체 유형",
  "common.team": "팀",
  "common.days": "일",
  "common.people": "명",
  "common.cases": "건",
  "common.manager": "매니저",
  "common.loading": "불러오는 중…",
  "common.today": "오늘",

  // 상태
  "status.Approved": "승인",
  "status.Pending": "대기",
  "status.Rejected": "반려",
  "status.Cancelled": "취소",

  // 근무 상태
  "emp.재직": "재직",
  "emp.퇴사": "퇴사",
  "emp.휴직": "휴직",

  // 반차
  "half.am": "오전 반차",
  "half.pm": "오후 반차",
  "half.amShort": "(오전)",
  "half.pmShort": "(오후)",
  "half.amLeave": "(오전반차)",
  "half.pmLeave": "(오후반차)",
  "half.none": "해당 없음 (종일)",

  // 대시보드
  "dash.title": "대시보드",
  "dash.subtitle": "기준 휴가 현황",
  "dash.todayLeavers": "오늘 휴가자",
  "dash.weekLeavers": "이번 주 휴가자",
  "dash.monthLeavers": "이번 달 휴가자",
  "dash.riskAlerts": "동시 휴가 경고",
  "dash.next14": "향후 14일",
  "dash.riskTitle": "팀 운영 리스크 — 동시 휴가 집중일",
  "dash.threshold": "기준",
  "dash.todayOnLeave": "오늘 휴가 중인 직원",
  "dash.noTodayLeave": "오늘 휴가 중인 직원이 없습니다.",
  "dash.teamTodayCount": "팀별 오늘 휴가 인원",
  "dash.bottomRemaining": "잔여 연차 적은 직원 Bottom 5",
  "dash.topUsage": "연차 사용률 높은 직원 Top 5",
  "dash.addLeave": "휴가 등록",

  // 캘린더
  "cal.title": "휴가 캘린더",
  "cal.subtitle": "팀·직원·유형별로 휴가 일정을 한눈에 확인",
  "cal.prevMonth": "이전 달",
  "cal.nextMonth": "다음 달",
  "cal.more": "명 더",

  // 직원
  "employees.title": "직원 관리",
  "employees.total": "총",
  "employees.active": "재직",
  "employees.addEmployee": "직원 추가",
  "employees.editEmployee": "직원 수정",
  "employees.searchName": "직원명 검색",
  "employees.empty": "조건에 맞는 직원이 없습니다.",
  "employees.col.name": "이름",
  "employees.col.team": "팀",
  "employees.col.position": "직급",
  "employees.col.joinDate": "입사일",
  "employees.col.baseCarry": "기본+이월",
  "employees.col.used": "사용",
  "employees.col.remaining": "잔여",
  "employees.col.status": "상태",
  "employees.field.name": "직원명",
  "employees.field.englishName": "영문명",
  "employees.field.team": "팀명",
  "employees.field.position": "직급",
  "employees.field.joinDate": "입사일",
  "employees.field.status": "근무 상태",
  "employees.field.entitlement": "기본 연차 일수",
  "employees.field.carryover": "이월 연차",
  "employees.field.notes": "비고",
  "employees.confirmDelete": "직원을 삭제할까요? (관련 휴가 기록도 삭제됩니다)",

  // 휴가
  "leaves.title": "휴가 등록 / 관리",
  "leaves.subtitle": "휴가를 등록하고 상태를 관리합니다 (1차 기본값: 승인)",
  "leaves.editLeave": "휴가 수정",
  "leaves.empty": "등록된 휴가가 없습니다.",
  "leaves.col.employee": "직원",
  "leaves.col.type": "유형",
  "leaves.col.period": "기간",
  "leaves.col.days": "일수",
  "leaves.col.reason": "사유",
  "leaves.confirmDelete": "이 휴가 기록을 삭제할까요?",

  // 휴가 폼
  "form.employee": "직원명",
  "form.leaveType": "휴가 유형",
  "form.startDate": "시작일",
  "form.endDate": "종료일",
  "form.endDateHalf": "종료일 (반차는 시작일 적용)",
  "form.halfType": "반차 구분",
  "form.status": "상태",
  "form.reason": "사유",
  "form.reasonPlaceholder": "예: 개인 사정, 가족 여행 등",
  "form.previewDays": "예상 사용 일수",
  "form.submitNew": "휴가 등록",
  "form.endBeforeStart": "종료일이 시작일보다 빠릅니다.",

  // 팀
  "teams.title": "팀 현황",
  "teams.subtitle": "팀별 인원·연차·일정 요약",
  "teams.activeCount": "재직 인원",
  "teams.manager": "팀 매니저",
  "teams.warnThreshold": "동시 휴가 경고 기준",
  "teams.remainingSum": "팀 잔여 연차 합",
  "teams.memberLeave": "팀원 연차 현황",
  "teams.noMembers": "재직 중인 팀원이 없습니다.",
  "teams.col.usageRate": "사용률",
  "teams.upcoming": "예정·진행 중 휴가",
  "teams.noUpcoming": "예정된 휴가가 없습니다.",

  // 설정
  "settings.title": "설정",
  "settings.subtitle": "연차 기준 · 휴가 유형 · 공휴일 · 팀 경고 기준",
  "settings.calcRule": "연차 계산 기준",
  "settings.excludeWeekends": "주말 제외",
  "settings.excludeHolidays": "공휴일 제외",
  "settings.defaultLeave": "신규 직원 기본 연차 (일)",
  "settings.recalcNote": "※ 변경 시 모든 휴가의 사용 일수가 자동 재계산됩니다.",
  "settings.teamWarn": "팀별 동시 휴가 경고 기준",
  "settings.orMore": "명 이상",
  "settings.leaveTypeDeduct": "휴가 유형 · 연차 차감",
  "settings.deduct": "연차 차감",
  "settings.noDeduct": "미차감",
  "settings.deductNote": "※ 차감 여부 변경은 2차에서 편집 UI로 확장 예정 (데이터 구조는 준비됨).",
  "settings.dataMgmt": "데이터 관리",
  "settings.localNote": "현재 데이터는 이 브라우저(localStorage)에 저장됩니다. 초기화하면 샘플 데이터로 되돌아갑니다.",
  "settings.cloudNote": "현재 Supabase 공유 DB에 연결되어 있습니다. 모든 직원이 같은 데이터를 봅니다.",
  "settings.reset": "샘플 데이터로 초기화",
  "settings.confirmReset": "모든 데이터를 샘플 상태로 초기화할까요?",
  "settings.holidayMgmt": "공휴일 관리",
  "settings.holidayName": "공휴일명",
  "settings.holidayEmpty": "등록된 공휴일이 없습니다.",
  "settings.col.date": "날짜",
  "settings.col.country": "국가",
  "settings.col.holidayName": "공휴일명",
  "settings.col.applicableTeam": "적용 팀",
  "settings.dbStatus": "데이터 저장소",
  "settings.dbSupabase": "Supabase 공유 DB (연결됨)",
  "settings.dbLocal": "브라우저 로컬 저장 (localStorage)",

  // 국가
  "country.한국": "한국",
  "country.베트남": "베트남",
  "country.싱가포르": "싱가포르",
  "country.기타": "기타",

  // 테마 / 언어
  "ui.darkMode": "다크 모드",
  "ui.lightMode": "라이트 모드",
  "ui.language": "언어",
};

const en: Dict = {
  "brand.title": "Leave Mgmt",
  "brand.subtitle": "Company Leave Platform",
  "brand.version": "v0.2 · Internal",
  "nav.dashboard": "Dashboard",
  "nav.calendar": "Calendar",
  "nav.employees": "Employees",
  "nav.leaves": "Leave Entry",
  "nav.teams": "Teams",
  "nav.settings": "Settings",
  "menu": "Menu",

  "common.add": "Add",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.saveEdit": "Save Changes",
  "common.manage": "Actions",
  "common.all": "All",
  "common.allTeams": "All Teams",
  "common.allPositions": "All Positions",
  "common.allStatus": "All Status",
  "common.allEmployees": "All Employees",
  "common.allTypes": "All Types",
  "common.team": "Team",
  "common.days": "d",
  "common.people": "",
  "common.cases": "",
  "common.manager": "Manager",
  "common.loading": "Loading…",
  "common.today": "Today",

  "status.Approved": "Approved",
  "status.Pending": "Pending",
  "status.Rejected": "Rejected",
  "status.Cancelled": "Cancelled",

  "emp.재직": "Active",
  "emp.퇴사": "Resigned",
  "emp.휴직": "On Leave",

  "half.am": "AM Half-day",
  "half.pm": "PM Half-day",
  "half.amShort": "(AM)",
  "half.pmShort": "(PM)",
  "half.amLeave": "(AM half)",
  "half.pmLeave": "(PM half)",
  "half.none": "None (full day)",

  "dash.title": "Dashboard",
  "dash.subtitle": "leave status",
  "dash.todayLeavers": "On Leave Today",
  "dash.weekLeavers": "This Week",
  "dash.monthLeavers": "This Month",
  "dash.riskAlerts": "Overlap Alerts",
  "dash.next14": "next 14 days",
  "dash.riskTitle": "Team Risk — Days with Overlapping Leave",
  "dash.threshold": "threshold",
  "dash.todayOnLeave": "Employees on Leave Today",
  "dash.noTodayLeave": "No one is on leave today.",
  "dash.teamTodayCount": "On Leave Today by Team",
  "dash.bottomRemaining": "Lowest Remaining Leave (Bottom 5)",
  "dash.topUsage": "Highest Usage Rate (Top 5)",
  "dash.addLeave": "New Leave",

  "cal.title": "Leave Calendar",
  "cal.subtitle": "See leave schedules by team, employee, and type",
  "cal.prevMonth": "Previous month",
  "cal.nextMonth": "Next month",
  "cal.more": "more",

  "employees.title": "Employees",
  "employees.total": "Total",
  "employees.active": "Active",
  "employees.addEmployee": "Add Employee",
  "employees.editEmployee": "Edit Employee",
  "employees.searchName": "Search name",
  "employees.empty": "No employees match the filters.",
  "employees.col.name": "Name",
  "employees.col.team": "Team",
  "employees.col.position": "Position",
  "employees.col.joinDate": "Join Date",
  "employees.col.baseCarry": "Base+Carry",
  "employees.col.used": "Used",
  "employees.col.remaining": "Left",
  "employees.col.status": "Status",
  "employees.field.name": "Name",
  "employees.field.englishName": "English Name",
  "employees.field.team": "Team",
  "employees.field.position": "Position",
  "employees.field.joinDate": "Join Date",
  "employees.field.status": "Employment Status",
  "employees.field.entitlement": "Annual Leave (days)",
  "employees.field.carryover": "Carried Over",
  "employees.field.notes": "Notes",
  "employees.confirmDelete": "Delete this employee? (Their leave records will also be removed)",

  "leaves.title": "Leave Entry / Management",
  "leaves.subtitle": "Register leave and manage status (v1 default: Approved)",
  "leaves.editLeave": "Edit Leave",
  "leaves.empty": "No leave records yet.",
  "leaves.col.employee": "Employee",
  "leaves.col.type": "Type",
  "leaves.col.period": "Period",
  "leaves.col.days": "Days",
  "leaves.col.reason": "Reason",
  "leaves.confirmDelete": "Delete this leave record?",

  "form.employee": "Employee",
  "form.leaveType": "Leave Type",
  "form.startDate": "Start Date",
  "form.endDate": "End Date",
  "form.endDateHalf": "End Date (half-day uses start date)",
  "form.halfType": "Half-day",
  "form.status": "Status",
  "form.reason": "Reason",
  "form.reasonPlaceholder": "e.g. personal, family trip",
  "form.previewDays": "Estimated days used",
  "form.submitNew": "Register Leave",
  "form.endBeforeStart": "End date is before start date.",

  "teams.title": "Teams",
  "teams.subtitle": "Headcount, leave, and schedule by team",
  "teams.activeCount": "Active Members",
  "teams.manager": "Team Manager",
  "teams.warnThreshold": "Overlap Alert Threshold",
  "teams.remainingSum": "Team Remaining Leave",
  "teams.memberLeave": "Member Leave Status",
  "teams.noMembers": "No active members.",
  "teams.col.usageRate": "Usage",
  "teams.upcoming": "Upcoming & Ongoing Leave",
  "teams.noUpcoming": "No upcoming leave.",

  "settings.title": "Settings",
  "settings.subtitle": "Leave rules · types · holidays · team thresholds",
  "settings.calcRule": "Leave Calculation Rules",
  "settings.excludeWeekends": "Exclude weekends",
  "settings.excludeHolidays": "Exclude holidays",
  "settings.defaultLeave": "Default annual leave for new hires (days)",
  "settings.recalcNote": "※ Changing this recalculates all leave day counts automatically.",
  "settings.teamWarn": "Team Overlap Alert Thresholds",
  "settings.orMore": "or more",
  "settings.leaveTypeDeduct": "Leave Types · Annual Deduction",
  "settings.deduct": "Deducts",
  "settings.noDeduct": "No deduction",
  "settings.deductNote": "※ Editing deduction will arrive in v2 (data structure is ready).",
  "settings.dataMgmt": "Data Management",
  "settings.localNote": "Data is stored in this browser (localStorage). Resetting restores sample data.",
  "settings.cloudNote": "Connected to Supabase shared DB. All employees see the same data.",
  "settings.reset": "Reset to sample data",
  "settings.confirmReset": "Reset all data to the sample state?",
  "settings.holidayMgmt": "Holiday Management",
  "settings.holidayName": "Holiday name",
  "settings.holidayEmpty": "No holidays registered.",
  "settings.col.date": "Date",
  "settings.col.country": "Country",
  "settings.col.holidayName": "Holiday",
  "settings.col.applicableTeam": "Team",
  "settings.dbStatus": "Data Store",
  "settings.dbSupabase": "Supabase shared DB (connected)",
  "settings.dbLocal": "Browser local storage (localStorage)",

  "country.한국": "Korea",
  "country.베트남": "Vietnam",
  "country.싱가포르": "Singapore",
  "country.기타": "Other",

  "ui.darkMode": "Dark mode",
  "ui.lightMode": "Light mode",
  "ui.language": "Language",
};

const DICTS: Record<Lang, Dict> = { ko, en };
const LANG_KEY = "hr-leave-platform:lang";

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY) as Lang | null;
    if (saved === "ko" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(LANG_KEY, l);
  }, []);

  const t = useCallback(
    (key: string) => DICTS[lang][key] ?? DICTS.ko[key] ?? key,
    [lang]
  );

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

// 한국어 날짜 포맷을 언어에 맞게 — 영어일 때 영문 포맷 사용
export const EN_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const EN_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const KO_WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
