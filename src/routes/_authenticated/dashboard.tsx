import { createFileRoute, Link } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, Empty, ErrorBox, Loading, Stat, chartColors } from "@/components/ui-bits";
import { useQuickAdd } from "@/components/quick-actions";
import { useSummary } from "@/lib/data";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_STATUS, naira, type ExpenseCategory, type IncomeCategory, type PaymentStatus } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Overview — 60-Day Money Mission" }] }),
  component: Dashboard,
});

const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

function Dashboard() {
  const { isLoading, error, s, goal, income, expenses } = useSummary();
  const quick = useQuickAdd();
  if (error) return <ErrorBox error={error} />;
  if (isLoading) return <Loading />;
  const { clock } = s;
  const pct = Math.min(100, s.progressPct);

  const bySource = (Object.keys(INCOME_CATEGORIES) as IncomeCategory[])
    .map((k) => ({
      name: INCOME_CATEGORIES[k],
      value: income.filter((i) => i.category === k).reduce((a, i) => a + Number(i.amount_received), 0),
    }))
    .filter((x) => x.value > 0);

  const recent = [
    ...income.map((i) => ({
      id: i.id,
      kind: "income" as const,
      desc: `${i.client_name}${i.project_name ? " · " + i.project_name : ""}`,
      cat: INCOME_CATEGORIES[i.category as IncomeCategory],
      date: i.payment_date,
      amount: Number(i.amount_received),
      status: PAYMENT_STATUS[i.payment_status as PaymentStatus],
      ts: i.created_at,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      kind: "expense" as const,
      desc: e.description,
      cat: EXPENSE_CATEGORIES[e.category as ExpenseCategory],
      date: e.expense_date,
      amount: Number(e.amount),
      status: e.roi_classification === "essential" ? "Essential" : "Non-essential",
      ts: e.created_at,
    })),
  ]
    .sort((a, b) => (b.date + b.ts).localeCompare(a.date + a.ts))
    .slice(0, 6);

  const phaseLabel =
    clock.phase === "before" ? "Starts " + fmtDate(goal.start) : clock.phase === "ended" ? "Challenge ended" : `Day ${clock.currentDay} of ${clock.totalDays}`;
  const ahead = s.aheadBy >= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <Badge variant="secondary" className="figure">{phaseLabel}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Progress */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Collected toward target</p>
              <p className="figure mt-1 text-4xl font-semibold text-positive md:text-5xl">{naira(s.collected)}</p>
            </div>
            <div className="text-right">
              <p className="figure text-3xl font-semibold">{s.progressPct.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">of {naira(goal.target)}</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-positive transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Target</p>
              <p className="figure font-medium">{naira(goal.target)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="figure font-medium">{naira(s.remaining)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pace vs plan</p>
              <p className={cn("figure flex items-center gap-1 font-medium", ahead ? "text-positive" : "text-negative")}>
                {ahead ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {naira(Math.abs(s.aheadBy))} {ahead ? "ahead" : "behind"}
              </p>
            </div>
          </div>
        </Card>

        {/* Run rate */}
        <Card>
          <p className="text-xs font-medium text-muted-foreground">Required daily income</p>
          <p className="figure mt-1 text-3xl font-semibold">{s.runRate === null ? "—" : naira(s.runRate)}</p>
          {s.runRate === null ? (
            <p className="mt-2 text-sm text-muted-foreground">The challenge window has closed.</p>
          ) : (
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today's income</span>
                <span className="figure">{naira(s.todayIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Difference</span>
                <span className={cn("figure", (s.todayDiff ?? 0) >= 0 ? "text-positive" : "text-negative")}>
                  {(s.todayDiff ?? 0) >= 0 ? "+" : "−"}
                  {naira(Math.abs(s.todayDiff ?? 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days left</span>
                <span className="figure">{clock.daysRemaining} · ends {fmtDate(goal.end)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Paid income" value={naira(s.collected)} tone="positive" />
        <Stat label="Pending payments" value={naira(s.pending)} tone="pipeline" />
        <Stat label="Open pipeline" value={naira(s.pipelineValue)} tone="pipeline" hint={`${s.activeDeals} active deals`} />
        <Stat label="Total expenses" value={naira(s.totalExpenses)} tone="negative" />
        <Stat label="Net profit" value={naira(s.netProfit)} tone={s.netProfit >= 0 ? "positive" : "negative"} hint="Income − expenses" />
        <Stat
          label="Expense ratio"
          value={s.expenseRatio === null ? "—" : `${s.expenseRatio.toFixed(1)}%`}
          tone={s.expenseRatio !== null && s.expenseRatio > 30 ? "negative" : undefined}
          hint={s.expenseRatio === null ? "No income yet" : "of collected income"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Revenue by source</p>
            <span className="text-xs text-muted-foreground">Days elapsed: {clock.daysElapsed}</span>
          </div>
          {bySource.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No collected income yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={bySource} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2} stroke="none">
                      {bySource.map((_, i) => (
                        <Cell key={i} fill={chartColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => naira(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-2 text-sm">
                {bySource.map((b, i) => (
                  <li key={b.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[i] }} />
                    <span className="text-muted-foreground">{b.name}</span>
                    <span className="figure ml-auto pl-2">{naira(b.value, true)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Recent transactions</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => quick("income")}>
                <Plus /> Income
              </Button>
              <Button size="sm" variant="outline" onClick={() => quick("expense")}>
                <Plus /> Expense
              </Button>
            </div>
          </div>
          {recent.length === 0 ? (
            <Empty title="No transactions yet" sub="Your figures show ₦0 until you record your first payment or expense." />
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.kind + r.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", r.kind === "income" ? "bg-positive" : "bg-negative")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.desc}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.cat} · {fmtDate(r.date)} · {r.status}
                    </p>
                  </div>
                  <span className={cn("figure font-medium", r.kind === "income" ? "text-positive" : "text-negative")}>
                    {r.kind === "income" ? "+" : "−"}
                    {naira(r.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {recent.length > 0 && (
            <div className="mt-2 flex gap-4 text-xs">
              <Link to="/income" className="text-muted-foreground hover:text-foreground">All income →</Link>
              <Link to="/expenses" className="text-muted-foreground hover:text-foreground">All expenses →</Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
