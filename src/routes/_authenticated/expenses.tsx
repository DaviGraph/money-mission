import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, Empty, ErrorBox, Loading, PageHeader, Stat } from "@/components/ui-bits";
import { ConfirmDelete, ExpenseDialog } from "@/components/forms";
import { useRemove, useSummary, type Expense } from "@/lib/data";
import { EXPENSE_CATEGORIES, naira, type ExpenseCategory } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses — 60-Day Money Mission" }] }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { expenses, s, isLoading, error } = useSummary();
  const remove = useRemove("expenses", "Expense");
  const [edit, setEdit] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);

  const essential = expenses.filter((e) => e.roi_classification === "essential").reduce((a, e) => a + Number(e.amount), 0);
  const byCat = (Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[]).map((k) => ({
    name: EXPENSE_CATEGORIES[k].split(" /")[0],
    value: expenses.filter((e) => e.category === k).reduce((a, e) => a + Number(e.amount), 0),
  }));
  const months = new Map<string, number>();
  expenses.forEach((e) => months.set(e.expense_date.slice(0, 7), (months.get(e.expense_date.slice(0, 7)) ?? 0) + Number(e.amount)));
  const byMonth = [...months.entries()].sort().map(([m, v]) => ({
    name: new Date(m + "-15").toLocaleDateString("en-NG", { month: "short", year: "2-digit" }),
    value: v,
  }));

  const ratio = s.expenseRatio;
  const warn = (ratio !== null && ratio > 30) || (ratio === null && s.totalExpenses > 0);

  return (
    <div>
      <PageHeader
        title="Expenses"
        sub="Every naira spent on the mission."
        actions={
          <Button onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus /> Add expense
          </Button>
        }
      />
      {error ? <ErrorBox error={error} /> : isLoading ? <Loading /> : (
        <div className="space-y-4">
          {warn && (
            <div className="flex items-start gap-3 rounded-xl border border-negative/30 bg-negative-soft p-4 text-sm text-negative">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {ratio === null
                ? "You've spent money but haven't collected any income yet. Keep spending focused on essential, income-generating items."
                : `Expenses are ${ratio.toFixed(1)}% of collected income — above the 30% healthy threshold. Review non-essential spending.`}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Total expenses" value={naira(s.totalExpenses)} tone="negative" />
            <Stat label="Essential" value={naira(essential)} />
            <Stat label="Non-essential" value={naira(s.totalExpenses - essential)} />
            <Stat
              label="Expense-to-income"
              value={ratio === null ? "—" : `${ratio.toFixed(1)}%`}
              hint={ratio === null ? "No collected income yet" : undefined}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <p className="mb-3 text-sm font-medium">By category</p>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={byCat}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => naira(v, true)} width={60} />
                    <Tooltip formatter={(v: number) => naira(v)} />
                    <Bar dataKey="value" fill="var(--negative)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <p className="mb-3 text-sm font-medium">By month</p>
              {byMonth.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">No expenses yet.</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer>
                    <BarChart data={byMonth}>
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => naira(v, true)} width={60} />
                      <Tooltip formatter={(v: number) => naira(v)} />
                      <Bar dataKey="value" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>
          <Card className="p-0">
            {expenses.length === 0 ? (
              <div className="p-4">
                <Empty title="No expenses recorded" sub="Log tools, data, ads and transport to see your real profit." />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden sm:table-cell">ROI</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.description}</TableCell>
                      <TableCell className="hidden md:table-cell">{EXPENSE_CATEGORIES[e.category as ExpenseCategory]}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{e.roi_classification === "essential" ? "Essential" : "Non-essential"}</Badge>
                      </TableCell>
                      <TableCell>{e.expense_date}</TableCell>
                      <TableCell className="figure text-right text-negative">{naira(Number(e.amount))}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEdit(e); setOpen(true); }}>
                            <Pencil />
                          </Button>
                          <ConfirmDelete what="expense" onConfirm={() => remove.mutate(e.id)}>
                            <Button variant="ghost" size="icon">
                              <Trash2 />
                            </Button>
                          </ConfirmDelete>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
      <ExpenseDialog open={open} onOpenChange={setOpen} record={edit} />
    </div>
  );
}
