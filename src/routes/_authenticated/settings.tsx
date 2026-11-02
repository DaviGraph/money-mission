import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, PageHeader } from "@/components/ui-bits";
import { Field } from "@/components/forms";
import { downloadCSV, useActivities, useDeals, useExpenses, useGoal, useIncome, useProfile, useSave, useUser } from "@/lib/data";
import { DEAL_STAGES, type DealStage } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — 60-Day Money Mission" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { goal } = useGoal();
  const user = useUser();
  const profile = useProfile();
  const saveGoal = useSave("goals", "Challenge settings");
  const saveProfile = useSave("profiles", "Profile");
  const income = useIncome();
  const expenses = useExpenses();
  const deals = useDeals();
  const acts = useActivities();
  const [g, setG] = useState(goal);
  const [name, setName] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => setG(goal), [goal.id, goal.target, goal.start, goal.end]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setName(profile.data?.[0]?.full_name ?? ""), [profile.data]);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  function toggleTheme(v: boolean) {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("theme", v ? "dark" : "light");
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Settings" />
      <Card>
        <p className="mb-4 font-medium">Challenge</p>
        <form
          className="grid gap-4 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveGoal.mutate({
              ...(goal.id ? { id: goal.id } : {}),
              target_amount: g.target,
              start_date: g.start,
              end_date: g.end,
              daily_pitch_target: g.pitchTarget,
              daily_followup_target: g.followupTarget,
              stage_probabilities: g.probabilities,
            });
          }}
        >
          <Field label="Target (₦)"><Input type="number" min={1} value={g.target} onChange={(e) => setG({ ...g, target: Number(e.target.value) })} /></Field>
          <Field label="Start date"><Input type="date" value={g.start} onChange={(e) => setG({ ...g, start: e.target.value })} /></Field>
          <Field label="End date"><Input type="date" min={g.start} value={g.end} onChange={(e) => setG({ ...g, end: e.target.value })} /></Field>
          <Field label="Daily pitch target"><Input type="number" min={0} value={g.pitchTarget} onChange={(e) => setG({ ...g, pitchTarget: Number(e.target.value) })} /></Field>
          <Field label="Daily follow-up target"><Input type="number" min={0} value={g.followupTarget} onChange={(e) => setG({ ...g, followupTarget: Number(e.target.value) })} /></Field>
          <div className="sm:col-span-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pipeline probability by stage (%)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {DEAL_STAGES.map((s) => (
                <Field key={s.key} label={s.label}>
                  <Input
                    type="number" min={0} max={100}
                    value={g.probabilities[s.key]}
                    onChange={(e) => setG({ ...g, probabilities: { ...g.probabilities, [s.key as DealStage]: Math.min(100, Math.max(0, Number(e.target.value))) } })}
                  />
                </Field>
              ))}
            </div>
          </div>
          <div className="sm:col-span-3"><Button type="submit" disabled={saveGoal.isPending || g.end < g.start}>Save challenge settings</Button></div>
        </form>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="mb-4 font-medium">Profile & account</p>
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); saveProfile.mutate({ full_name: name }); }}>
            <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <p className="text-sm text-muted-foreground">Email: {user.data?.email}</p>
            <p className="text-sm text-muted-foreground">Member since: {user.data?.created_at?.slice(0, 10)}</p>
            <Button type="submit" variant="outline">Save profile</Button>
          </form>
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm">Dark theme</span>
            <Switch checked={dark} onCheckedChange={toggleTheme} />
          </div>
        </Card>
        <Card>
          <p className="mb-4 font-medium">Export to CSV</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => downloadCSV("income.csv", income.data ?? [])}>Income</Button>
            <Button variant="outline" onClick={() => downloadCSV("expenses.csv", expenses.data ?? [])}>Expenses</Button>
            <Button variant="outline" onClick={() => downloadCSV("deals.csv", deals.data ?? [])}>Deals</Button>
            <Button variant="outline" onClick={() => downloadCSV("daily-activity.csv", acts.data ?? [])}>Daily activity</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
