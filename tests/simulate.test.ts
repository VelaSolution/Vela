import { describe, it, expect } from "vitest";
import { simulate, type SimInputs } from "@/lib/simulate";

const defaults: SimInputs = {
  cash: 10000,
  initInvest: 5000,
  monthlyFixed: 500,
  variableRate: 35,
  firstRevenue: 800,
  growthRate: 5,
  targetRevenue: 2000,
};

function sim(overrides: Partial<SimInputs> = {}, growthOverride?: number) {
  return simulate({ ...defaults, ...overrides }, growthOverride);
}

describe("simulate — basic calculations", () => {
  it("produces 12 months of data", () => {
    const r = sim();
    expect(r.months).toHaveLength(12);
  });

  it("month 1 revenue equals firstRevenue", () => {
    const r = sim({ firstRevenue: 1000 });
    expect(r.months[0].rev).toBe(1000);
  });

  it("revenue grows each month by growthRate", () => {
    const r = sim({ firstRevenue: 1000, growthRate: 10 });
    // month 2 = 1000 * 1.1 = 1100
    expect(r.months[1].rev).toBe(Math.round(1000 * 1.1));
    // month 3 = 1000 * 1.1^2 = 1210
    expect(r.months[2].rev).toBe(Math.round(1000 * Math.pow(1.1, 2)));
  });

  it("calculates variable cost as rev * variableRate / 100", () => {
    const r = sim({ firstRevenue: 1000, variableRate: 40, growthRate: 0 });
    expect(r.months[0].variable).toBe(400);
  });

  it("profit = revenue - fixed - variable", () => {
    const r = sim({ firstRevenue: 1000, monthlyFixed: 300, variableRate: 20, growthRate: 0 });
    // variable = 200, profit = 1000 - 300 - 200 = 500
    expect(r.months[0].profit).toBe(500);
  });

  it("balance starts at cash - initInvest then accumulates profit", () => {
    const r = sim({ cash: 10000, initInvest: 3000, firstRevenue: 1000, monthlyFixed: 300, variableRate: 20, growthRate: 0 });
    const startBalance = 10000 - 3000; // 7000
    const profit = 1000 - 300 - 200; // 500
    expect(r.months[0].balance).toBe(startBalance + profit);
    expect(r.months[1].balance).toBe(startBalance + profit * 2);
  });

  it("totalRevenue sums all months", () => {
    const r = sim({ growthRate: 0, firstRevenue: 100 });
    expect(r.totalRevenue).toBe(100 * 12);
  });

  it("totalProfit sums all months profit", () => {
    const r = sim({ growthRate: 0, firstRevenue: 1000, monthlyFixed: 200, variableRate: 10 });
    // profit per month = 1000 - 200 - 100 = 700
    expect(r.totalProfit).toBe(700 * 12);
  });

  it("finalBalance equals last month balance", () => {
    const r = sim();
    expect(r.finalBalance).toBe(r.months[11].balance);
  });
});

describe("simulate — BEP calculation", () => {
  it("BEP revenue = fixed / (1 - variableRate/100)", () => {
    const r = sim({ monthlyFixed: 500, variableRate: 35 });
    const expected = Math.round(500 / (1 - 35 / 100)); // 769
    expect(r.bepRevenue).toBe(expected);
  });

  it("BEP revenue is 0 when variableRate is 100%", () => {
    const r = sim({ variableRate: 100 });
    expect(r.bepRevenue).toBe(0);
  });

  it("bepMonth is the first month where revenue >= bepRevenue", () => {
    // With firstRevenue=500, monthlyFixed=500, variableRate=35
    // BEP = 500 / 0.65 = 769
    // We need revenue >= 769. With 10% growth: 500, 550, 605, 666, 732, 805 -> month 6
    const r = sim({ firstRevenue: 500, monthlyFixed: 500, variableRate: 35, growthRate: 10 });
    expect(r.bepMonth).toBe(6);
  });

  it("bepMonth is null when revenue never reaches BEP", () => {
    // Very high fixed cost, low revenue, low growth
    const r = sim({ firstRevenue: 100, monthlyFixed: 5000, variableRate: 10, growthRate: 1 });
    expect(r.bepMonth).toBeNull();
  });
});

describe("simulate — runway detection", () => {
  it("runwayMonth is null when balance stays positive", () => {
    const r = sim({ cash: 100000, initInvest: 0, firstRevenue: 1000, monthlyFixed: 100, variableRate: 10, growthRate: 5 });
    expect(r.runwayMonth).toBeNull();
  });

  it("runwayMonth detects when balance goes to zero or negative", () => {
    // Cash 1000, invest 900 -> start balance 100
    // revenue 50, fixed 200, variable 50*0.5=25, profit = 50-200-25 = -175
    // month 1 balance = 100 + (-175) = -75 -> runway month 1
    const r = sim({ cash: 1000, initInvest: 900, firstRevenue: 50, monthlyFixed: 200, variableRate: 50, growthRate: 0 });
    expect(r.runwayMonth).toBe(1);
  });
});

describe("simulate — scenario comparison", () => {
  it("growthOverride changes growth rate used", () => {
    const base = sim({}, undefined);
    const conservative = sim({}, defaults.growthRate * 0.5);
    const optimistic = sim({}, defaults.growthRate * 1.5);

    // Higher growth => higher total revenue
    expect(optimistic.totalRevenue).toBeGreaterThan(base.totalRevenue);
    expect(base.totalRevenue).toBeGreaterThan(conservative.totalRevenue);
  });

  it("higher growth leads to higher final balance", () => {
    const conservative = sim({}, 1);
    const optimistic = sim({}, 15);
    expect(optimistic.finalBalance).toBeGreaterThan(conservative.finalBalance);
  });
});

describe("simulate — edge cases", () => {
  it("handles zero inputs gracefully", () => {
    const r = simulate({
      cash: 0, initInvest: 0, monthlyFixed: 0,
      variableRate: 0, firstRevenue: 0, growthRate: 0, targetRevenue: 0,
    });
    expect(r.months).toHaveLength(12);
    expect(r.totalRevenue).toBe(0);
    expect(r.totalProfit).toBe(0);
    expect(r.finalBalance).toBe(0);
  });

  it("handles 100% variable rate", () => {
    const r = sim({ variableRate: 100, firstRevenue: 1000, monthlyFixed: 500, growthRate: 0 });
    // variable = 1000, profit = 1000 - 500 - 1000 = -500
    expect(r.months[0].profit).toBe(-500);
    expect(r.bepRevenue).toBe(0); // special case: variableRate >= 100
  });

  it("paybackMonth is always month 1 when initInvest > 0", () => {
    // cum = -(cash - (cash - initInvest)) = -initInvest, which is <= 0
    // so the condition cum <= 0 is immediately true on month 1
    const r = sim({ cash: 100000, initInvest: 100000, firstRevenue: 10, monthlyFixed: 1000, variableRate: 50, growthRate: 0 });
    expect(r.paybackMonth).toBe(1);
  });

  it("paybackMonth is month 1 even for small initInvest", () => {
    // Same logic: cum = -1000 <= 0, so payback is month 1
    const r = sim({ cash: 5000, initInvest: 1000, firstRevenue: 1000, monthlyFixed: 100, variableRate: 10, growthRate: 0 });
    expect(r.paybackMonth).toBe(1);
  });
});
