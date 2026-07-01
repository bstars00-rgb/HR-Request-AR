// =============================================================
// Supabase 어댑터 (2차 전환용 스텁)
//
// 1차 버전은 src/lib/store.tsx 의 localStorage 구현을 사용합니다.
// Supabase로 전환하려면:
//   1) npm install @supabase/supabase-js
//   2) supabase/schema.sql 을 Supabase SQL Editor 에서 실행
//   3) .env.local 에 URL / ANON KEY 설정 (.env.local.example 참고)
//   4) 아래 주석을 해제하고, store.tsx 의 CRUD 구현을 이 client 호출로 교체
//
// store.tsx 의 메서드 시그니처(addEmployee/addLeave/...)를 그대로 유지하면
// UI 코드는 한 줄도 바꾸지 않아도 됩니다.
// =============================================================

// import { createClient } from "@supabase/supabase-js";
//
// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );
//
// 예시 — 전체 데이터 로드:
// export async function fetchAll() {
//   const [employees, leaves, holidays, teams, leaveTypes] = await Promise.all([
//     supabase.from("employees").select("*"),
//     supabase.from("leave_requests").select("*"),
//     supabase.from("holidays").select("*"),
//     supabase.from("teams").select("*"),
//     supabase.from("leave_types").select("*"),
//   ]);
//   return { employees: employees.data, leaves: leaves.data, ... };
// }
//
// 예시 — 휴가 추가:
// export async function insertLeave(payload) {
//   const { data, error } = await supabase
//     .from("leave_requests")
//     .insert(payload)
//     .select()
//     .single();
//   if (error) throw error;
//   return data;
// }

export {};
