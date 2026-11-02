import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { DEFAULT_PROBABILITIES, summarize, todayLagos, type DealStage } from "./finance";

export type Income = Tables<"income_records">;
export type Expense = Tables<"expenses">;
export type Deal = Tables<"deals">;
export type Activity = Tables<"daily_activities">;
export type Goal = Tables<"goals">;
export type Profile = Tables<"profiles">;

type TableName = "income_records" | "expenses" | "deals" | "daily_activities" | "goals" | "profiles";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    staleTime: Infinity,
  });
}

function useTable<T>(table: TableName, order: string) {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false });
      if (error) throw error;
      return data as T[];
    },
  });
}

export const useIncome = () => useTable<Income>("income_records", "payment_date");
export const useExpenses = () => useTable<Expense>("expenses", "expense_date");
export const useDeals = () => useTable<Deal>("deals", "created_at");
export const useActivities = () => useTable<Activity>("daily_activities", "activity_date");
export const useProfile = () => useTable<Profile>("profiles", "created_at");

export function useGoal() {
  const q = useTable<Goal>("goals", "created_at");
  const g = q.data?.[0];
  return {
    ...q,
    goal: {
      id: g?.id,
      target: Number(g?.target_amount ?? 500000),
      start: g?.start_date ?? "2026-11-02",
      end: g?.end_date ?? "2026-12-31",
      pitchTarget: g?.daily_pitch_target ?? 10,
      followupTarget: g?.daily_followup_target ?? 5,
      probabilities: {
        ...DEFAULT_PROBABILITIES,
        ...((g?.stage_probabilities as Record<DealStage, number> | null) ?? {}),
      },
    },
  };
}

export function useSave(table: TableName, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (row: Record<string, unknown> & { id?: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("You're signed out. Please sign in again.");
      const payload = { ...row, user_id: table === "profiles" ? undefined : u.user.id };
      if (table === "profiles") (payload as Record<string, unknown>).id = u.user.id;
      const q =
        table === "daily_activities"
          ? supabase.from(table).upsert(payload as never, { onConflict: "user_id,activity_date" })
          : row.id || table === "profiles"
            ? supabase.from(table).upsert(payload as never)
            : supabase.from(table).insert(payload as never);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success(`${label} saved`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemove(table: TableName, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success(`${label} deleted`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSummary() {
  const income = useIncome();
  const expenses = useExpenses();
  const deals = useDeals();
  const goal = useGoal();
  const isLoading = income.isLoading || expenses.isLoading || deals.isLoading || goal.isLoading;
  const error = income.error || expenses.error || deals.error || goal.error;
  const today = todayLagos();
  const s = summarize({
    target: goal.goal.target,
    start: goal.goal.start,
    end: goal.goal.end,
    today,
    income: income.data ?? [],
    expenses: expenses.data ?? [],
    deals: deals.data ?? [],
    probabilities: goal.goal.probabilities,
  });
  return {
    isLoading,
    error,
    today,
    s,
    goal: goal.goal,
    income: income.data ?? [],
    expenses: expenses.data ?? [],
    deals: deals.data ?? [],
  };
}

export function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    toast.info("Nothing to export yet");
    return;
  }
  const cols = Object.keys(rows[0]).filter((c) => c !== "user_id");
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
