"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import {
  Card,
  PageHeader,
  Button,
  Modal,
  Select,
  EmptyState,
} from "@/components/ui";
import { TeamChip, LeaveTypeChip } from "@/components/chips";
import LeaveForm from "@/components/LeaveForm";
import {
  LeaveRequest,
  LeaveStatus,
  LEAVE_STATUSES,
  TeamName,
} from "@/lib/types";
import { fmtDate } from "@/lib/date";
import { summarizeEmployee } from "@/lib/leave-calc";

export default function LeavesPage() {
  const { data, updateLeave, deleteLeave } = useStore();
  const { t, lang } = useI18n();
  const [team, setTeam] = useState<TeamName | "ALL">("ALL");
  const [status, setStatus] = useState<LeaveStatus | "ALL">("ALL");
  const [emp, setEmp] = useState<string>("ALL");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<LeaveRequest | null>(null);

  const empById = useMemo(
    () => Object.fromEntries(data.employees.map((e) => [e.id, e])),
    [data.employees]
  );

  const rows = useMemo(() => {
    return [...data.leaves]
      .filter((l) => (team === "ALL" ? true : l.team === team))
      .filter((l) => (status === "ALL" ? true : l.status === status))
      .filter((l) => (emp === "ALL" ? true : l.employee_id === emp))
      .sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  }, [data.leaves, team, status, emp]);

  // 특정 직원 선택 시 사용/잔여 요약
  const selectedSummary = useMemo(() => {
    if (emp === "ALL") return null;
    const e = empById[emp];
    return e ? summarizeEmployee(e, data) : null;
  }, [emp, empById, data]);

  const th = "px-4 py-3 font-medium";
  const td = "px-4 py-3";

  return (
    <div>
      <PageHeader
        title={t("leaves.title")}
        subtitle={t("leaves.subtitle")}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> {t("dash.addLeave")}
          </Button>
        }
      />

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <Select value={emp} onChange={(e) => setEmp(e.target.value)} className="w-auto">
          <option value="ALL">{t("common.allEmployees")}</option>
          {data.employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.team})
            </option>
          ))}
        </Select>
        <Select value={team} onChange={(e) => setTeam(e.target.value as any)} className="w-auto">
          <option value="ALL">{t("common.allTeams")}</option>
          {data.teams.map((tm) => (
            <option key={tm.id} value={tm.team_name}>
              {tm.team_name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-auto">
          <option value="ALL">{t("common.allStatus")}</option>
          {LEAVE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </Select>
        {selectedSummary && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t("employees.col.used")} {selectedSummary.used}
            {t("common.days")} · {t("employees.col.remaining")}{" "}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedSummary.remaining}
              {t("common.days")}
            </span>
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400">{rows.length}</span>
      </Card>

      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState text={t("leaves.empty")} />
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className={th}>{t("leaves.col.employee")}</th>
                <th className={th}>{t("employees.col.team")}</th>
                <th className={th}>{t("leaves.col.type")}</th>
                <th className={th}>{t("leaves.col.period")}</th>
                <th className={`${th} text-right`}>{t("leaves.col.days")}</th>
                <th className={th}>{t("leaves.col.reason")}</th>
                <th className={th}>{t("employees.col.status")}</th>
                <th className={`${th} text-right`}>{t("common.manage")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const emp = empById[l.employee_id];
                const half =
                  l.half_day_type !== "none"
                    ? l.half_day_type === "AM"
                      ? t("half.amLeave")
                      : t("half.pmLeave")
                    : "";
                return (
                  <tr
                    key={l.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  >
                    <td className={`${td} font-medium text-slate-800 dark:text-slate-100`}>
                      {emp?.name ?? "—"}
                    </td>
                    <td className={td}>
                      <TeamChip team={l.team} />
                    </td>
                    <td className={td}>
                      <LeaveTypeChip type={l.leave_type} />
                    </td>
                    <td className={`${td} text-slate-600 dark:text-slate-300`}>
                      {fmtDate(l.start_date, lang)}
                      {l.start_date !== l.end_date && ` ~ ${fmtDate(l.end_date, lang)}`}
                      <span className="text-slate-400"> {half}</span>
                    </td>
                    <td className={`${td} text-right font-medium text-slate-700 dark:text-slate-200`}>
                      {l.days_count}
                    </td>
                    <td
                      className={`${td} max-w-[180px] truncate text-slate-500 dark:text-slate-400`}
                      title={l.reason}
                    >
                      {l.reason || "—"}
                    </td>
                    <td className={td}>
                      <Select
                        value={l.status}
                        onChange={(e) =>
                          updateLeave(l.id, { status: e.target.value as LeaveStatus })
                        }
                        className="w-auto !px-2 !py-1 text-xs"
                      >
                        {LEAVE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(`status.${s}`)}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className={td}>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditing(l)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                          title={t("common.edit")}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t("leaves.confirmDelete"))) deleteLeave(l.id);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                          title={t("common.delete")}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={creating} onClose={() => setCreating(false)} title={t("dash.addLeave")} wide>
        <LeaveForm onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("leaves.editLeave")} wide>
        {editing && <LeaveForm initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
