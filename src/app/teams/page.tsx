"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Card, PageHeader, StatCard, EmptyState } from "@/components/ui";
import { StatusChip, LeaveTypeChip } from "@/components/chips";
import { summarizeEmployee } from "@/lib/leave-calc";
import { TeamName, teamColor } from "@/lib/types";
import { fmtDate, todayISO } from "@/lib/date";

export default function TeamsPage() {
  const { data } = useStore();
  const { t, lang } = useI18n();
  const [selected, setSelected] = useState<TeamName>("");
  const tISO = todayISO();

  const teamNames = data.teams.map((tm) => tm.team_name);
  // 선택된 팀이 없거나 삭제됐으면 첫 팀으로 대체
  const team = teamNames.includes(selected) ? selected : teamNames[0] ?? "";

  const empById = useMemo(
    () => Object.fromEntries(data.employees.map((e) => [e.id, e])),
    [data.employees]
  );

  const members = useMemo(
    () => data.employees.filter((e) => e.team === team),
    [data.employees, team]
  );
  const active = members.filter((e) => e.employment_status === "재직");
  const teamMeta = data.teams.find((x) => x.team_name === team);

  const summary = useMemo(() => {
    let remaining = 0;
    active.forEach((e) => {
      remaining += summarizeEmployee(e, data).remaining;
    });
    return { remaining };
  }, [active, data]);

  const upcoming = useMemo(
    () =>
      data.leaves
        .filter(
          (l) =>
            l.team === team &&
            l.status !== "Rejected" &&
            l.status !== "Cancelled" &&
            l.end_date >= tISO
        )
        .sort((a, b) => (a.start_date < b.start_date ? -1 : 1)),
    [data.leaves, team, tISO]
  );

  return (
    <div>
      <PageHeader title={t("teams.title")} subtitle={t("teams.subtitle")} />

      <div className="mb-4 flex flex-wrap gap-2">
        {data.teams.map((tm) => (
          <button
            key={tm.id}
            onClick={() => setSelected(tm.team_name)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              team === tm.team_name
                ? "text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            style={
              team === tm.team_name
                ? { backgroundColor: teamColor(tm.team_name) }
                : undefined
            }
          >
            {tm.team_name}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("teams.activeCount")} value={`${active.length}`} accent={teamColor(team)} />
        <StatCard label={t("teams.manager")} value={teamMeta?.manager_name ?? "—"} />
        <StatCard label={t("teams.warnThreshold")} value={`${teamMeta?.warning_threshold ?? "-"}`} />
        <StatCard label={t("teams.remainingSum")} value={`${summary.remaining}${t("common.days")}`} accent="#059669" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-x-auto p-0">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-100">
            {t("teams.memberLeave")}
          </div>
          {active.length === 0 ? (
            <EmptyState text={t("teams.noMembers")} />
          ) : (
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-2 font-medium">{t("employees.col.name")}</th>
                  <th className="px-4 py-2 font-medium">{t("employees.col.position")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("employees.col.used")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("employees.col.remaining")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("teams.col.usageRate")}</th>
                </tr>
              </thead>
              <tbody>
                {active.map((e) => {
                  const s = summarizeEmployee(e, data);
                  return (
                    <tr key={e.id} className="border-t border-slate-50 dark:border-slate-800/60">
                      <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-100">{e.name}</td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{e.position}</td>
                      <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{s.used}</td>
                      <td className="px-4 py-2 text-right">
                        <span
                          className={
                            s.remaining <= 3
                              ? "font-semibold text-red-600 dark:text-red-400"
                              : "font-semibold text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {s.remaining}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500 dark:text-slate-400">
                        {Math.round(s.usageRate * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="p-0">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-slate-800 dark:text-slate-100">
            {t("teams.upcoming")}
          </div>
          {upcoming.length === 0 ? (
            <EmptyState text={t("teams.noUpcoming")} />
          ) : (
            <div className="max-h-[360px] divide-y divide-slate-50 overflow-y-auto dark:divide-slate-800/60">
              {upcoming.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {empById[l.employee_id]?.name}
                      </span>
                      <StatusChip status={l.status} />
                    </div>
                    <div className="text-xs text-slate-400">
                      {fmtDate(l.start_date, lang)}
                      {l.start_date !== l.end_date && ` ~ ${fmtDate(l.end_date, lang)}`} · {l.days_count}
                      {t("common.days")}
                    </div>
                  </div>
                  <LeaveTypeChip type={l.leave_type} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
