import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, HandCoins, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, Empty, ErrorBox, Loading, PageHeader, Stat } from "@/components/ui-bits";
import { ConfirmDelete, IncomeDialog, NativeSelect, RecordPaymentDialog } from "@/components/forms";
import { useIncome, useRemove, type Income } from "@/lib/data";
import { INCOME_CATEGORIES, PAYMENT_STATUS, naira, type IncomeCategory, type PaymentStatus } from "@/lib/finance";

export const Route = createFileRoute("/_authenticated/income")({
  head: () => ({ meta: [{ title: "Income — 60-Day Money Mission" }] }),
  component: IncomePage,
});

const statusTone: Record<string, string> = {
  paid: "bg-positive-soft text-positive",
  partial: "bg-pipeline-soft text-pipeline",
  pending: "bg-muted text-muted-foreground",
};

function IncomePage() {
  const { data = [], isLoading, error } = useIncome();
  const remove = useRemove("income_records", "Income record");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [asc, setAsc] = useState(false);
  const [edit, setEdit] = useState<Income | null>(null);
  const [open, setOpen] = useState(false);
  const [pay, setPay] = useState<Income | null>(null);

  const rows = useMemo(() => {
    const t = q.toLowerCase();
    return data
      .filter((r) => (cat === "all" || r.category === cat) && (status === "all" || r.payment_status === status))
      .filter((r) => !t || `${r.client_name} ${r.project_name} ${r.notes ?? ""}`.toLowerCase().includes(t))
      .sort((a, b) => {
        const v = sort === "date" ? a.payment_date.localeCompare(b.payment_date) : Number(a.amount_received) - Number(b.amount_received);
        return asc ? v : -v;
      });
  }, [data, q, cat, status, sort, asc]);

  const collected = data.reduce((a, r) => a + Number(r.amount_received), 0);
  const outstanding = data.reduce((a, r) => a + Number(r.deal_value) - Number(r.amount_received), 0);

  return (
    <div>
      <PageHeader
        title="Income"
        sub="Only amounts actually received count toward your target."
        actions={
          <Button onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus /> Add income
          </Button>
        }
      />
      {error ? <ErrorBox error={error} /> : isLoading ? <Loading /> : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="Collected" value={naira(collected)} tone="positive" />
            <Stat label="Outstanding balances" value={naira(outstanding)} tone="pipeline" />
            <Stat label="Records" value={data.length} />
          </div>
          <Card className="p-0">
            <div className="flex flex-wrap gap-2 border-b p-3">
              <Input placeholder="Search client, project…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-64" />
              <NativeSelect className="w-auto" value={cat} onChange={(e) => setCat(e.target.value)} options={{ all: "All categories", ...INCOME_CATEGORIES }} />
              <NativeSelect className="w-auto" value={status} onChange={(e) => setStatus(e.target.value)} options={{ all: "All statuses", ...PAYMENT_STATUS }} />
              <NativeSelect className="w-auto" value={sort} onChange={(e) => setSort(e.target.value as "date" | "amount")} options={{ date: "Sort: date", amount: "Sort: amount" }} />
              <Button variant="outline" size="icon" onClick={() => setAsc(!asc)} aria-label="Toggle sort direction">
                <ArrowUpDown />
              </Button>
            </div>
            {rows.length === 0 ? (
              <div className="p-4">
                <Empty title={data.length ? "No matching records" : "No income recorded yet"} sub="Add a payment — partial payments are supported." />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden md:table-cell">Project</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead className="text-right">Deal value</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const out = Number(r.deal_value) - Number(r.amount_received);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.client_name}</TableCell>
                        <TableCell className="hidden md:table-cell">{r.project_name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{INCOME_CATEGORIES[r.category as IncomeCategory]}</TableCell>
                        <TableCell className="figure text-right">{naira(Number(r.deal_value))}</TableCell>
                        <TableCell className="figure text-right text-positive">{naira(Number(r.amount_received))}</TableCell>
                        <TableCell className="figure hidden text-right sm:table-cell">{naira(out)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusTone[r.payment_status]}>
                            {PAYMENT_STATUS[r.payment_status as PaymentStatus]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{r.payment_date}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            {out > 0 && (
                              <Button variant="ghost" size="icon" title="Record payment" onClick={() => setPay(r)}>
                                <HandCoins />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEdit(r); setOpen(true); }}>
                              <Pencil />
                            </Button>
                            <ConfirmDelete what="income record" onConfirm={() => remove.mutate(r.id)}>
                              <Button variant="ghost" size="icon" title="Delete">
                                <Trash2 />
                              </Button>
                            </ConfirmDelete>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}
      <IncomeDialog open={open} onOpenChange={setOpen} record={edit} />
      <RecordPaymentDialog open={!!pay} onOpenChange={(o) => !o && setPay(null)} record={pay} />
    </div>
  );
}
