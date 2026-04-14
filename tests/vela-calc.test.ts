import { describe, it, expect } from "vitest";
import { calcResult, INDUSTRY_CONFIG, type FullForm } from "@/lib/vela";

function makeForm(overrides: Partial<FullForm> = {}): FullForm {
  const cfg = INDUSTRY_CONFIG.cafe;
  return {
    ...cfg.defaultStep1,
    industry: "cafe" as const,
    ...cfg.defaultStep2,
    ...cfg.defaultStep3,
    ...overrides,
  };
}

describe("calcResult", () => {
  it("카페 기본 폼으로 매출을 계산한다", () => {
    const form = makeForm();
    const r = calcResult(form);

    expect(r.totalSales).toBeGreaterThan(0);
    expect(r.hallSales).toBeGreaterThan(0);
    expect(r.totalCost).toBeGreaterThan(0);
    expect(r.profit).toBeDefined();
  });

  it("매출 = 홀매출 + 배달순매출", () => {
    const form = makeForm();
    const r = calcResult(form);
    expect(r.totalSales).toBeCloseTo(r.hallSales + r.deliveryNetSales, 0);
  });

  it("홀매출 = 좌석 * 객단가 * 회전율 * (평일일수 + 주말일수*주말배율)", () => {
    const form = makeForm({ seats: 20, avgSpend: 6000, turnover: 4, weekdayDays: 20, weekendDays: 8, weekendMultiplier: 1.5 });
    const r = calcResult(form);
    const expected = 20 * 6000 * 4 * 20 + 20 * 6000 * 4 * 1.5 * 8;
    expect(r.hallSales).toBe(expected);
  });

  it("배달 비활성화 시 배달매출 0", () => {
    const form = makeForm({ deliveryEnabled: false });
    const r = calcResult(form);
    expect(r.deliveryNetSales).toBe(0);
  });

  it("배달 활성화 시 수수료 차감된 매출", () => {
    const form = makeForm({ deliveryEnabled: true, deliverySales: 1000000, deliveryAppRate: 15, deliveryDirectRate: 30 });
    const r = calcResult(form);
    expect(r.deliveryNetSales).toBeGreaterThan(0);
    expect(r.deliveryNetSales).toBeLessThan(1000000);
  });

  it("원가율이 0~100% 사이", () => {
    const form = makeForm();
    const r = calcResult(form);
    expect(r.cogsRatio).toBeGreaterThanOrEqual(0);
    expect(r.cogsRatio).toBeLessThanOrEqual(100);
  });

  it("BEP는 고정비 / (1 - 변동비율)", () => {
    const form = makeForm();
    const r = calcResult(form);
    expect(r.bep).toBeGreaterThan(0);
  });

  it("순이익 = 매출 - 총비용 - 세금 - 부가세", () => {
    const form = makeForm();
    const r = calcResult(form);
    const expected = r.profit - r.incomeTax - r.vatBurden;
    expect(r.netProfit).toBeCloseTo(expected, 0);
  });

  it("투자금 회수 기간은 양수 (현금흐름 양수일 때)", () => {
    const form = makeForm({ deposit: 10000000, interior: 20000000 });
    const r = calcResult(form);
    if (r.cashFlow > 0) {
      expect(r.recoveryMonthsActual).toBeGreaterThan(0);
      expect(r.recoveryMonthsActual).toBeLessThan(999);
    }
  });

  it("업종별로 다른 결과를 반환한다", () => {
    const cafe = calcResult(makeForm({ industry: "cafe" }));
    const restaurant = calcResult(makeForm({
      industry: "restaurant",
      ...INDUSTRY_CONFIG.restaurant.defaultStep1,
      ...INDUSTRY_CONFIG.restaurant.defaultStep2,
      ...INDUSTRY_CONFIG.restaurant.defaultStep3,
    }));
    expect(cafe.totalSales).not.toBe(restaurant.totalSales);
  });
});

describe("calcResult — 비용 구조", () => {
  it("costBreakdown 항목이 모두 존재한다", () => {
    const r = calcResult(makeForm());
    expect(r.costBreakdown).toHaveProperty("labor");
    expect(r.costBreakdown).toHaveProperty("cogs");
    expect(r.costBreakdown).toHaveProperty("rent");
    expect(r.costBreakdown).toHaveProperty("utilities");
    expect(r.costBreakdown).toHaveProperty("cardFee");
  });

  it("인건비 직접계산 모드 동작", () => {
    const r = calcResult(makeForm({ laborType: "calculate", staffCount: 3, hourlyWage: 10000, workHoursPerDay: 8, workDaysPerMonth: 22 }));
    expect(r.laborCost).toBe(3 * 10000 * 8 * 22);
  });
});
