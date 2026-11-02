import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, ErrorBox, Loading, PageHeader, Stat } from "@/components/ui-bits";
import { useSummary } from "@/lib/data";
import { INCOME_CATEGORIES, addDays, naira, type IncomeCategory } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — 60-Day Money Mission" }] }),
  component: Analytics,
});

function Chart({ title, data, color, area }: { title: string; data: { name: string; value: number }[]; color: string; area?: boolean }) {
  return (
    <Card>
      <p className="mb-3 text-sm font-medium">{title}</p>
      <div className="h-56">
        <ResponsiveContainer>
          {area ? (
            <AreaChart data={data}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => naira(v, true)} width={60} />
              <Tooltip formatter={(v: number) => naira(v)} />
              <Area dataKey="value" stroke={color} fill={color} fillOpacity={0.15} />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => naira(v, true)} width={60} />
              <Tooltip formatter={(v: number) => naira(v)} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Analytics() {
  const { isLoading, error, s, goal, income, expenses, deals, today } = useSummary();
  if (error) return <ErrorBox error={error} />;
  if (isLoading) return <Loading />;
  const last = today < goal.end ? today : goal.end;
  const days: string[] = [];
  for (let d = goal.start; d <= last; d = addDays(d, 1)) days.push(d);
  const inc = (d: string) => income.filter((i) => i.payment_date === d).reduce((a, i) => a + Number(i.amount_received), 0);
  const exp = (d: string) => expenses.filter((e) => e.expense_date === d).reduce((a, e) => a + Number(e.amount), 0);
  const daily = days.map((d) => ({ name: d.slice(5), value: inc(d) }));
  let run = 0;
  const cumulative = days.map((d) => ({ name: d.slice(5), value: (run += inc(d)) }));
  const weeks = (fn: (d: string) => number) =>
    Array.from({ length: Math.ceil(days.length / 7) }, (_, w) => ({
      name: `W${w + 1}`,
      value: days.slice(w * 7, w * 7 + 7).reduce((a, d) => a + fn(d), 0),
    }));
  const byCat = (Object.keys(INCOME_CATEGORIES) as IncomeCategory[]).map((k) => ({
    name: INCOME_CATEGORIES[k].split(" /")[0],
    value: income.filter((i) => i.category === k).reduce((a, i) => a + Number(i.amount_received), 0),
  }));
  const clients = new Map<string, number>();
  income.forEach((i) => clients.set(i.client_name, (clients.get(i.client_name) ?? 0) + Number(i.amount_received)));
  const byClient = [...clients].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  const essential = expenses.filter((e) => e.roi_classification === "essential").reduce((a, e) => a + Number(e.amount), 0);
  const won = deals.filter((d) => d.stage === "won");
  const lost = deals.filter((d) => d.stage === "lost").length;
  const n = Math.max(1, days.length);
  const paceProjection = (s.collected / n) * s.clock.totalDays;

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics" sub="All charts use your saved records." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Avg daily revenue" value={naira(s.collected / n)} />
        <Stat label="Avg deal value" value={won.length ? naira(won.reduce((a, d) => a + Number(d.estimated_value), 0) / won.length) : "—"} />
        <Stat label="Deals closed" value={won.length} tone="positive" />
        <Stat label="Conversion" value={won.length + lost ? `${((won.length / (won.length + lost)) * 100).toFixed(0)}%` : "—"} />
        <Stat label="Avg daily expense" value={naira(s.totalExpenses / n)} tone="negative" />
        <Stat label="Net profit" value={naira(s.netProfit)} tone={s.netProfit >= 0 ? "positive" : "negative"} />
        <Stat label="Progress" value={`${s.progressPct.toFixed(1)}%`} />
        <Stat label="Essential vs non-essential" value={`${naira(essential, true)} / ${naira(s.totalExpenses - essential, true)}`} />
      </div>
      <Card>
        <p className="text-sm font-medium">Financial projection <span className="text-xs font-normal text-muted-foreground">— estimates, not guaranteed earnings</span></p>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Actual collected</p><p className="figure text-xl font-semibold text-positive">{naira(s.collected)}</p></div>
          <div><p className="text-xs text-muted-foreground">Weighted pipeline (est.)</p><p className="figure text-xl font-semibold text-pipeline">{naira(s.weightedPipeline)}</p></div>
          <div><p className="text-xs text-muted-foreground">Remaining gap after pipeline</p><p className="figure text-xl font-semibold">{naira(s.gapAfterPipeline)}</p></div>
          <div><p className="text-xs text-muted-foreground">At current pace you'd reach</p><p className="figure text-xl font-semibold">{naira(paceProjection)}</p></div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Daily income" data={daily} color="var(--positive)" />
        <Chart title="Cumulative income" data={cumulative} color="var(--positive)" area />
        <Chart title="Weekly income" data={weeks(inc)} color="var(--chart-1)" />
        <Chart title="Weekly expenses" data={weeks(exp)} color="var(--negative)" />
        <Chart title="Revenue by category" data={byCat} color="var(--chart-2)" />
        <Chart title="Revenue by client" data={byClient} color="var(--chart-3)" />
      </div>
    </div>
  );
}
