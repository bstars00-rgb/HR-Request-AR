"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import {
  Card,
  PageHeader,
  StatCard,
  Button,
  Modal,
  EmptyState,
} from "@/components/ui";
import { StatusChip, TeamChip, LeaveTypeChip } from "@/components/chips";
import LeaveForm from "@/components/LeaveForm";
import {
  toISO,
  today,
  todayISO,
  thisWeekRange,
  thisMonthRange,
  rangesOverlap,
  fmtDate,
} from "@/lib/date";
import { leavesOnDate, summarizeEmployee } from "@/lib/leave-calc";
import { TeamName, teamColor } from "@/lib/types";

export default function DashboardPage() {
  const { data, ready } = useStore();
  const { t, lang } = useI18n();
  const [openForm, setOpenForm] = useState(false);

  const tISO = todayISO();
  const week = thisWeekRange();
  const month = thisMonthRange();

  const empById = useMemo(
    () => Object.fromEntries(data.employees.map((e) => [e.id, e])),
    [data.employees]
  );

  const teamNames = useMemo(
    () => data.teams.map((tm) => tm.team_name),
    [data.teams]
  );

  const activeLeaves = useMemo(
    () =>
      data.leaves.filter(
        (l) => l.status === "Approved" || l.status === "Pending"
      ),
    [data.leaves]
  );

  const todayLeaves = useMemo(
    () => leavesOnDate(tISO, data, { includePending: true }),
    [tISO, data]
  );

  const weekLeaves = useMemo(
    () =>
      activeLeaves.filter((l) =>
        rangesOverlap(l.start_date, l.end_date, toISO(week.start), toISO(week.end))
      ),
    [activeLeaves, week.start, week.end]
  );

  const monthLeaves = useMemo(
    () =>
      activeLeaves.filter((l) =>
        rangesOverlap(l.start_date, l.end_date, toISO(month.start), toISO(month.end))
      ),
    [activeLeaves, month.start, month.end]
  );

  const teamTodayCount = useMemo(() => {
    const counts: Record<string, number> = {};
    teamNames.forEach((tm) => (counts[tm] = 0));
    todayLeaves.forEach((l) => {
      counts[l.team] = (counts[l.team] ?? 0) + 1;
    });
    return counts;
  }, [todayLeaves, teamNames]);

  const summaries = useMemo(
    () =>
      data.employees
        .filter((e) => e.employment_status === "재직")
        .map((e) => ({ emp: e, sum: summarizeEmployee(e, data) })),
    [data]
  );

  const bottomRemaining = useMemo(
    () => [...summaries].sort((a, b) => a.sum.remaining - b.sum.remaining).slice(0, 5),
    [summaries]
  );

  const topUsage = useMemo(
    () => [...summaries].sort((a, b) => b.sum.usageRate - a.sum.usageRate).slice(0, 5),
    [summaries]
  );

  const risks = useMemo(() => {
    const out: { date: string; team: TeamName; count: number; threshold: number }[] =
      [];
    const teamThreshold: Record<string, number> = {};
    teamNames.forEach((tm) => {
      teamThreshold[tm] =
        data.teams.find((x) => x.team_name === tm)?.warning_threshold ?? 99;
    });
    for (let i = 0; i < 14; i++) {
      const d = new Date(today());
      d.setDate(d.getDate() + i);
      const dISO = toISO(d);
      const onLeave = leavesOnDate(dISO, data, { includePending: true });
      teamNames.forEach((tm) => {
        const c = onLeave.filter((l) => l.team === tm).length;
        if (c >= teamThreshold[tm] && c > 0) {
          out.push({ date: dISO, team: tm, count: c, threshold: teamThreshold[tm] });
        }
      });
    }
    return out;
  }, [data]);

  if (!ready)
    return <div className="text-sm text-slate-400">{t("common.loading")}</div>;

  return (
    <div>
      <PageHeader
        title={t("dash.title")}
        subtitle={`${fmtDate(tISO, lang)} · ${t("dash.subtitle")}`}
        action={
          <Button onClick={() => setOpenForm(true)}>
            <Plus size={16} /> {t("dash.addLeave")}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("dash.todayLeavers")} value={`${todayLeaves.length}${t("common.people")}`} accent="#dc2626" />
        <StatCard label={t("dash.weekLeavers")} value={`${weekLeaves.length}${t("common.cases")}`} accent="#d97706" />
        <StatCard label={t("dash.monthLeavers")} value={`${monthLeaves.length}${t("common.cases")}`} accent="#2563eb" />
        <StatCard
          label={t("dash.riskAlerts")}
          value={`${risks.length}${t("common.cases")}`}
          hint={t("dash.next14")}
          accent={risks.length ? "#dc2626" : "#059669"}
        />
      </div>

      {risks.length > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50/60 p-4 dark:border-red-500/30 dark:bg-red-500/10">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
            <AlertTriangle size={16} /> {t("dash.riskTitle")}
          </div>
          <div className="flex flex-wrap gap-2">
            {risks.slice(0, 12).map((r, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-2 py-1 text-xs dark:border-red-500/30 dark:bg-slate-900"
              >
                <TeamChip team={r.team} />
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {fmtDate(r.date, lang)}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  {r.count}
                  {t("common.people")} ({t("dash.threshold")} {r.threshold})
                </span>
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t("dash.todayOnLeave")}
            </h2>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-500"
            >
              <CalendarDays size={14} /> {t("nav.calendar")}
            </Link>
          </div>
          {todayLeaves.length === 0 ? (
            <EmptyState text={t("dash.noTodayLeave")} />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayLeaves.map((l) => {
                const emp = empById[l.employee_id];
                return (
                  <div key={l.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {emp?.name ?? "—"}
                      </span>
                      <TeamChip team={l.team} />
                    </div>
                    <div className="flex items-center gap-2">
                      <LeaveTypeChip type={l.leave_type} />
                      <StatusChip status={l.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.teamTodayCount")}
          </h2>
          <div className="space-y-2.5">
            {teamNames.map((tm) => {
              const total = data.employees.filter(
                (e) => e.team === tm && e.employment_status === "재직"
              ).length;
              const c = teamTodayCount[tm] ?? 0;
              const pct = total ? (c / total) * 100 : 0;
              return (
                <div key={tm}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <TeamChip team={tm} />
                    <span className="text-slate-500 dark:text-slate-400">
                      {c} / {total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: teamColor(tm) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.bottomRemaining")}
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bottomRemaining.map(({ emp, sum }) => (
              <div key={emp.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {emp.name}
                  </span>
                  <TeamChip team={emp.team} />
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {sum.remaining}
                  {t("common.days")}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.topUsage")}
          </h2>
          <div className="space-y-2.5">
            {topUsage.map(({ emp, sum }) => (
              <div key={emp.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {emp.name}
                    </span>
                    <TeamChip team={emp.team} />
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {sum.used} / {sum.entitlement + sum.carriedOver} (
                    {Math.round(sum.usageRate * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, sum.usageRate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={t("dash.addLeave")} wide>
        <LeaveForm onDone={() => setOpenForm(false)} />
      </Modal>
    </div>
  );
}
