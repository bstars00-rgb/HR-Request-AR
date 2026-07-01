import "./globals.css";
import type { Metadata } from "next";
import { DataProvider } from "@/lib/store";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "연차관리 플랫폼 · Leave Platform",
  description: "OP / CT / Sales 팀 휴가·연차 관리 (사내 공유용)",
};

// 다크모드 깜빡임(FOUC) 방지 — 페인트 전에 테마 클래스 적용
const themeScript = `(function(){try{var t=localStorage.getItem('hr-leave-platform:theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <I18nProvider>
            <DataProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 min-w-0 lg:ml-60">
                  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                  </div>
                </main>
              </div>
            </DataProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
