// =============================================================
// 날짜 유틸 — 라이브러리 의존 없이 로컬 타임존 기준으로 안전하게 처리
// 모든 날짜 문자열은 "YYYY-MM-DD" 형식을 사용한다.
// =============================================================

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function today(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function todayISO(): string {
  return toISO(today());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isWeekend(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6; // 일(0), 토(6)
}

// 두 날짜(포함) 사이의 모든 날짜 배열
export function eachDay(startISO: string, endISO: string): Date[] {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  const out: Date[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

// 이번 주(월~일) 범위
export function thisWeekRange(base: Date = today()): { start: Date; end: Date } {
  const day = base.getDay(); // 0=일
  const diffToMon = (day + 6) % 7; // 월요일까지 거슬러
  const start = addDays(base, -diffToMon);
  const end = addDays(start, 6);
  return { start, end };
}

// 이번 달 범위
export function thisMonthRange(base: Date = today()): { start: Date; end: Date } {
  const start = new Date(base.getFullYear(), base.getMonth(), 1);
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
  return { start, end };
}

// 두 기간이 겹치는지
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

// 특정 날짜가 기간 안에 있는지
export function dateInRange(dISO: string, startISO: string, endISO: string): boolean {
  return dISO >= startISO && dISO <= endISO;
}

const KO_MONTHS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];
const KO_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function fmtKo(dISO: string): string {
  const d = parseISO(dISO);
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${KO_DAYS[d.getDay()]})`;
}

export function monthLabel(year: number, month0: number): string {
  return `${year}년 ${KO_MONTHS[month0]}`;
}

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const EN_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 언어별 날짜 포맷
export function fmtDate(dISO: string, lang: "ko" | "en"): string {
  const d = parseISO(dISO);
  if (lang === "en") {
    return `${EN_MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()} (${
      EN_DAYS_SHORT[d.getDay()]
    })`;
  }
  return fmtKo(dISO);
}

export function monthLabelL(
  year: number,
  month0: number,
  lang: "ko" | "en"
): string {
  if (lang === "en") return `${EN_MONTHS[month0]} ${year}`;
  return monthLabel(year, month0);
}

// 캘린더 그리드용: 해당 월을 채우는 6주(42칸) 날짜 배열 (월요일 시작)
export function monthGrid(year: number, month0: number): Date[] {
  const first = new Date(year, month0, 1);
  const startOffset = (first.getDay() + 6) % 7; // 월요일 시작
  const gridStart = addDays(first, -startOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
