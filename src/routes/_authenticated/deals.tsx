import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, ErrorBox, Loading, PageHeader, Stat } from "@/components/ui-bits";
import { ConfirmDelete, DealDialog, NativeSelect } from "@/components/forms";
import { useDeals, useGoal, useRemove, useSave, type Deal } from "@/lib/data";
import { DEAL_STAGES, naira, todayLagos } from "@/lib/finance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/deals")({
  head: () => ({ meta: [{ title: "Deals & Pipeline — 60-Day Money Mission" }] }),
  component: DealsPage,
});

const STAGE_OPTIONS = Object.fromEntries(DEAL_STAGES.map((s) => [s.key, s.label]));

function DealsPage() {
  const { data = [], isLoading, error } = useDeals();
  const { goal } = useGoal();
  const save = useSave("deals", "Deal");
  const remove = useRemove("deals", "Deal");
  const [edit, setEdit] = useState<Deal | null>(null);
  const [open, setOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const today = todayLagos();

  const active = data.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const won = data.filter((d) => d.stage === "won").length;
  const lost = data.filter((d) => d.stage === "lost").length;
  const conv = won + lost > 0 ? (won / (won + lost)) * 100 : null;

  function move(d: Deal, stage: string) {
    if (d.stage === stage) return;
    const { user_id: _u, created_at: _c, ...rest } = d;
    save.mutate({ ...rest, stage });
  }

  return (
    <div>
      <PageHeader
        title="Deals & Pipeline"
        sub="Estimated values stay separate from collected revenue. Drag cards or use the stage menu."
        actions={
          <Button onClick={() => { setEdit(null); setOpen(true); }}>
            <Plus /> New deal
          </Button>
        }
      />
      {error ? <ErrorBox error={error} /> : isLoading ? <Loading /> : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Stat label="Potential value" value={naira(active.reduce((a, d) => a + Number(d.estimated_value), 0))} tone="pipeline" />
            <Stat label="Active prospects" value={active.length} />
            <Stat label="Proposals sent" value={data.filter((d) => d.stage === "proposal_sent").length} />
            <Stat label="Won" value={won} tone="positive" />
            <Stat label="Lost" value={lost} tone="negative" />
            <Stat label="Conversion" value={conv === null ? "—" : `${conv.toFixed(0)}%`} hint="Won ÷ closed" />
          </div>
          <div className="-mx-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6">
            <div className="flex gap-3">
              {DEAL_STAGES.map((st) => {
                const items = data.filter((d) => d.stage === st.key);
                return (
                  <div
                    key={st.key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      const d = data.find((x) => x.id === dragId);
                      if (d) move(d, st.key);
                      setDragId(null);
                    }}
                    className="flex w-64 shrink-0 flex-col rounded-xl bg-muted/60 p-2"
                  >
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-sm font-medium">{st.label}</span>
                      <span className="figure text-xs text-muted-foreground">
                        {items.length} · {naira(items.reduce((a, d) => a + Number(d.estimated_value), 0), true)}
                      </span>
                    </div>
                    <div className="min-h-24 space-y-2">
                      {items.map((d) => {
                        const due = d.next_follow_up_date && d.next_follow_up_date <= today && st.key !== "won" && st.key !== "lost";
                        return (
                          <Card key={d.id} className="cursor-grab p-3 active:cursor-grabbing">
                            <div draggable onDragStart={() => setDragId(d.id)}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium leading-tight">{d.client_name}</p>
                                <span className="figure text-sm text-pipeline">{naira(Number(d.estimated_value), true)}</span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {[d.service_type, d.industry].filter(Boolean).join(" · ") || "—"}
                              </p>
                              {d.next_follow_up_date && (
                                <p className={cn("mt-2 flex items-center gap-1 text-xs", due ? "text-negative" : "text-muted-foreground")}>
                                  <CalendarClock className="h-3 w-3" /> Follow up {d.next_follow_up_date}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-muted-foreground">
                                Weighted: {naira((Number(d.estimated_value) * (goal.probabilities[d.stage as keyof typeof goal.probabilities] ?? 0)) / 100, true)}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center gap-1">
                              <NativeSelect className="h-7 flex-1 text-xs" value={d.stage} options={STAGE_OPTIONS} onChange={(e) => move(d, e.target.value)} />
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEdit(d); setOpen(true); }}>
                                <Pencil />
                              </Button>
                              <ConfirmDelete what="deal" onConfirm={() => remove.mutate(d.id)}>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Trash2 />
                                </Button>
                              </ConfirmDelete>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {data.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No deals yet — add your first prospect to start building pipeline.</p>
          )}
        </>
      )}
      <DealDialog open={open} onOpenChange={setOpen} record={edit} />
    </div>
  );
}
