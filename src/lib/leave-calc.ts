// =============================================================
// 연차 계산 로직 (요청 3-C)
//   잔여 연차 = 기본 연차 + 이월 연차 - 승인된 사용 연차
//   - Approved 상태만 사용 연차에 반영
//   - LeaveType.deduct_from_annual_leave = false 이면 차감 제외
//     (Sick/Business Trip/Public Holiday 등 설정 가능)
//   - Half-day = 0.5일
//   - 주말/공휴일은 설정에 따라 사용일수에서 제외
// =============================================================

import { AppData, Employee, LeaveRequest, LeaveType } from "./types";
import { eachDay, isWeekend, toISO } from "./date";

// 특정 휴가 1건의 "달력상 실제 사용 일수" 계산.
// 주말/공휴일 제외 옵션을 반영하며, 반차는 0.5로 처리한다.
export function computeLeaveDays(
  leave: Pick<LeaveRequest, "start_date" | "end_date" | "half_day_type" | "leave_type">,
  data: Pick<AppData, "holidays" | "settings">
): number {
  // 반차는 항상 0.5일 (단일 날짜 가정)
  if (leave.half_day_type !== "none" || leave.leave_type === "Half-day Leave") {
    return 0.5;
  }

  const holidaySet = new Set(data.holidays.map((h) => h.date));
  const days = eachDay(leave.start_date, leave.end_date);

  let count = 0;
  for (const d of days) {
    if (data.settings.exclude_weekends && isWeekend(d)) continue;
    if (data.settings.exclude_holidays && holidaySet.has(toISO(d))) continue;
    count += 1;
  }
  return count;
}

function leaveTypeMap(types: LeaveType[]): Record<string, LeaveType> {
  return Object.fromEntries(types.map((t) => [t.leave_type_name, t]));
}

export interface LeaveSummary {
  entitlement: number; // 기본 연차
  carriedOver: number; // 이월 연차
  used: number; // 차감 대상 사용 연차 (Approved + deduct=true)
  remaining: number; // 잔여 연차
  usageRate: number; // 사용률 (0~1)
}

// 한 직원의 연차 요약 계산
export function summarizeEmployee(emp: Employee, data: AppData): LeaveSummary {
  const types = leaveTypeMap(data.leaveTypes);
  const entitlement = emp.annual_leave_entitlement;
  const carriedOver = emp.carried_over_leave;
  const total = entitlement + carriedOver;

  let used = 0;
  for (const lv of data.leaves) {
    if (lv.employee_id !== emp.id) continue;
    if (lv.status !== "Approved") continue;
    const t = types[lv.leave_type];
    if (t && !t.deduct_from_annual_leave) continue; // 차감 제외 유형
    used += lv.days_count;
  }

  const remaining = total - used;
  const usageRate = total > 0 ? used / total : 0;
  return { entitlement, carriedOver, used, remaining, usageRate };
}

// 특정 날짜(ISO)에 휴가 중인 휴가건 목록 (Approved + Pending 옵션)
export function leavesOnDate(
  dISO: string,
  data: AppData,
  opts: { includePending?: boolean } = {}
): LeaveRequest[] {
  return data.leaves.filter((lv) => {
    if (lv.status === "Rejected" || lv.status === "Cancelled") return false;
    if (!opts.includePending && lv.status === "Pending") return false;
    return dISO >= lv.start_date && dISO <= lv.end_date;
  });
}
