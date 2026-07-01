"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
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
import { summarizeEmployee } from "@/lib/leave-calc";
import {
  Employee,
  EMPLOYMENT_STATUSES,
  EmploymentStatus,
  POSITIONS,
  Position,
  Country,
  Team,
  TeamName,
} from "@/lib/types";
import { todayISO } from "@/lib/date";

export default function EmployeesPage() {
  const { data, addEmployee, updateEmployee, deleteEmployee } = useStore();
  const { t } = useI18n();

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
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> {t("employees.addEmployee")}
          </Button>
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
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className={th}>{t("employees.col.name")}</th>
                <th className={th}>{t("employees.col.team")}</th>
                <th className={th}>{t("employees.col.position")}</th>
                <th className={th}>{t("employees.col.joinDate")}</th>
                <th className={`${th} text-right`}>{t("employees.col.baseCarry")}</th>
                <th className={`${th} text-right`}>{t("employees.col.used")}</th>
                <th className={`${th} text-right`}>{t("employees.col.remaining")}</th>
                <th className={th}>{t("employees.col.status")}</th>
                <th className={`${th} text-right`}>{t("common.manage")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const s = summarizeEmployee(e, data);
                return (
                  <tr
                    key={e.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  >
                    <td className={td}>
                      <div className="font-medium text-slate-800 dark:text-slate-100">
                        {e.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {e.english_name}
                        {e.country ? ` · ${e.country}` : ""}
                      </div>
                    </td>
                    <td className={td}>
                      <TeamChip team={e.team} />
                    </td>
                    <td className={`${td} text-slate-600 dark:text-slate-300`}>{e.position}</td>
                    <td className={`${td} text-slate-500 dark:text-slate-400`}>{e.join_date}</td>
                    <td className={`${td} text-right text-slate-600 dark:text-slate-300`}>
                      {e.annual_leave_entitlement + e.carried_over_leave}
                    </td>
                    <td className={`${td} text-right text-slate-600 dark:text-slate-300`}>{s.used}</td>
                    <td className={`${td} text-right`}>
                      <span
                        className={`font-semibold ${
                          s.remaining <= 3
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {s.remaining}
                      </span>
                    </td>
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
          countries={data.countries}
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
  countries,
  defaultLeave,
  onClose,
  onSubmit,
}: {
  initial?: Employee;
  teams: Team[];
  countries: Country[];
  defaultLeave: number;
  onClose: () => void;
  onSubmit: (payload: Omit<Employee, "id" | "created_at" | "updated_at">) => void;
}) {
  const { t } = useI18n();
  const initialCountry = initial?.country ?? countries[0]?.name ?? "한국";
  const countryDefault =
    countries.find((c) => c.name === initialCountry)?.default_annual_leave ??
    defaultLeave;

  const [f, setF] = useState({
    name: initial?.name ?? "",
    english_name: initial?.english_name ?? "",
    team: initial?.team ?? teams[0]?.team_name ?? "",
    position: initial?.position ?? ("Staff" as Position),
    join_date: initial?.join_date ?? todayISO(),
    country: initialCountry,
    annual_leave_entitlement: initial?.annual_leave_entitlement ?? countryDefault,
    carried_over_leave: initial?.carried_over_leave ?? 0,
    employment_status: initial?.employment_status ?? ("재직" as EmploymentStatus),
    role: initial?.role ?? ("staff" as Employee["role"]),
    notes: initial?.notes ?? "",
  });

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  // 국가 선택 시 그 국가의 기본 연차로 자동 채움 (이후 개별 수정 가능)
  function setCountry(name: string) {
    const d = countries.find((c) => c.name === name)?.default_annual_leave;
    setF((prev) => ({
      ...prev,
      country: name,
      annual_leave_entitlement: d ?? prev.annual_leave_entitlement,
    }));
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
          <Field label={t("employees.field.country")}>
            <Select value={f.country} onChange={(e) => setCountry(e.target.value)}>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.default_annual_leave}
                  {t("common.days")})
                </option>
              ))}
            </Select>
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
          <Field label={t("employees.field.entitlement")}>
            <Input
              type="number"
              step="0.5"
              value={f.annual_leave_entitlement}
              onChange={(e) => set("annual_leave_entitlement", Number(e.target.value))}
            />
          </Field>
          <Field label={t("employees.field.carryover")}>
            <Input
              type="number"
              step="0.5"
              value={f.carried_over_leave}
              onChange={(e) => set("carried_over_leave", Number(e.target.value))}
            />
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
