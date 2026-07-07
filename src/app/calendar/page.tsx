"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n, KO_WEEKDAYS, EN_WEEKDAYS } from "@/lib/i18n";
import { Card, PageHeader, Select, Button } from "@/components/ui";
import { monthGrid, monthLabelL, toISO, today, isWeekend } from "@/lib/date";
import { CATEGORY_KEYS, TeamName, categoryColor } from "@/lib/types";
import { leavesOnDate } from "@/lib/leave-calc";

export default function CalendarPage() {
  const { data } = useStore();
  const { t, lang } = useI18n();
  const base = today();
  const [year, setYear] = useState(base.getFullYear());
  const [month0, setMonth0] = useState(base.getMonth());

  const [teamFilter, setTeamFilter] = useState<TeamName | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [empFilter, setEmpFilter] = useState<string>("ALL");

  const WEEKDAYS = lang === "en" ? EN_WEEKDAYS : KO_WEEKDAYS;

  const empById = useMemo(
    () => Object.fromEntries(data.employees.map((e) => [e.id, e])),
    [data.employees]
  );

  const holidayByDate = useMemo(
    () => Object.fromEntries(data.holidays.map((h) => [h.date, h])),
    [data.holidays]
  );

  const grid = useMemo(() => monthGrid(year, month0), [year, month0]);
  const todayStr = toISO(today());

  function prev() {
    if (month0 === 0) {
      setMonth0(11);
      setYear((y) => y - 1);
    } else setMonth0((m) => m - 1);
  }
  function next() {
    if (month0 === 11) {
      setMonth0(0);
      setYear((y) => y + 1);
    } else setMonth0((m) => m + 1);
  }
  function goToday() {
    setYear(base.getFullYear());
    setMonth0(base.getMonth());
  }

  function leavesForCell(dISO: string) {
    return leavesOnDate(dISO, data, { includePending: true }).filter((l) => {
      if (teamFilter !== "ALL" && l.team !== teamFilter) return false;
      if (typeFilter !== "ALL" && l.leave_type !== typeFilter) return false;
      if (empFilter !== "ALL" && l.employee_id !== empFilter) return false;
      return true;
    });
  }

  return (
    <div>
      <PageHeader
        title={t("cal.title")}
        subtitle={t("cal.subtitle")}
        action={
          <Button variant="outline" onClick={() => window.print()} className="no-print">
            <Printer size={16} /> {t("cal.print")}
          </Button>
        }
      />

      <Card className="no-print mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={prev} aria-label={t("cal.prevMonth")}>
            <ChevronLeft size={18} />
          </Button>
          <span className="min-w-[120px] text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
            {monthLabelL(year, month0, lang)}
          </span>
          <Button variant="ghost" onClick={next} aria-label={t("cal.nextMonth")}>
            <ChevronRight size={18} />
          </Button>
          <Button variant="outline" onClick={goToday} className="ml-1">
            {t("common.today")}
          </Button>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <Select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value as TeamName | "ALL")}
            className="w-auto"
          >
            <option value="ALL">{t("common.allTeams")}</option>
            {data.teams.map((tm) => (
              <option key={tm.id} value={tm.team_name}>
                {tm.team_name}
              </option>
            ))}
          </Select>
          <Select
            value={empFilter}
            onChange={(e) => setEmpFilter(e.target.value)}
            className="w-auto"
          >
            <option value="ALL">{t("common.allEmployees")}</option>
            {data.employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-auto"
          >
            <option value="ALL">{t("common.allTypes")}</option>
            {CATEGORY_KEYS.map((ty) => (
              <option key={ty} value={ty}>
                {t(`category.${ty}`)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* 인쇄 시에만 보이는 월 제목 */}
      <div className="mb-2 hidden text-lg font-bold print:block">
        {monthLabelL(year, month0, lang)}
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
        {CATEGORY_KEYS.map((ty) => (
          <span key={ty} className="inline-flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: categoryColor(ty) }}
            />
            {t(`category.${ty}`)}
          </span>
        ))}
      </div>

      <Card className="print-area overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
          {WEEKDAYS.map((d, i) => (
            <div key={d} className={`py-2 ${i >= 5 ? "text-red-400" : ""}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((d, idx) => {
            const dISO = toISO(d);
            const inMonth = d.getMonth() === month0;
            const isToday = dISO === todayStr;
            const holiday = holidayByDate[dISO];
            const cellLeaves = leavesForCell(dISO);
            return (
              <div
                key={idx}
                className={`min-h-[92px] border-b border-r border-slate-100 p-1.5 dark:border-slate-800 ${
                  inMonth
                    ? "bg-white dark:bg-slate-900"
                    : "bg-slate-50/60 dark:bg-slate-950/40"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                      isToday
                        ? "bg-brand-600 font-bold text-white"
                        : isWeekend(d)
                        ? "text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    } ${!inMonth ? "opacity-40" : ""}`}
                  >
                    {d.getDate()}
                  </span>
                  {holiday && (
                    <span
                      className="truncate rounded bg-slate-200 px-1 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      title={`${holiday.country} · ${holiday.holiday_name}`}
                    >
                      {holiday.holiday_name}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {cellLeaves.slice(0, 3).map((l) => {
                    const emp = empById[l.employee_id];
                    const color = categoryColor(l.leave_type);
                    const half =
                      l.half_day_type !== "none"
                        ? l.half_day_type === "AM"
                          ? t("half.amShort")
                          : t("half.pmShort")
                        : "";
                    return (
                      <div
                        key={l.id}
                        className="truncate rounded px-1 py-0.5 text-[11px] font-medium text-white"
                        style={{
                          backgroundColor: color,
                          opacity: l.status === "Pending" ? 0.55 : 1,
                        }}
                        title={`${emp?.name} · ${l.leave_type}${half} · ${l.status}`}
                      >
                        {emp?.name}
                        {half}
                      </div>
                    );
                  })}
                  {cellLeaves.length > 3 && (
                    <div className="px-1 text-[10px] text-slate-400">
                      +{cellLeaves.length - 3} {t("cal.more")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
