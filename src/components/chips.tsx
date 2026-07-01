"use client";

import {
  LeaveStatus,
  LeaveTypeKey,
  TeamName,
  TEAM_COLORS,
} from "@/lib/types";
import { useI18n } from "@/lib/i18n";

// 휴가 유형 색상 (요청 D 색상 규칙)
export const LEAVE_TYPE_COLORS: Record<LeaveTypeKey, string> = {
  "Annual Leave": "#2563eb", // 파란색
  "Half-day Leave": "#0ea5e9",
  "Sick Leave": "#dc2626", // 빨간색
  "Business Trip": "#7c3aed", // 보라색
  "Public Holiday": "#64748b", // 회색
  "Unpaid Leave": "#ea580c", // 주황색
  Other: "#9333ea",
};

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
  const color = TEAM_COLORS[team];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {team}
    </span>
  );
}

export function LeaveTypeChip({ type }: { type: LeaveTypeKey }) {
  const color = LEAVE_TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {type}
    </span>
  );
}
