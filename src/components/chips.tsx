"use client";

import {
  LeaveStatus,
  TeamName,
  teamColor,
  categoryColor,
  CATEGORY_KEYS,
} from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const STATUS_STYLES: Record<LeaveStatus, string> = {
  Approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30", // 노란색
  Rejected:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  Cancelled:
    "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700/40 dark:text-slate-400 dark:border-slate-700",
};

export function StatusChip({ status }: { status: LeaveStatus }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

export function TeamChip({ team }: { team: TeamName }) {
  const color = teamColor(team);
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {team}
    </span>
  );
}

// 일정 카테고리 칩 (구 LeaveTypeChip — 컴포넌트명 유지)
export function LeaveTypeChip({ type }: { type: string }) {
  const { t } = useI18n();
  const color = categoryColor(type);
  const label = (CATEGORY_KEYS as string[]).includes(type)
    ? t(`category.${type}`)
    : type;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

// 카테고리 색상 맵(하위호환 export) — 캘린더 등에서 사용
export const LEAVE_TYPE_COLORS = new Proxy(
  {},
  { get: (_t, key: string) => categoryColor(key) }
) as Record<string, string>;
