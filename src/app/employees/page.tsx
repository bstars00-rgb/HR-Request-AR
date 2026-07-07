"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { downloadCSV } from "@/lib/csv";
import {
  Card,
  PageHeader,
  Button,
  Modal,
  Field,
  Input,
  Select,
  EmptyState,
} from "@/components/ui";
import { TeamChip } from "@/components/chips";
import {
  Employee,
  EMPLOYMENT_STATUSES,
  EmploymentStatus,
  POSITIONS,
  Position,
  Team,
  TeamName,
} from "@/lib/types";
import { todayISO } from "@/lib/date";

export default function EmployeesPage() {
  const { data, addEmployee, updateEmployee, deleteEmployee, isAdmin } = useStore();
  const { t } = useI18n();

  function exportCSV() {
    const headers = [
      "이름/Name",
      "영문명/English",
      "팀/Team",
      "직급/Position",
      "입사일/JoinDate",
      "상태/Status",
    ];
    const rows = data.employees.map((e) => [
      e.name,
      e.english_name,
      e.team,
      e.position,
      e.join_date,
      e.employment_status,
    ]);
    downloadCSV(`members_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
  }

  const [team, setTeam] = useState<TeamName | "ALL">("ALL");
  const [position, setPosition] = useState<Position | "ALL">("ALL");
  const [status, setStatus] = useState<EmploymentStatus | "ALL">("ALL");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    return data.employees.filter((e) => {
      if (team !== "ALL" && e.team !== team) return false;
      if (position !== "ALL" && e.position !== position) return false;
      if (status !== "ALL" && e.employment_status !== status) return false;
      if (q && !`${e.name}${e.english_name}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [data.employees, team, position, status, q]);

  const th = "px-4 py-3 font-medium";
  const td = "px-4 py-3";

  return (
    <div>
      <PageHeader
        title={t("employees.title")}
        subtitle={`${t("employees.total")} ${data.employees.length} · ${t(
          "employees.active"
        )} ${data.employees.filter((e) => e.employment_status === "재직").length}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download size={16} /> {t("common.export")}
            </Button>
            {isAdmin && (
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} /> {t("employees.addEmployee")}
              </Button>
            )}
          </div>
        }
      />

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400"
          />
          <Input
            placeholder={t("employees.searchName")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-44 pl-8"
          />
        </div>
        <Select value={team} onChange={(e) => setTeam(e.target.value as any)} className="w-auto">
          <option value="ALL">{t("common.allTeams")}</option>
          {data.teams.map((tm) => (
            <option key={tm.id} value={tm.team_name}>
              {tm.team_name}
            </option>
          ))}
        </Select>
        <Select
          value={position}
          onChange={(e) => setPosition(e.target.value as any)}
          className="w-auto"
        >
          <option value="ALL">{t("common.allPositions")}</option>
          {POSITIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-auto">
          <option value="ALL">{t("common.allStatus")}</option>
          {EMPLOYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`emp.${s}`)}
            </option>
          ))}
        </Select>
      </Card>

      <Card className="overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState text={t("employees.empty")} />
        ) : (
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className={th}>{t("employees.col.name")}</th>
                <th className={th}>{t("employees.col.team")}</th>
                <th className={th}>{t("employees.col.position")}</th>
                <th className={th}>{t("employees.col.joinDate")}</th>
                <th className={th}>{t("employees.col.status")}</th>
                <th className={`${th} text-right`}>{t("common.manage")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                return (
                  <tr
                    key={e.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  >
                    <td className={td}>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {e.name}
                      </div>
                      <div className="text-xs text-slate-400">{e.english_name}</div>
                    </td>
                    <td className={td}>
                      <TeamChip team={e.team} />
                    </td>
                    <td className={`${td} text-slate-600 dark:text-slate-300`}>{e.position}</td>
                    <td className={`${td} text-slate-500 dark:text-slate-400`}>{e.join_date}</td>
                    <td className={td}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          e.employment_status === "재직"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : e.employment_status === "휴직"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
                        }`}
                      >
                        {t(`emp.${e.employment_status}`)}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex justify-end gap-1">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => setEditing(e)}
                              className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                              title={t("common.edit")}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`${e.name} — ${t("employees.confirmDelete")}`))
                                  deleteEmployee(e.id);
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

      {(creating || editing) && (
        <EmployeeFormModal
          initial={editing ?? undefined}
          teams={data.teams}
          defaultLeave={data.settings.default_annual_leave}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(payload) => {
            if (editing) updateEmployee(editing.id, payload);
            else addEmployee(payload as any);
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function EmployeeFormModal({
  initial,
  teams,
  defaultLeave,
  onClose,
  onSubmit,
}: {
  initial?: Employee;
  teams: Team[];
  defaultLeave: number;
  onClose: () => void;
  onSubmit: (payload: Omit<Employee, "id" | "created_at" | "updated_at">) => void;
}) {
  const { t } = useI18n();
  const [f, setF] = useState({
    name: initial?.name ?? "",
    english_name: initial?.english_name ?? "",
    team: initial?.team ?? teams[0]?.team_name ?? "",
    position: initial?.position ?? ("Staff" as Position),
    join_date: initial?.join_date ?? todayISO(),
    annual_leave_entitlement: initial?.annual_leave_entitlement ?? defaultLeave,
    carried_over_leave: initial?.carried_over_leave ?? 0,
    used_adjustment: initial?.used_adjustment ?? 0,
    employment_status: initial?.employment_status ?? ("재직" as EmploymentStatus),
    role: initial?.role ?? ("staff" as Employee["role"]),
    notes: initial?.notes ?? "",
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? t("employees.editEmployee") : t("employees.addEmployee")}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(f);
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("employees.field.name")}>
            <Input value={f.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label={t("employees.field.englishName")}>
            <Input
              value={f.english_name}
              onChange={(e) => set("english_name", e.target.value)}
            />
          </Field>
          <Field label={t("employees.field.team")}>
            <Select value={f.team} onChange={(e) => set("team", e.target.value as TeamName)}>
              {teams.map((tm) => (
                <option key={tm.id} value={tm.team_name}>
                  {tm.team_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("employees.field.position")}>
            <Select
              value={f.position}
              onChange={(e) => set("position", e.target.value as Position)}
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("employees.field.joinDate")}>
            <Input
              type="date"
              value={f.join_date}
              onChange={(e) => set("join_date", e.target.value)}
            />
          </Field>
          <Field label={t("employees.field.status")}>
            <Select
              value={f.employment_status}
              onChange={(e) =>
                set("employment_status", e.target.value as EmploymentStatus)
              }
            >
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`emp.${s}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t("employees.field.notes")}>
          <Input value={f.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit">{initial ? t("common.saveEdit") : t("common.add")}</Button>
        </div>
      </form>
    </Modal>
  );
}
