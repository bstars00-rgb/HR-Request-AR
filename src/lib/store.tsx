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
  useRef,
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
import { computeLeaveDays, summarizeEmployee } from "./leave-calc";
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
  admin_pin: "",
};

const ADMIN_KEY = "hr-leave-platform:admin";

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
  // 항상 고정된 순서로 가져온다 (정렬이 없으면 수정 후 행 순서가 바뀌어 UI가 튄다)
  const [emp, lv, hol, tm, lt, st] = await Promise.all([
    sb.from("employees").select("*").order("created_at", { ascending: true }),
    sb.from("leave_requests").select("*").order("start_date", { ascending: true }),
    sb.from("holidays").select("*").order("date", { ascending: true }),
    sb.from("teams").select("*").order("team_name", { ascending: true }),
    sb.from("leave_types").select("*").order("leave_type_name", { ascending: true }),
    sb.from("app_settings").select("*").limit(1),
  ]);

  const settingsRow = st.data?.[0];
  const settings: Settings = settingsRow
    ? {
        exclude_weekends: settingsRow.exclude_weekends,
        exclude_holidays: settingsRow.exclude_holidays,
        default_annual_leave: Number(settingsRow.default_annual_leave),
        admin_pin: settingsRow.admin_pin ?? "",
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
  addTeam: (t: Omit<Team, "id">) => void;
  updateTeam: (id: string, patch: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  // 편집 잠금
  isAdmin: boolean;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  // 연말 이월 처리
  rolloverYearEnd: (year: number) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => buildSeed());
  const [ready, setReady] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  // 마지막 로컬 편집 시각 — 타이핑 중 실시간 재로드가 입력을 덮어쓰지 않게 함
  const localWriteAt = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(ADMIN_KEY) === "1") {
      setAdminUnlocked(true);
    }
  }, []);

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
              // 내가 방금 편집(타이핑) 중이면 재로드를 미룬다 → 입력 글자가 덮여쓰이지 않음.
              // 편집이 멈춘 뒤에야 최신 데이터로 동기화한다.
              clearTimeout(debounce);
              const since = Date.now() - localWriteAt.current;
              const wait = since < 1500 ? 1800 - since : 300;
              debounce = setTimeout(() => {
                loadCloud()
                  .then((d) => {
                    if (alive) setData(d);
                  })
                  .catch(() => {});
              }, wait);
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
    localWriteAt.current = Date.now();
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
      addTeam: (tm) => {
        const team: Team = { ...tm, id: newId("team") };
        commit({ ...data, teams: [...data.teams, team] });
        if (supabaseEnabled && sb) {
          sb.from("teams").insert(team).then(({ error }) => {
            if (error) cloudFail("팀 추가", error);
          });
        }
      },
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
      deleteTeam: (id) => {
        commit({ ...data, teams: data.teams.filter((t) => t.id !== id) });
        if (supabaseEnabled && sb) {
          sb.from("teams").delete().eq("id", id).then(({ error }) => {
            if (error) cloudFail("팀 삭제", error);
          });
        }
      },

      // ---------------- Settings ----------------
      updateSettings: (patch) => {
        // PIN 을 설정하는 사람은 계속 편집 가능하도록 자동 잠금 해제 유지
        if (patch.admin_pin !== undefined && patch.admin_pin) {
          setAdminUnlocked(true);
          if (typeof window !== "undefined") sessionStorage.setItem(ADMIN_KEY, "1");
        }
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

      // ---------------- 편집 잠금 ----------------
      isAdmin: !data.settings.admin_pin || adminUnlocked,
      unlockAdmin: (pin) => {
        if (pin === data.settings.admin_pin) {
          setAdminUnlocked(true);
          if (typeof window !== "undefined") sessionStorage.setItem(ADMIN_KEY, "1");
          return true;
        }
        return false;
      },
      lockAdmin: () => {
        setAdminUnlocked(false);
        if (typeof window !== "undefined") sessionStorage.removeItem(ADMIN_KEY);
      },

      // ---------------- 연말 이월 처리 ----------------
      // 지정 연도의 잔여를 다음 해 이월로 옮기고, 그 해 휴가 기록/도입전사용을 초기화
      rolloverYearEnd: (year) => {
        const yearPrefix = `${year}-`;
        const remainByEmp: Record<string, number> = {};
        data.employees.forEach((e) => {
          remainByEmp[e.id] = summarizeEmployee(e, data).remaining;
        });
        const nextEmployees = data.employees.map((e) => ({
          ...e,
          carried_over_leave: Math.max(0, remainByEmp[e.id] ?? 0),
          used_adjustment: 0,
          updated_at: nowISO(),
        }));
        const removedLeaveIds = data.leaves
          .filter((l) => l.start_date.startsWith(yearPrefix))
          .map((l) => l.id);
        const nextLeaves = data.leaves.filter(
          (l) => !l.start_date.startsWith(yearPrefix)
        );
        commit({ ...data, employees: nextEmployees, leaves: nextLeaves });
        if (supabaseEnabled && sb) {
          nextEmployees.forEach((e) => {
            sb.from("employees")
              .update({
                carried_over_leave: e.carried_over_leave,
                used_adjustment: e.used_adjustment,
                updated_at: e.updated_at,
              })
              .eq("id", e.id)
              .then(({ error }) => {
                if (error) cloudFail("이월 처리", error);
              });
          });
          if (removedLeaveIds.length) {
            sb.from("leave_requests")
              .delete()
              .in("id", removedLeaveIds)
              .then(({ error }) => {
                if (error) cloudFail("이월 처리(휴가 정리)", error);
              });
          }
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
  }, [data, ready, adminUnlocked, commit, cloudFail]);

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
