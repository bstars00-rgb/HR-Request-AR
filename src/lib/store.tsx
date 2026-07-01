"use client";

// =============================================================
// 데이터 스토어 — 두 가지 백엔드를 자동 전환
//   1) Supabase 환경변수가 있으면  → 공유 DB 모드 (모든 직원이 같은 데이터)
//   2) 없으면                       → 브라우저 localStorage 모드 (개발/단독 테스트)
//
// UI 코드는 동일한 CRUD 메서드만 호출하므로, 모드가 바뀌어도 화면 코드는 그대로다.
// =============================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  AppData,
  Employee,
  Holiday,
  LeaveRequest,
  Settings,
  Team,
} from "./types";
import { buildSeed } from "./seed";
import { computeLeaveDays } from "./leave-calc";
import { supabase, supabaseEnabled } from "./supabaseClient";

const STORAGE_KEY = "hr-leave-platform:v1";

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

// 클라우드 모드는 uuid, 로컬 모드는 접두사 id
function newId(prefix: string): string {
  if (supabaseEnabled && typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return genId(prefix);
}

function nowISO(): string {
  return new Date().toISOString();
}

function withDays(lv: LeaveRequest, data: AppData): LeaveRequest {
  return { ...lv, days_count: computeLeaveDays(lv, data) };
}

// 표시용으로 모든 휴가의 days_count 를 현재 설정/공휴일 기준 재계산
function recalcLeaves(d: AppData): AppData {
  return { ...d, leaves: d.leaves.map((lv) => withDays(lv, d)) };
}

const DEFAULT_SETTINGS: Settings = {
  exclude_weekends: true,
  exclude_holidays: true,
  default_annual_leave: 15,
};

// ---------- localStorage 로더 ----------
function loadLocal(): AppData {
  if (typeof window === "undefined") return buildSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = recalcLeaves(buildSeed());
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as AppData;
  } catch {
    return recalcLeaves(buildSeed());
  }
}

// ---------- Supabase 로더 ----------
async function loadCloud(): Promise<AppData> {
  const sb = supabase!;
  const [emp, lv, hol, tm, lt, st] = await Promise.all([
    sb.from("employees").select("*"),
    sb.from("leave_requests").select("*"),
    sb.from("holidays").select("*"),
    sb.from("teams").select("*"),
    sb.from("leave_types").select("*"),
    sb.from("app_settings").select("*").limit(1),
  ]);

  const settingsRow = st.data?.[0];
  const settings: Settings = settingsRow
    ? {
        exclude_weekends: settingsRow.exclude_weekends,
        exclude_holidays: settingsRow.exclude_holidays,
        default_annual_leave: Number(settingsRow.default_annual_leave),
      }
    : DEFAULT_SETTINGS;

  const data: AppData = {
    employees: (emp.data ?? []) as Employee[],
    leaves: (lv.data ?? []) as LeaveRequest[],
    holidays: (hol.data ?? []) as Holiday[],
    teams: (tm.data ?? []) as Team[],
    leaveTypes: (lt.data ?? []) as AppData["leaveTypes"],
    settings,
  };
  return recalcLeaves(data);
}

interface StoreCtx {
  data: AppData;
  ready: boolean;
  isCloud: boolean;
  addEmployee: (e: Omit<Employee, "id" | "created_at" | "updated_at">) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addLeave: (l: Omit<LeaveRequest, "id" | "created_at" | "updated_at" | "days_count">) => void;
  updateLeave: (id: string, patch: Partial<LeaveRequest>) => void;
  deleteLeave: (id: string) => void;
  addHoliday: (h: Omit<Holiday, "id">) => void;
  updateHoliday: (id: string, patch: Partial<Holiday>) => void;
  deleteHoliday: (id: string) => void;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => buildSeed());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    let debounce: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const loaded = supabaseEnabled ? await loadCloud() : loadLocal();
        if (alive) setData(loaded);
      } catch (e) {
        console.error("데이터 로드 실패, 로컬 모드로 대체", e);
        if (alive) setData(loadLocal());
      } finally {
        if (alive) setReady(true);
      }

      // 실시간 동기화 — 다른 사용자가 바꾸면 새로고침 없이 즉시 반영
      if (supabaseEnabled && supabase && alive) {
        channel = supabase
          .channel("hr-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public" },
            () => {
              // 짧게 디바운스 후 최신 데이터 재로드 (변경 폭주 방지)
              clearTimeout(debounce);
              debounce = setTimeout(() => {
                loadCloud()
                  .then((d) => {
                    if (alive) setData(d);
                  })
                  .catch(() => {});
              }, 250);
            }
          )
          .subscribe();
      }
    })();

    return () => {
      alive = false;
      clearTimeout(debounce);
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  // 로컬 모드: 상태 변경 시 localStorage 동기화
  const commit = useCallback((next: AppData) => {
    setData(next);
    if (!supabaseEnabled && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  // 클라우드 쓰기 실패 시 알림 + DB 재동기화
  const cloudFail = useCallback(async (label: string, error: unknown) => {
    console.error(`${label} 실패`, error);
    if (typeof window !== "undefined") {
      window.alert(`${label} 중 오류가 발생했습니다. 데이터를 다시 불러옵니다.`);
    }
    try {
      setData(await loadCloud());
    } catch {
      /* noop */
    }
  }, []);

  const api = useMemo<StoreCtx>(() => {
    const sb = supabase;

    return {
      data,
      ready,
      isCloud: supabaseEnabled,

      // ---------------- Employees ----------------
      addEmployee: (e) => {
        const emp: Employee = {
          ...e,
          id: newId("emp"),
          created_at: nowISO(),
          updated_at: nowISO(),
        };
        commit({ ...data, employees: [...data.employees, emp] });
        if (supabaseEnabled && sb) {
          sb.from("employees").insert(emp).then(({ error }) => {
            if (error) cloudFail("직원 추가", error);
          });
        }
      },
      updateEmployee: (id, patch) => {
        const next = {
          ...data,
          employees: data.employees.map((emp) =>
            emp.id === id ? { ...emp, ...patch, updated_at: nowISO() } : emp
          ),
        };
        commit(next);
        if (supabaseEnabled && sb) {
          sb.from("employees")
            .update({ ...patch, updated_at: nowISO() })
            .eq("id", id)
            .then(({ error }) => {
              if (error) cloudFail("직원 수정", error);
            });
        }
      },
      deleteEmployee: (id) => {
        commit({
          ...data,
          employees: data.employees.filter((e) => e.id !== id),
          leaves: data.leaves.filter((l) => l.employee_id !== id),
        });
        if (supabaseEnabled && sb) {
          sb.from("employees").delete().eq("id", id).then(({ error }) => {
            if (error) cloudFail("직원 삭제", error);
          });
        }
      },

      // ---------------- Leaves ----------------
      addLeave: (l) => {
        const lv: LeaveRequest = withDays(
          {
            ...l,
            id: newId("lv"),
            days_count: 0,
            created_at: nowISO(),
            updated_at: nowISO(),
          },
          data
        );
        commit({ ...data, leaves: [...data.leaves, lv] });
        if (supabaseEnabled && sb) {
          sb.from("leave_requests").insert(lv).then(({ error }) => {
            if (error) cloudFail("휴가 등록", error);
          });
        }
      },
      updateLeave: (id, patch) => {
        let updated: LeaveRequest | null = null;
        const next = {
          ...data,
          leaves: data.leaves.map((lv) => {
            if (lv.id !== id) return lv;
            updated = withDays({ ...lv, ...patch, updated_at: nowISO() }, data);
            return updated;
          }),
        };
        commit(next);
        if (supabaseEnabled && sb && updated) {
          const u = updated as LeaveRequest;
          sb.from("leave_requests")
            .update({
              employee_id: u.employee_id,
              team: u.team,
              leave_type: u.leave_type,
              start_date: u.start_date,
              end_date: u.end_date,
              days_count: u.days_count,
              half_day_type: u.half_day_type,
              reason: u.reason,
              status: u.status,
              updated_at: u.updated_at,
            })
            .eq("id", id)
            .then(({ error }) => {
              if (error) cloudFail("휴가 수정", error);
            });
        }
      },
      deleteLeave: (id) => {
        commit({ ...data, leaves: data.leaves.filter((l) => l.id !== id) });
        if (supabaseEnabled && sb) {
          sb.from("leave_requests").delete().eq("id", id).then(({ error }) => {
            if (error) cloudFail("휴가 삭제", error);
          });
        }
      },

      // ---------------- Holidays ----------------
      addHoliday: (h) => {
        const hol: Holiday = { ...h, id: newId("hol") };
        commit(recalcLeaves({ ...data, holidays: [...data.holidays, hol] }));
        if (supabaseEnabled && sb) {
          sb.from("holidays").insert(hol).then(({ error }) => {
            if (error) cloudFail("공휴일 추가", error);
          });
        }
      },
      updateHoliday: (id, patch) => {
        commit(
          recalcLeaves({
            ...data,
            holidays: data.holidays.map((h) =>
              h.id === id ? { ...h, ...patch } : h
            ),
          })
        );
        if (supabaseEnabled && sb) {
          sb.from("holidays").update(patch).eq("id", id).then(({ error }) => {
            if (error) cloudFail("공휴일 수정", error);
          });
        }
      },
      deleteHoliday: (id) => {
        commit(
          recalcLeaves({
            ...data,
            holidays: data.holidays.filter((h) => h.id !== id),
          })
        );
        if (supabaseEnabled && sb) {
          sb.from("holidays").delete().eq("id", id).then(({ error }) => {
            if (error) cloudFail("공휴일 삭제", error);
          });
        }
      },

      // ---------------- Teams ----------------
      updateTeam: (id, patch) => {
        commit({
          ...data,
          teams: data.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        });
        if (supabaseEnabled && sb) {
          sb.from("teams").update(patch).eq("id", id).then(({ error }) => {
            if (error) cloudFail("팀 설정 수정", error);
          });
        }
      },

      // ---------------- Settings ----------------
      updateSettings: (patch) => {
        const next = recalcLeaves({
          ...data,
          settings: { ...data.settings, ...patch },
        });
        commit(next);
        if (supabaseEnabled && sb) {
          sb.from("app_settings")
            .upsert({ id: "singleton", ...next.settings })
            .then(({ error }) => {
              if (error) cloudFail("설정 저장", error);
            });
        }
      },

      // ---------------- Reset (로컬 모드 전용) ----------------
      resetAll: () => {
        if (supabaseEnabled) {
          // 공유 DB 는 파괴적 초기화 대신 재동기화만 수행
          loadCloud().then(setData).catch(() => {});
          return;
        }
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        commit(recalcLeaves(buildSeed()));
      },
    };
  }, [data, ready, commit, cloudFail]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within DataProvider");
  return ctx;
}

export function useEmployeeName() {
  const { data } = useStore();
  return useCallback(
    (id: string) => data.employees.find((e) => e.id === id)?.name ?? "—",
    [data.employees]
  );
}
