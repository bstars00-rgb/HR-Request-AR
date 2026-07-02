"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  PlaneTakeoff,
  UsersRound,
  Settings as SettingsIcon,
  Menu,
  X,
  Moon,
  Sun,
  Languages,
  Lock,
  Unlock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/calendar", key: "nav.calendar", icon: CalendarDays },
  { href: "/employees", key: "nav.employees", icon: Users },
  { href: "/leaves", key: "nav.leaves", icon: PlaneTakeoff },
  { href: "/teams", key: "nav.teams", icon: UsersRound },
  { href: "/settings", key: "nav.settings", icon: SettingsIcon },
];

function Controls() {
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();
  const { data, isAdmin, unlockAdmin, lockAdmin } = useStore();
  const pinSet = !!data.settings.admin_pin;

  function handleUnlock() {
    const pin = window.prompt(t("admin.enterPin"));
    if (pin === null) return;
    if (!unlockAdmin(pin)) window.alert(t("admin.wrongPin"));
  }

  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggle}
          title={theme === "dark" ? t("ui.lightMode") : t("ui.darkMode")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          {theme === "dark" ? t("ui.lightMode") : t("ui.darkMode")}
        </button>
        <button
          onClick={() => setLang(lang === "ko" ? "en" : "ko")}
          title={t("ui.language")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Languages size={15} />
          {lang === "ko" ? "EN" : "한"}
        </button>
      </div>
      {pinSet && (
        <button
          onClick={isAdmin ? lockAdmin : handleUnlock}
          className={`mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs ${
            isAdmin
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
              : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {isAdmin ? <Unlock size={15} /> : <Lock size={15} />}
          {isAdmin ? t("admin.lock") : t("admin.unlock")}
        </button>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Icon size={18} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* 모바일 상단바 */}
      <div className="no-print fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {t("brand.title")}
        </span>
        <button
          aria-label={t("menu")}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 데스크탑 고정 사이드바 */}
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-60 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            HR
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {t("brand.title")}
            </div>
            <div className="text-[11px] text-slate-400">{t("brand.subtitle")}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{links}</div>
        <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
          <Controls />
          <div className="px-4 pb-4 text-[11px] text-slate-400">
            {t("brand.version")}
          </div>
        </div>
      </aside>

      {/* 모바일 드로어 */}
      {open && (
        <div className="fixed inset-0 z-20 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-14 flex h-[calc(100vh-3.5rem)] w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex-1 overflow-y-auto">{links}</div>
            <div className="border-t border-slate-100 py-2 dark:border-slate-800">
              <Controls />
            </div>
          </aside>
        </div>
      )}

      {/* 모바일 상단바 높이만큼 여백 */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
