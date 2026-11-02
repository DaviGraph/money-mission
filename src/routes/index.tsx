import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Wallet, CalendarClock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "60-Day Money Mission — ₦500,000 challenge tracker" },
      {
        name: "description",
        content: "Your private command center for earning ₦500,000 in 60 days: income, expenses, pipeline and daily habits.",
      },
      { property: "og:title", content: "60-Day Money Mission" },
      { property: "og:description", content: "Track income, expenses, deals and daily actions toward ₦500,000." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <div className="flex items-center gap-2 font-semibold text-sidebar-accent-foreground">
          <Target className="h-5 w-5 text-sidebar-primary" /> 60-Day Money Mission
        </div>
        <div className="my-auto py-16">
          <p className="figure text-sm text-sidebar-primary">NOV 2 → DEC 31, 2026</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-sidebar-accent-foreground md:text-6xl">
            ₦500,000 in 60 days. <span className="text-sidebar-primary">Tracked to the naira.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg">
            Record every payment, expense and pitch. See exactly what you must earn today to stay on track.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link to="/dashboard">Open my dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-sidebar-border bg-transparent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Link to="/auth">Create account</Link>
            </Button>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {[
              { i: Wallet, t: "Collected vs pending", d: "Partial payments counted only when received." },
              { i: CalendarClock, t: "Daily run rate", d: "Recalculated every day in Lagos time." },
              { i: TrendingUp, t: "Weighted pipeline", d: "Honest projections from your real deals." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="rounded-xl border border-sidebar-border bg-sidebar-accent p-5">
                <I className="h-5 w-5 text-sidebar-primary" />
                <p className="mt-3 font-medium text-sidebar-accent-foreground">{t}</p>
                <p className="mt-1 text-sm">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
