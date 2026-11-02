import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]", className)}>{children}</div>;
}

export function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: ReactNode;
  tone?: "positive" | "negative" | "pipeline";
  hint?: ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "figure mt-1.5 text-xl font-semibold",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-negative",
          tone === "pipeline" && "text-pipeline",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
      <p className="font-medium">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  return (
    <div className="rounded-xl border border-negative/30 bg-negative-soft p-4 text-sm text-negative">
      Couldn't load your data: {error instanceof Error ? error.message : String(error)}
    </div>
  );
}

export const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)"];
