"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { downloadCSV } from "@/lib/csv";
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
import { LeaveRequest, TeamName, CATEGORY_KEYS } from "@/lib/types";
import { fmtDate } from "@/lib/date";

export default function LeavesPage() {
  const { data, deleteLeave, isAdmin } = useStore();
  const { t, lang } = useI18n();
  const [team, setTeam] = useState<TeamName | "ALL">("ALL");
  const [cat, setCat] = useState<string>("ALL");
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
      .filter((l) => (cat === "ALL" ? true : l.leave_type === cat))
      .filter((l) => (emp === "ALL" ? true : l.employee_id === emp))
      .sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
  }, [data.leaves, team, cat, emp]);

  // 선택 구성원의 유형별 일정 건수
  const catBreakdown = useMemo(() => {
    if (emp === "ALL") return [];
    const map: Record<string, number> = {};
    data.leaves.forEach((l) => {
      if (l.employee_id !== emp) return;
      map[l.leave_type] = (map[l.leave_type] ?? 0) + 1;
    });
    return Object.entries(map).filter(([, v]) => v > 0);
  }, [emp, data.leaves]);

  function exportCSV() {
    const headers = [
      "구성원/Member",
      "팀/Team",
      "유형/Category",
      "시작일/Start",
      "종료일/End",
      "일수/Days",
      "내용/Details",
    ];
    const rowsCsv = rows.map((l) => [
      empById[l.employee_id]?.name ?? "",
      l.team,
      l.leave_type,
      l.start_date,
      l.end_date,
      l.days_count,
      l.reason,
    ]);
    downloadCSV(`schedule_${new Date().toISOString().slice(0, 10)}.csv`, headers, rowsCsv);
  }

  const th = "px-4 py-3 font-medium";
  const td = "px-4 py-3";

  return (
    <div>
      <PageHeader
        title={t("leaves.title")}
        subtitle={t("leaves.subtitle")}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download size={16} /> {t("common.export")}
            </Button>
            {isAdmin && (
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} /> {t("dash.addLeave")}
              </Button>
            )}
          </div>
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
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-auto">
          <option value="ALL">{t("common.allTypes")}</option>
          {CATEGORY_KEYS.map((c) => (
            <option key={c} value={c}>
              {t(`category.${c}`)}
            </option>
          ))}
        </Select>
        {emp !== "ALL" && catBreakdown.length > 0 && (
          <span className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {catBreakdown.map(([type, n]) => (
              <span key={type} className="inline-flex items-center gap-1">
                <LeaveTypeChip type={type} />
                {n}
                {t("common.cases")}
              </span>
            ))}
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400">{rows.length}</span>
      </Card>

      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState text={t("leaves.empty")} />
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className={th}>{t("leaves.col.employee")}</th>
                <th className={th}>{t("employees.col.team")}</th>
                <th className={th}>{t("leaves.col.type")}</th>
                <th className={th}>{t("leaves.col.period")}</th>
                <th className={`${th} text-right`}>{t("leaves.col.days")}</th>
                <th className={th}>{t("leaves.col.reason")}</th>
                <th className={`${th} text-right`}>{t("common.manage")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const e = empById[l.employee_id];
                return (
                  <tr
                    key={l.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  >
                    <td className={`${td} font-medium text-slate-800 dark:text-slate-100`}>
                      {e?.name ?? "—"}
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
                    </td>
                    <td className={`${td} text-right font-medium text-slate-700 dark:text-slate-200`}>
                      {l.days_count}
                    </td>
                    <td
                      className={`${td} max-w-[220px] truncate text-slate-600 dark:text-slate-300`}
                      title={l.reason}
                    >
                      {l.reason || "—"}
                    </td>
                    <td className={td}>
                      <div className="flex justify-end gap-1">
                        {isAdmin ? (
                          <>
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
                          </>
                        ) : (
                          <span className="text-xs text-slate-300 dark:text-slate-600">—</span>
                        )}
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
