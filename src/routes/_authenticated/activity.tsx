import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, ErrorBox, Field, Loading, PageHeader, Stat } from "@/components/ui-bits-proxy";
import { useActivities, useGoal, useIncome, useSave } from "@/lib/data";
import { ACTIVITY_FIELDS, qualifyingDates, streakStats, todayLagos, type ActivityKey } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Daily Activity — 60-Day Money Mission" }] }),
  component: ActivityPage,
});

type Form = Record<ActivityKey, number> & { accomplished: string; went_wrong: string; learned: string; improve: string };
const empty = (): Form => ({
  ...(Object.fromEntries(ACTIVITY_FIELDS.map((f) => [f.key, 0])) as Record<ActivityKey, number>),
  accomplished: "",
  went_wrong: "",
  learned: "",
  improve: "",
});

function ActivityPage() {
  const acts = useActivities();
  const income = useIncome();
  const { goal } = useGoal();
  const save = useSave("daily_activities", "Daily log");
  const [date, setDate] = useState(todayLagos());
  const [f, setF] = useState<Form>(empty());

  useEffect(() => {
    const r = acts.data?.find((a) => a.activity_date === date);
    if (!r) return setF(empty());
    setF({
      ...(Object.fromEntries(ACTIVITY_FIELDS.map((x) => [x.key, r[x.key]])) as Record<ActivityKey, number>),
      accomplished: r.accomplished ?? "",
      went_wrong: r.went_wrong ?? "",
      learned: r.learned ?? "",
      improve: r.improve ?? "",
    });
  }, [date, acts.data]);

  const stats = useMemo(
    () => streakStats(qualifyingDates(income.data ?? [], acts.data ?? []), goal.start, goal.end, todayLagos()),
    [income.data, acts.data, goal.start, goal.end],
  );
  const journal = (acts.data ?? []).filter((a) => a.accomplished || a.went_wrong || a.learned || a.improve);

  if (acts.error) return <ErrorBox error={acts.error} />;
  if (acts.isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title="Daily Activity" sub="Qualifying day = income received, or at least one pitch, follow-up, call, proposal or close." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Current streak" value={<span className="flex items-center gap-1.5"><Flame className="h-5 w-5 text-warning" />{stats.current} days</span>} />
        <Stat label="Longest streak" value={`${stats.longest} days`} />
        <Stat label="Active days" value={stats.activeDays} tone="positive" />
        <Stat label="Missed days" value={stats.missedDays} tone={stats.missedDays ? "negative" : undefined} />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate({ activity_date: date, ...f });
            }}
            className="space-y-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Field label="Date">
                <Input type="date" value={date} max={todayLagos()} onChange={(e) => setDate(e.target.value)} className="w-44" />
              </Field>
              <p className="text-xs text-muted-foreground">
                Targets: {goal.pitchTarget} pitches · {goal.followupTarget} follow-ups / day
              </p>
            </div>
            <ul className="divide-y rounded-lg border">
              {ACTIVITY_FIELDS.map((a) => (
                <li key={a.key} className="flex items-center gap-3 px-3 py-2.5">
                  <Checkbox
                    id={a.key}
                    checked={f[a.key] > 0}
                    onCheckedChange={(c) => setF({ ...f, [a.key]: c ? Math.max(1, f[a.key]) : 0 })}
                  />
                  <label htmlFor={a.key} className="flex-1 text-sm">
                    {a.label}
                    {a.qualifying && <span className="ml-2 text-[10px] uppercase tracking-wide text-positive">counts for streak</span>}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    aria-label={`${a.label} count`}
                    className="figure h-8 w-20 text-right"
                    value={f[a.key]}
                    onChange={(e) => setF({ ...f, [a.key]: Math.max(0, Number(e.target.value) || 0) })}
                  />
                </li>
              ))}
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="What did I accomplish today?"><Textarea rows={2} value={f.accomplished} onChange={(e) => setF({ ...f, accomplished: e.target.value })} /></Field>
              <Field label="What went wrong?"><Textarea rows={2} value={f.went_wrong} onChange={(e) => setF({ ...f, went_wrong: e.target.value })} /></Field>
              <Field label="What did I learn?"><Textarea rows={2} value={f.learned} onChange={(e) => setF({ ...f, learned: e.target.value })} /></Field>
              <Field label="What will I improve tomorrow?"><Textarea rows={2} value={f.improve} onChange={(e) => setF({ ...f, improve: e.target.value })} /></Field>
            </div>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save day"}</Button>
          </form>
        </Card>
        <Card className="lg:col-span-2">
          <p className="mb-3 text-sm font-medium">Reflections</p>
          {journal.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your daily reflections will appear here.</p>
          ) : (
            <ul className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
              {journal.map((j) => (
                <li key={j.id} className="border-l-2 border-primary/40 pl-3 text-sm">
                  <button className="figure text-xs font-semibold text-primary" onClick={() => setDate(j.activity_date)}>{j.activity_date}</button>
                  {[["Accomplished", j.accomplished], ["Went wrong", j.went_wrong], ["Learned", j.learned], ["Improve", j.improve]].map(
                    ([k, v]) => v && (
                      <p key={k} className="mt-1"><span className="text-muted-foreground">{k}: </span>{v}</p>
                    ),
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
