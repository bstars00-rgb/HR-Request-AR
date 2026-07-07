"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
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
import { TeamChip, LeaveTypeChip } from "@/components/chips";
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
import { teamColor, CATEGORY_KEYS, categoryColor } from "@/lib/types";

// 특정 날짜에 걸치는 일정
function entriesOnDate(dISO: string, leaves: any[]) {
  return leaves.filter((l) => dISO >= l.start_date && dISO <= l.end_date);
}

export default function DashboardPage() {
  const { data, ready, isAdmin } = useStore();
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

  const todayEntries = useMemo(
    () => entriesOnDate(tISO, data.leaves),
    [tISO, data.leaves]
  );

  const weekEntries = useMemo(
    () =>
      data.leaves.filter((l) =>
        rangesOverlap(l.start_date, l.end_date, toISO(week.start), toISO(week.end))
      ),
    [data.leaves, week.start, week.end]
  );

  const monthEntries = useMemo(
    () =>
      data.leaves.filter((l) =>
        rangesOverlap(l.start_date, l.end_date, toISO(month.start), toISO(month.end))
      ),
    [data.leaves, month.start, month.end]
  );

  // 오늘 자리 비움 = 출장 + 개인/휴가
  const awayToday = useMemo(
    () => todayEntries.filter((l) => l.leave_type === "Trip" || l.leave_type === "Personal"),
    [todayEntries]
  );

  const teamTodayCount = useMemo(() => {
    const counts: Record<string, number> = {};
    teamNames.forEach((tm) => (counts[tm] = 0));
    todayEntries.forEach((l) => {
      counts[l.team] = (counts[l.team] ?? 0) + 1;
    });
    return counts;
  }, [todayEntries, teamNames]);

  // 이번 달 카테고리별 건수
  const catMonth = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORY_KEYS.forEach((c) => (map[c] = 0));
    monthEntries.forEach((l) => {
      map[l.leave_type] = (map[l.leave_type] ?? 0) + 1;
    });
    return CATEGORY_KEYS.map((c) => ({ key: c, n: map[c] ?? 0 }));
  }, [monthEntries]);

  // 이번 주 다가오는 일정 (오늘 이후 시작, 최대 6개)
  const upcoming = useMemo(
    () =>
      [...data.leaves]
        .filter((l) => l.start_date >= tISO && l.start_date <= toISO(week.end))
        .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
        .slice(0, 6),
    [data.leaves, tISO, week.end]
  );

  const catMonthMax = Math.max(1, ...catMonth.map((c) => c.n));

  if (!ready)
    return <div className="text-sm text-slate-400">{t("common.loading")}</div>;

  return (
    <div>
      <PageHeader
        title={t("dash.title")}
        subtitle={`${fmtDate(tISO, lang)} · ${t("dash.subtitle")}`}
        action={
          isAdmin ? (
            <Button onClick={() => setOpenForm(true)}>
              <Plus size={16} /> {t("dash.addLeave")}
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("dash.todayLeavers")} value={`${todayEntries.length}${t("common.cases")}`} accent="#2563eb" />
        <StatCard label={t("dash.weekLeavers")} value={`${weekEntries.length}${t("common.cases")}`} accent="#16a34a" />
        <StatCard label={t("dash.monthLeavers")} value={`${monthEntries.length}${t("common.cases")}`} accent="#7c3aed" />
        <StatCard
          label={t("dash.riskAlerts")}
          value={`${awayToday.length}${t("common.people")}`}
          hint={t("dash.next14")}
          accent="#d97706"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 오늘 일정 */}
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
          {todayEntries.length === 0 ? (
            <EmptyState text={t("dash.noTodayLeave")} />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {todayEntries.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {empById[l.employee_id]?.name ?? "—"}
                    </span>
                    <TeamChip team={l.team} />
                    <span className="truncate text-xs text-slate-400">{l.reason}</span>
                  </div>
                  <LeaveTypeChip type={l.leave_type} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 팀별 오늘 일정 수 */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.teamTodayCount")}
          </h2>
          <div className="space-y-2.5">
            {teamNames.map((tm) => {
              const c = teamTodayCount[tm] ?? 0;
              const total = data.employees.filter((e) => e.team === tm).length;
              const pct = total ? Math.min(100, (c / total) * 100) : 0;
              return (
                <div key={tm}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <TeamChip team={tm} />
                    <span className="text-slate-500 dark:text-slate-400">{c}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: teamColor(tm) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 이번 주 다가오는 일정 */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.bottomRemaining")}
          </h2>
          {upcoming.length === 0 ? (
            <EmptyState text={t("teams.noUpcoming")} />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {upcoming.map((l) => (
                <div key={l.id} className="py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {empById[l.employee_id]?.name}
                    </span>
                    <LeaveTypeChip type={l.leave_type} />
                  </div>
                  <div className="text-xs text-slate-400">
                    {fmtDate(l.start_date, lang)}
                    {l.start_date !== l.end_date && ` ~ ${fmtDate(l.end_date, lang)}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 이번 달 카테고리별 건수 */}
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("dash.topUsage")}
          </h2>
          <div className="space-y-2.5">
            {catMonth.map(({ key, n }) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <LeaveTypeChip type={key} />
                  <span className="text-slate-500 dark:text-slate-400">
                    {n}
                    {t("common.cases")}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(n / catMonthMax) * 100}%`, backgroundColor: categoryColor(key) }}
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
