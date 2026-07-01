"use client";

import { useState } from "react";
import { Plus, Trash2, Database, HardDrive } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import {
  Card,
  PageHeader,
  Button,
  Field,
  Input,
  Select,
  EmptyState,
} from "@/components/ui";
import { TeamChip } from "@/components/chips";
import { TEAM_NAMES, TeamName } from "@/lib/types";
import { todayISO } from "@/lib/date";

export default function SettingsPage() {
  const {
    data,
    isCloud,
    updateSettings,
    updateTeam,
    addHoliday,
    deleteHoliday,
    resetAll,
  } = useStore();
  const { t } = useI18n();

  return (
    <div>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      {/* 데이터 저장소 상태 */}
      <Card
        className={`mb-4 flex items-center gap-3 p-4 ${
          isCloud
            ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            : ""
        }`}
      >
        {isCloud ? (
          <Database size={20} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <HardDrive size={20} className="text-slate-400" />
        )}
        <div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("settings.dbStatus")}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isCloud ? t("settings.dbSupabase") : t("settings.dbLocal")}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 연차 계산 기준 */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("settings.calcRule")}
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {t("settings.excludeWeekends")}
              </span>
              <input
                type="checkbox"
                checked={data.settings.exclude_weekends}
                onChange={(e) => updateSettings({ exclude_weekends: e.target.checked })}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {t("settings.excludeHolidays")}
              </span>
              <input
                type="checkbox"
                checked={data.settings.exclude_holidays}
                onChange={(e) => updateSettings({ exclude_holidays: e.target.checked })}
                className="h-4 w-4"
              />
            </label>
            <Field label={t("settings.defaultLeave")}>
              <Input
                type="number"
                step="0.5"
                value={data.settings.default_annual_leave}
                onChange={(e) =>
                  updateSettings({ default_annual_leave: Number(e.target.value) })
                }
              />
            </Field>
            <p className="text-xs text-slate-400">{t("settings.recalcNote")}</p>
          </div>
        </Card>

        {/* 팀별 경고 기준 */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("settings.teamWarn")}
          </h2>
          <div className="space-y-2">
            {data.teams.map((tm) => (
              <div key={tm.id} className="flex flex-wrap items-center gap-2">
                <div className="w-16">
                  <TeamChip team={tm.team_name} />
                </div>
                <Input
                  value={tm.manager_name}
                  onChange={(e) => updateTeam(tm.id, { manager_name: e.target.value })}
                  placeholder={t("common.manager")}
                  className="w-32"
                />
                <div className="ml-auto flex items-center gap-1">
                  <Input
                    type="number"
                    min={1}
                    value={tm.warning_threshold}
                    onChange={(e) =>
                      updateTeam(tm.id, { warning_threshold: Number(e.target.value) })
                    }
                    className="w-16 text-right"
                  />
                  <span className="text-xs text-slate-400">{t("settings.orMore")}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 휴가 유형 */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("settings.leaveTypeDeduct")}
          </h2>
          <div className="space-y-2">
            {data.leaveTypes.map((lt) => (
              <div
                key={lt.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
              >
                <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: lt.color_code }}
                  />
                  {lt.leave_type_name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    lt.deduct_from_annual_leave
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
                  }`}
                >
                  {lt.deduct_from_annual_leave ? t("settings.deduct") : t("settings.noDeduct")}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">{t("settings.deductNote")}</p>
        </Card>

        {/* 데이터 관리 */}
        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("settings.dataMgmt")}
          </h2>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            {isCloud ? t("settings.cloudNote") : t("settings.localNote")}
          </p>
          {!isCloud && (
            <Button
              variant="danger"
              onClick={() => {
                if (confirm(t("settings.confirmReset"))) resetAll();
              }}
            >
              {t("settings.reset")}
            </Button>
          )}
        </Card>
      </div>

      <HolidaySection
        holidays={data.holidays}
        addHoliday={addHoliday}
        deleteHoliday={deleteHoliday}
      />
    </div>
  );
}

function HolidaySection({
  holidays,
  addHoliday,
  deleteHoliday,
}: {
  holidays: any[];
  addHoliday: (h: any) => void;
  deleteHoliday: (id: string) => void;
}) {
  const { t } = useI18n();
  const [f, setF] = useState({
    date: todayISO(),
    country: "한국",
    holiday_name: "",
    applicable_team: "ALL" as TeamName | "ALL",
    notes: "",
  });

  const th = "px-3 py-2 font-medium";

  return (
    <Card className="mt-4 p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {t("settings.holidayMgmt")}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.holiday_name) return;
          addHoliday(f);
          setF({ ...f, holiday_name: "", notes: "" });
        }}
        className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-6"
      >
        <Input
          type="date"
          value={f.date}
          onChange={(e) => setF({ ...f, date: e.target.value })}
        />
        <Select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>
          <option value="한국">{t("country.한국")}</option>
          <option value="베트남">{t("country.베트남")}</option>
          <option value="싱가포르">{t("country.싱가포르")}</option>
          <option value="기타">{t("country.기타")}</option>
        </Select>
        <Input
          placeholder={t("settings.holidayName")}
          value={f.holiday_name}
          onChange={(e) => setF({ ...f, holiday_name: e.target.value })}
          className="sm:col-span-2"
        />
        <Select
          value={f.applicable_team}
          onChange={(e) =>
            setF({ ...f, applicable_team: e.target.value as TeamName | "ALL" })
          }
        >
          <option value="ALL">{t("common.allTeams")}</option>
          {TEAM_NAMES.map((tm) => (
            <option key={tm} value={tm}>
              {tm}
            </option>
          ))}
        </Select>
        <Button type="submit">
          <Plus size={16} /> {t("common.add")}
        </Button>
      </form>

      {holidays.length === 0 ? (
        <EmptyState text={t("settings.holidayEmpty")} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className={th}>{t("settings.col.date")}</th>
                <th className={th}>{t("settings.col.country")}</th>
                <th className={th}>{t("settings.col.holidayName")}</th>
                <th className={th}>{t("settings.col.applicableTeam")}</th>
                <th className={`${th} text-right`}>{t("common.manage")}</th>
              </tr>
            </thead>
            <tbody>
              {[...holidays]
                .sort((a, b) => (a.date < b.date ? -1 : 1))
                .map((h) => (
                  <tr key={h.id} className="border-b border-slate-50 dark:border-slate-800/60">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{h.date}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                      {t(`country.${h.country}`)}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">
                      {h.holiday_name}
                    </td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                      {h.applicable_team === "ALL" ? t("common.all") : h.applicable_team}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
