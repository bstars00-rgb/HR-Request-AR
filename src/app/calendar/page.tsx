"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Printer, Plus, Download } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n, KO_WEEKDAYS, EN_WEEKDAYS } from "@/lib/i18n";
import { Card, PageHeader, Select, Button, Modal } from "@/components/ui";
import LeaveForm from "@/components/LeaveForm";
import { downloadCSV } from "@/lib/csv";
import { monthGrid, monthLabelL, toISO, today, isWeekend } from "@/lib/date";
import {
  CATEGORY_KEYS,
  TeamName,
  categoryColor,
  LeaveRequest,
} from "@/lib/types";
import { leavesOnDate } from "@/lib/leave-calc";

export default function CalendarPage() {
  const { data, deleteLeave, isAdmin } = useStore();
  const { t, lang } = useI18n();
  const base = today();
  const [year, setYear] = useState(base.getFullYear());
  const [month0, setMonth0] = useState(base.getMonth());

  const [teamFilter, setTeamFilter] = useState<TeamName | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [empFilter, setEmpFilter] = useState<string>("ALL");

  // 등록/수정 모달 상태
  const [creating, setCreating] = useState(false);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  const [editing, setEditing] = useState<LeaveRequest | null>(null);

  const WEEKDAYS = lang === "en" ? EN_WEEKDAYS : KO_WEEKDAYS;

  const empById = useMemo(
    () => Object.fromEntries(data.employees.map((e) => [e.id, e])),
    [data.employees]
  );

  // 날짜별 공휴일/박람회 배지 (하루에 여러 개 가능)
  const holidaysByDate = useMemo(() => {
    const map: Record<string, typeof data.holidays> = {};
    for (const h of data.holidays) {
      (map[h.date] ??= []).push(h);
    }
    // 공휴일 먼저, 박람회 나중 (표시 순서)
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) =>
        (a.notes === "FAIR" ? 1 : 0) - (b.notes === "FAIR" ? 1 : 0)
      );
    }
    return map;
  }, [data.holidays]);

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

  function matchesFilters(l: LeaveRequest) {
    if (teamFilter !== "ALL" && l.team !== teamFilter) return false;
    if (typeFilter !== "ALL" && l.leave_type !== typeFilter) return false;
    if (empFilter !== "ALL" && l.employee_id !== empFilter) return false;
    return true;
  }

  function leavesForCell(dISO: string) {
    return leavesOnDate(dISO, data, { includePending: true }).filter(matchesFilters);
  }

  // 날짜 클릭 → 그 날짜로 일정 등록
  function onDayClick(dISO: string) {
    if (!isAdmin) return;
    setDefaultDate(dISO);
    setCreating(true);
  }

  // 표시 중인 달과 겹치는 일정(필터 적용)을 CSV로
  function exportCSV() {
    const monthStart = toISO(new Date(year, month0, 1));
    const monthEnd = toISO(new Date(year, month0 + 1, 0));
    const rows = data.leaves
      .filter(matchesFilters)
      .filter((l) => l.start_date <= monthEnd && l.end_date >= monthStart)
      .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
      .map((l) => [
        empById[l.employee_id]?.name ?? "",
        l.team,
        l.leave_type,
        l.start_date,
        l.end_date,
        l.days_count,
        l.reason,
      ]);
    downloadCSV(
      `schedule_${year}-${String(month0 + 1).padStart(2, "0")}.csv`,
      ["구성원/Member", "팀/Team", "유형/Category", "시작일/Start", "종료일/End", "일수/Days", "내용/Details"],
      rows
    );
  }

  return (
    <div>
      <PageHeader
        title={t("cal.title")}
        subtitle={t("cal.subtitle")}
        action={
          <div className="no-print flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download size={16} /> {t("common.export")}
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={16} /> {t("cal.print")}
            </Button>
            {isAdmin && (
              <Button
                onClick={() => {
                  setDefaultDate(undefined);
                  setCreating(true);
                }}
              >
                <Plus size={16} /> {t("dash.addLeave")}
              </Button>
            )}
          </div>
        }
      />

      <Card className="no-print mb-3 flex flex-wrap items-center gap-2 p-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={prev} aria-label={t("cal.prevMonth")}>
            <ChevronLeft size={18} />
          </Button>
          <span className="min-w-[104px] text-center text-sm font-semibold text-slate-800 dark:text-slate-100">
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
            className="!w-auto"
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
            className="!w-auto"
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
            className="!w-auto"
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

      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {CATEGORY_KEYS.map((ty) => (
          <span key={ty} className="inline-flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: categoryColor(ty) }}
            />
            {t(`category.${ty}`)}
          </span>
        ))}
        {isAdmin && (
          <span className="no-print ml-auto text-slate-400">{t("cal.hint")}</span>
        )}
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
            const dayBadges = holidaysByDate[dISO] ?? [];
            const cellLeaves = leavesForCell(dISO);
            return (
              <div
                key={idx}
                onClick={() => onDayClick(dISO)}
                className={`min-h-[92px] border-b border-r border-slate-100 p-1.5 dark:border-slate-800 ${
                  inMonth
                    ? "bg-white dark:bg-slate-900"
                    : "bg-slate-50/60 dark:bg-slate-950/40"
                } ${isAdmin ? "cursor-pointer hover:bg-brand-50/50 dark:hover:bg-slate-800/60" : ""}`}
              >
                <div className="mb-1 flex items-start justify-between gap-1">
                  <span
                    className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-xs ${
                      isToday
                        ? "bg-brand-600 font-bold text-white"
                        : isWeekend(d)
                        ? "text-red-400"
                        : "text-slate-500 dark:text-slate-400"
                    } ${!inMonth ? "opacity-40" : ""}`}
                  >
                    {d.getDate()}
                  </span>
                  {dayBadges.length > 0 && (
                    <span className="flex min-w-0 flex-col items-end gap-0.5">
                      {dayBadges.slice(0, 2).map((h) => (
                        <span
                          key={h.id}
                          className={`max-w-full truncate rounded px-1 text-[10px] ${
                            h.notes === "FAIR"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                          title={`${h.country} · ${h.holiday_name}`}
                        >
                          {h.holiday_name}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {cellLeaves.slice(0, 3).map((l) => {
                    const emp = empById[l.employee_id];
                    const color = categoryColor(l.leave_type);
                    return (
                      <div
                        key={l.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAdmin) setEditing(l);
                        }}
                        className="truncate rounded px-1 py-0.5 text-[11px] font-medium text-white"
                        style={{ backgroundColor: color }}
                        title={`${emp?.name} · ${l.reason || t(`category.${l.leave_type}`)}`}
                      >
                        {emp?.name}
                        {l.reason ? ` · ${l.reason}` : ""}
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

      {/* 등록 모달 (날짜 클릭 시 그 날짜 프리필) */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={t("dash.addLeave")}
        wide
      >
        {creating && (
          <LeaveForm defaultDate={defaultDate} onDone={() => setCreating(false)} />
        )}
      </Modal>

      {/* 수정/삭제 모달 (일정 클릭 시) */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={t("leaves.editLeave")}
        wide
      >
        {editing && (
          <LeaveForm
            initial={editing}
            onDone={() => setEditing(null)}
            onDelete={() => {
              deleteLeave(editing.id);
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
