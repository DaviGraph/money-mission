import { useEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DEAL_STAGES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_STATUS,
  derivePaymentStatus,
  naira,
  todayLagos,
} from "@/lib/finance";
import { useSave, type Deal, type Expense, type Income } from "@/lib/data";

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function NativeSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: Record<string, string> }) {
  const { options, className, ...rest } = props;
  return (
    <select
      {...rest}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {Object.entries(options).map(([k, v]) => (
        <option key={k} value={k}>
          {v}
        </option>
      ))}
    </select>
  );
}

export function ConfirmDelete({ onConfirm, what, children }: { onConfirm: () => void; what: string; children: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {what}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone. Your totals will update immediately.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

type DialogProps<T> = { open: boolean; onOpenChange: (o: boolean) => void; record?: T | null };

const num = (v: string) => (v === "" ? 0 : Number(v));

export function IncomeDialog({ open, onOpenChange, record }: DialogProps<Income>) {
  const save = useSave("income_records", "Income");
  const blank = {
    client_name: "",
    project_name: "",
    category: "website",
    deal_value: "",
    amount_received: "",
    payment_date: todayLagos(),
    notes: "",
  };
  const [f, setF] = useState(blank);
  useEffect(() => {
    if (open)
      setF(
        record
          ? {
              client_name: record.client_name,
              project_name: record.project_name,
              category: record.category,
              deal_value: String(record.deal_value),
              amount_received: String(record.amount_received),
              payment_date: record.payment_date,
              notes: record.notes ?? "",
            }
          : blank,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record]);
  const dv = num(f.deal_value);
  const ar = num(f.amount_received);
  const invalid = ar > dv;
  const status = derivePaymentStatus(dv, ar);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (invalid) return;
    await save.mutateAsync({
      ...(record ? { id: record.id } : {}),
      ...f,
      deal_value: dv,
      amount_received: ar,
      payment_status: status,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit income" : "Add income"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Client / source">
            <Input required value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} />
          </Field>
          <Field label="Service / project">
            <Input value={f.project_name} onChange={(e) => setF({ ...f, project_name: e.target.value })} />
          </Field>
          <Field label="Category">
            <NativeSelect options={INCOME_CATEGORIES} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          </Field>
          <Field label="Payment date">
            <Input type="date" required value={f.payment_date} onChange={(e) => setF({ ...f, payment_date: e.target.value })} />
          </Field>
          <Field label="Total deal value (₦)">
            <Input type="number" min={0} required inputMode="numeric" value={f.deal_value} onChange={(e) => setF({ ...f, deal_value: e.target.value })} />
          </Field>
          <Field label="Amount received (₦)">
            <Input type="number" min={0} inputMode="numeric" value={f.amount_received} onChange={(e) => setF({ ...f, amount_received: e.target.value })} />
          </Field>
          <div className="rounded-lg border bg-muted/50 p-3 text-sm sm:col-span-2">
            {invalid ? (
              <span className="text-negative">Amount received can't exceed the deal value.</span>
            ) : (
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>
                  Status: <b>{PAYMENT_STATUS[status]}</b>
                </span>
                <span>
                  Outstanding: <b className="figure">{naira(Math.max(0, dv - ar))}</b>
                </span>
              </div>
            )}
          </div>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending || invalid}>
              {save.isPending ? "Saving…" : "Save income"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RecordPaymentDialog({ open, onOpenChange, record }: DialogProps<Income>) {
  const save = useSave("income_records", "Payment");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayLagos());
  useEffect(() => {
    if (open && record) {
      setAmount(String(Number(record.deal_value) - Number(record.amount_received)));
      setDate(todayLagos());
    }
  }, [open, record]);
  if (!record) return null;
  const outstanding = Number(record.deal_value) - Number(record.amount_received);
  const amt = num(amount);
  const invalid = amt <= 0 || amt > outstanding;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!record || invalid) return;
    const received = Number(record.amount_received) + amt;
    await save.mutateAsync({
      id: record.id,
      client_name: record.client_name,
      project_name: record.project_name,
      category: record.category,
      deal_value: record.deal_value,
      amount_received: received,
      payment_status: derivePaymentStatus(Number(record.deal_value), received),
      payment_date: date,
      notes: [record.notes, `+${naira(amt)} received ${date}`].filter(Boolean).join("\n"),
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record payment — {record.client_name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Outstanding balance: <b className="figure text-foreground">{naira(outstanding)}</b>
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Amount received now (₦)">
            <Input type="number" min={1} max={outstanding} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Payment date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" disabled={invalid || save.isPending}>
            Add to this record
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExpenseDialog({ open, onOpenChange, record }: DialogProps<Expense>) {
  const save = useSave("expenses", "Expense");
  const blank = { description: "", amount: "", category: "tools", roi_classification: "essential", expense_date: todayLagos(), notes: "" };
  const [f, setF] = useState(blank);
  useEffect(() => {
    if (open)
      setF(
        record
          ? {
              description: record.description,
              amount: String(record.amount),
              category: record.category,
              roi_classification: record.roi_classification,
              expense_date: record.expense_date,
              notes: record.notes ?? "",
            }
          : blank,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await save.mutateAsync({ ...(record ? { id: record.id } : {}), ...f, amount: num(f.amount) });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit expense" : "Add expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Description" className="sm:col-span-2">
            <Input required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </Field>
          <Field label="Amount (₦)">
            <Input type="number" min={1} required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          </Field>
          <Field label="Date">
            <Input type="date" required value={f.expense_date} onChange={(e) => setF({ ...f, expense_date: e.target.value })} />
          </Field>
          <Field label="Category">
            <NativeSelect options={EXPENSE_CATEGORIES} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />
          </Field>
          <Field label="ROI classification">
            <NativeSelect
              options={{ essential: "Essential / Income-generating", non_essential: "Non-essential" }}
              value={f.roi_classification}
              onChange={(e) => setF({ ...f, roi_classification: e.target.value })}
            />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const STAGE_OPTIONS = Object.fromEntries(DEAL_STAGES.map((s) => [s.key, s.label]));

export function DealDialog({ open, onOpenChange, record }: DialogProps<Deal>) {
  const save = useSave("deals", "Deal");
  const blank = {
    client_name: "",
    contact_information: "",
    industry: "",
    service_type: "",
    estimated_value: "",
    stage: "new_lead",
    expected_close_date: "",
    next_follow_up_date: "",
    notes: "",
  };
  const [f, setF] = useState(blank);
  useEffect(() => {
    if (open)
      setF(
        record
          ? {
              client_name: record.client_name,
              contact_information: record.contact_information ?? "",
              industry: record.industry ?? "",
              service_type: record.service_type,
              estimated_value: String(record.estimated_value),
              stage: record.stage,
              expected_close_date: record.expected_close_date ?? "",
              next_follow_up_date: record.next_follow_up_date ?? "",
              notes: record.notes ?? "",
            }
          : blank,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await save.mutateAsync({
      ...(record ? { id: record.id } : {}),
      ...f,
      estimated_value: num(f.estimated_value),
      expected_close_date: f.expected_close_date || null,
      next_follow_up_date: f.next_follow_up_date || null,
    });
    onOpenChange(false);
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{record ? "Edit deal" : "New deal"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Business / client">
            <Input required value={f.client_name} onChange={(e) => setF({ ...f, client_name: e.target.value })} />
          </Field>
          <Field label="Contact (optional)">
            <Input value={f.contact_information} onChange={(e) => setF({ ...f, contact_information: e.target.value })} />
          </Field>
          <Field label="Industry">
            <Input value={f.industry} onChange={(e) => setF({ ...f, industry: e.target.value })} />
          </Field>
          <Field label="Service offered">
            <Input value={f.service_type} onChange={(e) => setF({ ...f, service_type: e.target.value })} />
          </Field>
          <Field label="Estimated value (₦)">
            <Input type="number" min={0} value={f.estimated_value} onChange={(e) => setF({ ...f, estimated_value: e.target.value })} />
          </Field>
          <Field label="Stage">
            <NativeSelect options={STAGE_OPTIONS} value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} />
          </Field>
          <Field label="Expected close">
            <Input type="date" value={f.expected_close_date} onChange={(e) => setF({ ...f, expected_close_date: e.target.value })} />
          </Field>
          <Field label="Next follow-up">
            <Input type="date" value={f.next_follow_up_date} onChange={(e) => setF({ ...f, next_follow_up_date: e.target.value })} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
