"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import {
  HalfDayType,
  LeaveRequest,
  LeaveStatus,
  LeaveTypeKey,
  LEAVE_STATUSES,
  LEAVE_TYPE_KEYS,
} from "@/lib/types";
import { computeLeaveDays, summarizeEmployee } from "@/lib/leave-calc";
import { todayISO } from "@/lib/date";
import { Button, Field, Input, Select, Textarea } from "./ui";

interface Props {
  initial?: LeaveRequest;
  onDone: () => void;
}

export default function LeaveForm({ initial, onDone }: Props) {
  const { data, addLeave, updateLeave } = useStore();
  const { t } = useI18n();
  const activeEmployees = data.employees.filter(
    (e) => e.employment_status !== "퇴사"
  );

  const [employeeId, setEmployeeId] = useState(
    initial?.employee_id ?? activeEmployees[0]?.id ?? ""
  );
  const [leaveType, setLeaveType] = useState<LeaveTypeKey>(
    initial?.leave_type ?? "Annual Leave"
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? todayISO());
  const [endDate, setEndDate] = useState(initial?.end_date ?? todayISO());
  const [halfDay, setHalfDay] = useState<HalfDayType>(
    initial?.half_day_type ?? "none"
  );
  const [status, setStatus] = useState<LeaveStatus>(initial?.status ?? "Approved");
  const [reason, setReason] = useState(initial?.reason ?? "");

  const isHalf = leaveType === "Half-day Leave" || halfDay !== "none";

  const previewDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return computeLeaveDays(
      {
        start_date: startDate,
        end_date: isHalf ? startDate : endDate,
        half_day_type: isHalf ? (halfDay === "none" ? "AM" : halfDay) : "none",
        leave_type: leaveType,
      },
      data
    );
  }, [startDate, endDate, halfDay, leaveType, isHalf, data]);

  // 잔여 초과 경고 (승인 + 차감 대상 유형일 때만)
  const overLimit = useMemo(() => {
    if (status !== "Approved") return false;
    const lt = data.leaveTypes.find((x) => x.leave_type_name === leaveType);
    if (lt && !lt.deduct_from_annual_leave) return false; // 차감 안 하는 유형
    const emp = data.employees.find((x) => x.id === employeeId);
    if (!emp) return false;
    let available = summarizeEmployee(emp, data).remaining;
    // 수정 중이고 기존 건이 이미 차감돼 있었다면 되돌려서 계산
    if (initial && initial.status === "Approved") available += initial.days_count;
    return previewDays > available;
  }, [status, leaveType, employeeId, previewDays, data, initial]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const emp = data.employees.find((x) => x.id === employeeId);
    if (!emp) return;
    if (!isHalf && endDate < startDate) {
      alert(t("form.endBeforeStart"));
      return;
    }
    const payload = {
      employee_id: employeeId,
      team: emp.team,
      leave_type: leaveType,
      start_date: startDate,
      end_date: isHalf ? startDate : endDate,
      half_day_type: isHalf
        ? halfDay === "none"
          ? "AM"
          : halfDay
        : ("none" as HalfDayType),
      reason,
      status,
    };
    if (initial) updateLeave(initial.id, payload);
    else addLeave(payload);
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t("form.employee")}>
          <Select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          >
            {activeEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.team})
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("form.leaveType")}>
          <Select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveTypeKey)}
          >
            {LEAVE_TYPE_KEYS.map((ty) => (
              <option key={ty} value={ty}>
                {ty}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("form.startDate")}>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Field>

        <Field label={isHalf ? t("form.endDateHalf") : t("form.endDate")}>
          <Input
            type="date"
            value={isHalf ? startDate : endDate}
            disabled={isHalf}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Field>

        <Field label={t("form.halfType")}>
          <Select
            value={halfDay}
            onChange={(e) => setHalfDay(e.target.value as HalfDayType)}
          >
            <option value="none">{t("half.none")}</option>
            <option value="AM">{t("half.am")}</option>
            <option value="PM">{t("half.pm")}</option>
          </Select>
        </Field>

        <Field label={t("form.status")}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeaveStatus)}
          >
            {LEAVE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label={t("form.reason")}>
        <Textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("form.reasonPlaceholder")}
        />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
          {t("form.previewDays")}
        </span>
        <span className="font-bold text-brand-600 dark:text-brand-500">
          {previewDays}
          {t("common.days")}
        </span>
      </div>
      {overLimit && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          ⚠️ {t("form.overLimit")}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">
          {initial ? t("common.saveEdit") : t("form.submitNew")}
        </Button>
      </div>
    </form>
  );
}
