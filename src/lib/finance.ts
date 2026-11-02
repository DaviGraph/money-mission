// Pure financial + date logic for the 60-Day Money Mission. No I/O here.
export const TZ = "Africa/Lagos";

export type IncomeCategory = "website" | "automation" | "masterclass" | "other";
export type PaymentStatus = "paid" | "partial" | "pending";
export type ExpenseCategory = "tools" | "ads" | "data" | "transport" | "education" | "misc";
export type DealStage =
  | "new_lead"
  | "contacted"
  | "interested"
  | "discovery_call"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

export const INCOME_CATEGORIES: Record<IncomeCategory, string> = {
  website: "Website Development",
  automation: "AI Automation",
  masterclass: "Masterclass / Training",
  other: "Other",
};
export const PAYMENT_STATUS: Record<PaymentStatus, string> = {
  paid: "Paid",
  partial: "Partially Paid",
  pending: "Pending / Invoice Sent",
};
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  tools: "Tools / Software",
  ads: "Ads / Marketing",
  data: "Data / Internet",
  transport: "Transport",
  education: "Education / Learning",
  misc: "Miscellaneous",
};
export const DEAL_STAGES: { key: DealStage; label: string }[] = [
  { key: "new_lead", label: "New Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "interested", label: "Interested" },
  { key: "discovery_call", label: "Discovery Call" },
  { key: "proposal_sent", label: "Proposal Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];
export const DEFAULT_PROBABILITIES: Record<DealStage, number> = {
  new_lead: 5,
  contacted: 10,
  interested: 25,
  discovery_call: 40,
  proposal_sent: 60,
  negotiation: 80,
  won: 100,
  lost: 0,
};

export const ACTIVITY_FIELDS = [
  { key: "researched_businesses", label: "New businesses researched", qualifying: false },
  { key: "pitches_sent", label: "Personalized pitches sent", qualifying: true },
  { key: "followups_sent", label: "Follow-up messages sent", qualifying: true },
  { key: "calls_completed", label: "Discovery calls completed", qualifying: true },
  { key: "proposals_sent", label: "Proposals sent", qualifying: true },
  { key: "deals_closed", label: "Deals closed", qualifying: true },
  { key: "content_published", label: "Content published", qualifying: false },
  { key: "client_work_completed", label: "Client work completed", qualifying: false },
] as const;
export type ActivityKey = (typeof ACTIVITY_FIELDS)[number]["key"];

/** Today's date (YYYY-MM-DD) in Africa/Lagos. */
export function todayLagos(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const toUTC = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
export function daysBetween(a: string, b: string): number {
  return Math.round((toUTC(b) - toUTC(a)) / 86_400_000);
}
export function addDays(d: string, n: number): string {
  return new Date(toUTC(d) + n * 86_400_000).toISOString().slice(0, 10);
}

export function derivePaymentStatus(dealValue: number, received: number): PaymentStatus {
  if (received <= 0) return "pending";
  if (received < dealValue) return "partial";
  return "paid";
}

export type ChallengeClock = {
  phase: "before" | "active" | "ended";
  totalDays: number;
  currentDay: number; // 0 before start, totalDays after end
  daysElapsed: number; // fully completed days
  daysRemaining: number; // includes today while active
};

export function challengeClock(start: string, end: string, today: string): ChallengeClock {
  const totalDays = daysBetween(start, end) + 1;
  if (today < start)
    return { phase: "before", totalDays, currentDay: 0, daysElapsed: 0, daysRemaining: totalDays };
  if (today > end)
    return { phase: "ended", totalDays, currentDay: totalDays, daysElapsed: totalDays, daysRemaining: 0 };
  const currentDay = daysBetween(start, today) + 1;
  return {
    phase: "active",
    totalDays,
    currentDay,
    daysElapsed: currentDay - 1,
    daysRemaining: totalDays - currentDay + 1,
  };
}

type IncomeLike = { deal_value: number; amount_received: number; payment_date: string; category: string };
type ExpenseLike = { amount: number; expense_date: string; roi_classification: string; category: string };
type DealLike = { estimated_value: number; stage: string };

export function summarize(opts: {
  target: number;
  start: string;
  end: string;
  today: string;
  income: IncomeLike[];
  expenses: ExpenseLike[];
  deals: DealLike[];
  probabilities: Record<string, number>;
}) {
  const { target, start, end, today, income, expenses, deals, probabilities } = opts;
  const collected = sum(income.map((i) => Number(i.amount_received)));
  const pending = sum(income.map((i) => Math.max(0, Number(i.deal_value) - Number(i.amount_received))));
  const totalExpenses = sum(expenses.map((e) => Number(e.amount)));
  const netProfit = collected - totalExpenses;
  const remaining = Math.max(0, target - collected);
  const progressPct = target > 0 ? (collected / target) * 100 : 0;
  const expenseRatio = collected > 0 ? (totalExpenses / collected) * 100 : null;
  const todayIncome = sum(income.filter((i) => i.payment_date === today).map((i) => Number(i.amount_received)));
  const clock = challengeClock(start, end, today);
  // Required rate is measured at the start of today so it doesn't shift as today's income comes in.
  const remainingAtDayStart = Math.max(0, target - (collected - (clock.phase === "active" ? todayIncome : 0)));
  const runRate = clock.daysRemaining > 0 ? remainingAtDayStart / clock.daysRemaining : null;
  const active = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineValue = sum(active.map((d) => Number(d.estimated_value)));
  const weightedPipeline = sum(
    active.map((d) => (Number(d.estimated_value) * (probabilities[d.stage] ?? 0)) / 100),
  );
  // On-track: collected vs linear expected pace up to end of yesterday.
  const expectedByNow = clock.totalDays > 0 ? (target * clock.daysElapsed) / clock.totalDays : 0;
  return {
    collected,
    pending,
    totalExpenses,
    netProfit,
    remaining,
    progressPct,
    expenseRatio,
    todayIncome,
    runRate,
    todayDiff: runRate === null ? null : todayIncome - runRate,
    clock,
    pipelineValue,
    weightedPipeline,
    activeDeals: active.length,
    aheadBy: collected - expectedByNow,
    gapAfterPipeline: Math.max(0, target - collected - weightedPipeline),
  };
}

type ActivityLike = Partial<Record<ActivityKey, number>> & { activity_date: string };

export function qualifyingDates(income: IncomeLike[], activities: ActivityLike[]): Set<string> {
  const set = new Set<string>();
  income.forEach((i) => Number(i.amount_received) > 0 && set.add(i.payment_date));
  activities.forEach((a) => {
    if (ACTIVITY_FIELDS.some((f) => f.qualifying && (a[f.key] ?? 0) > 0)) set.add(a.activity_date);
  });
  return set;
}

export function streakStats(dates: Set<string>, start: string, end: string, today: string) {
  const last = today < end ? today : end;
  if (last < start) return { current: 0, longest: 0, activeDays: 0, missedDays: 0 };
  let longest = 0,
    run = 0,
    activeDays = 0,
    missedDays = 0;
  for (let d = start; d <= last; d = addDays(d, 1)) {
    if (dates.has(d)) {
      run++;
      activeDays++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
      if (d !== today) missedDays++; // today isn't missed yet
    }
  }
  // Current streak: count back from today (or yesterday if today isn't logged yet).
  let cur = 0;
  let d = dates.has(last) ? last : addDays(last, -1);
  while (d >= start && dates.has(d)) {
    cur++;
    d = addDays(d, -1);
  }
  return { current: cur, longest, activeDays, missedDays };
}

function sum(xs: number[]) {
  return xs.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export const naira = (n: number, compact = false) =>
  "₦" +
  new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(Math.round(n * (compact ? 10 : 1)) / (compact ? 10 : 1));
