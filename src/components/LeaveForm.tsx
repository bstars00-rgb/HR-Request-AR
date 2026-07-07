"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { LeaveRequest, CATEGORY_KEYS } from "@/lib/types";
import { todayISO } from "@/lib/date";
import { Button, Field, Input, Select, Textarea } from "./ui";

interface Props {
  initial?: LeaveRequest;
  onDone: () => void;
}

// 일정 등록/수정 폼 (구 LeaveForm)
export default function LeaveForm({ initial, onDone }: Props) {
  const { data, addLeave, updateLeave } = useStore();
  const { t } = useI18n();
  const members = data.employees.filter((e) => e.employment_status !== "퇴사");

  const [employeeId, setEmployeeId] = useState(
    initial?.employee_id ?? members[0]?.id ?? ""
  );
  const [category, setCategory] = useState<string>(
    initial?.leave_type ?? "Fair"
  );
  const [startDate, setStartDate] = useState(initial?.start_date ?? todayISO());
  const [endDate, setEndDate] = useState(initial?.end_date ?? todayISO());
  const [reason, setReason] = useState(initial?.reason ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const emp = data.employees.find((x) => x.id === employeeId);
    if (!emp) return;
    if (endDate < startDate) {
      alert(t("form.endBeforeStart"));
      return;
    }
    const payload = {
      employee_id: employeeId,
      team: emp.team,
      leave_type: category,
      start_date: startDate,
      end_date: endDate,
      half_day_type: "none" as const,
      reason,
      status: "Approved" as const,
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
            {members.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.team})
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t("form.leaveType")}>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_KEYS.map((c) => (
              <option key={c} value={c}>
                {t(`category.${c}`)}
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

        <Field label={t("form.endDate")}>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
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
