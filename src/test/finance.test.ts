import { describe, expect, it } from "vitest";
import { challengeClock, derivePaymentStatus, qualifyingDates, streakStats, summarize } from "@/lib/finance";

const base = { target: 500000, start: "2026-11-02", end: "2026-12-31", deals: [], expenses: [], probabilities: {} };

describe("finance rules", () => {
  it("challenge is 60 days and day 1 is Nov 2", () => {
    const c = challengeClock("2026-11-02", "2026-12-31", "2026-11-02");
    expect(c.totalDays).toBe(60);
    expect(c.currentDay).toBe(1);
    expect(c.daysRemaining).toBe(60);
  });
  it("after deadline there are 0 days remaining and no run rate", () => {
    const s = summarize({ ...base, today: "2027-01-05", income: [] });
    expect(s.clock.daysRemaining).toBe(0);
    expect(s.runRate).toBeNull();
  });
  it("partial payment counts only amount received; outstanding is pending", () => {
    const s = summarize({
      ...base,
      today: "2026-11-10",
      income: [{ deal_value: 150000, amount_received: 75000, payment_date: "2026-11-05", category: "website" }],
    });
    expect(s.collected).toBe(75000);
    expect(s.pending).toBe(75000);
    expect(s.remaining).toBe(425000);
    expect(derivePaymentStatus(150000, 75000)).toBe("partial");
  });
  it("run rate = remaining / remaining days (350k over 35 days = 10k)", () => {
    // Nov 26 is day 25 -> 36 days remaining incl today; use Nov 27 -> 35 days.
    const s = summarize({
      ...base,
      today: "2026-11-27",
      income: [{ deal_value: 150000, amount_received: 150000, payment_date: "2026-11-03", category: "website" }],
    });
    expect(s.clock.daysRemaining).toBe(35);
    expect(s.runRate).toBe(10000);
  });
  it("net profit = collected - expenses; expense ratio null at zero income", () => {
    const s = summarize({
      ...base,
      today: "2026-11-10",
      income: [],
      expenses: [{ amount: 5000, expense_date: "2026-11-03", roi_classification: "essential", category: "tools" }],
    });
    expect(s.netProfit).toBe(-5000);
    expect(s.expenseRatio).toBeNull();
  });
  it("weighted pipeline excludes won/lost deals", () => {
    const s = summarize({
      ...base,
      today: "2026-11-10",
      income: [],
      deals: [
        { estimated_value: 100000, stage: "proposal_sent" },
        { estimated_value: 200000, stage: "won" },
      ],
      probabilities: { proposal_sent: 60, won: 100 },
    });
    expect(s.weightedPipeline).toBe(60000);
  });
  it("streak counts qualifying days; research alone does not qualify", () => {
    const dates = qualifyingDates(
      [],
      [
        { activity_date: "2026-11-02", pitches_sent: 2 },
        { activity_date: "2026-11-03", followups_sent: 1 },
        { activity_date: "2026-11-04", researched_businesses: 5 },
      ],
    );
    const s = streakStats(dates, "2026-11-02", "2026-12-31", "2026-11-04");
    expect(s.longest).toBe(2);
    expect(s.current).toBe(2);
    expect(s.missedDays).toBe(0);
  });
});
