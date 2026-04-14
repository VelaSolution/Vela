import { describe, it, expect } from "vitest";
import {
  createEmptyForm,
  sanitizeFullForm,
  calcResult,
  calcReverse,
  calcSimulation,
  calcStrategies,
  calcAnalysis,
  fmt,
  pct,
  INDUSTRY_CONFIG,
  VALID_INDUSTRIES,
  type FullForm,
} from "@/lib/vela";

// ---------------------------------------------------------------------------
// Helper: restaurant 기본 폼 생성
// ---------------------------------------------------------------------------
function defaultForm(overrides: Partial<FullForm> = {}): FullForm {
  const cfg = INDUSTRY_CONFIG.restaurant;
  return {
    industry: "restaurant",
    ...cfg.defaultStep1,
    ...cfg.defaultStep2,
    ...cfg.defaultStep3,
    ...overrides,
  };
}

// ===========================================================================
// fmt / pct
// ===========================================================================
describe("fmt", () => {
  it("숫자를 한국어 천 단위 콤마로 포맷한다", () => {
    expect(fmt(1234567)).toBe("1,234,567");
  });

  it("0을 포맷한다", () => {
    expect(fmt(0)).toBe("0");
  });

  it("Infinity는 0으로 처리한다", () => {
    expect(fmt(Infinity)).toBe("0");
  });

  it("NaN은 0으로 처리한다", () => {
    expect(fmt(NaN)).toBe("0");
  });

  it("음수를 포맷한다", () => {
    expect(fmt(-5000)).toBe("-5,000");
  });
});

describe("pct", () => {
  it("퍼센트 문자열로 변환한다", () => {
    expect(pct(12.345)).toBe("12.3%");
  });

  it("0을 처리한다", () => {
    expect(pct(0)).toBe("0.0%");
  });

  it("NaN은 0.0%로 처리한다", () => {
    expect(pct(NaN)).toBe("0.0%");
  });

  it("Infinity는 0.0%로 처리한다", () => {
    expect(pct(Infinity)).toBe("0.0%");
  });
});

// ===========================================================================
// createEmptyForm
// ===========================================================================
describe("createEmptyForm", () => {
  it("기본 업종(restaurant)으로 빈 폼을 생성한다", () => {
    const form = createEmptyForm();
    expect(form.industry).toBe("restaurant");
    expect(form.seats).toBe(0);
    expect(form.avgSpend).toBe(0);
  });

  it("cafe 업종으로 빈 폼을 생성한다", () => {
    const form = createEmptyForm("cafe");
    expect(form.industry).toBe("cafe");
  });

  it("빈 폼의 숫자 필드가 0 또는 기본값이다", () => {
    const form = createEmptyForm();
    expect(form.turnover).toBe(0);
    expect(form.weekdayDays).toBe(0);
    expect(form.weekendDays).toBe(0);
    expect(form.labor).toBe(0);
    expect(form.rent).toBe(0);
  });
});

// ===========================================================================
// sanitizeFullForm
// ===========================================================================
describe("sanitizeFullForm", () => {
  it("유효한 값은 그대로 유지한다", () => {
    const raw = { industry: "cafe", seats: 20, avgSpend: 6000, turnover: 4 };
    const form = sanitizeFullForm(raw);
    expect(form.industry).toBe("cafe");
    expect(form.seats).toBe(20);
    expect(form.avgSpend).toBe(6000);
    expect(form.turnover).toBe(4);
  });

  it("잘못된 업종은 restaurant로 대체한다", () => {
    const form = sanitizeFullForm({ industry: "invalid" });
    expect(form.industry).toBe("restaurant");
  });

  it("범위 밖의 숫자는 기본값으로 대체한다", () => {
    const form = sanitizeFullForm({ industry: "cafe", seats: -5 });
    // seats min=1, 기본값 사용
    expect(form.seats).toBeGreaterThanOrEqual(1);
  });

  it("NaN 값은 기본값으로 대체한다", () => {
    const form = sanitizeFullForm({ industry: "restaurant", seats: "abc" });
    expect(typeof form.seats).toBe("number");
    expect(form.seats).toBeGreaterThanOrEqual(1);
  });

  it("boolean 문자열을 올바르게 파싱한다", () => {
    const form = sanitizeFullForm({ industry: "restaurant", deliveryEnabled: "true", vatEnabled: "false" });
    expect(form.deliveryEnabled).toBe(true);
    expect(form.vatEnabled).toBe(false);
  });

  it("잘못된 deliveryPreference는 기본값으로 대체한다", () => {
    const form = sanitizeFullForm({ industry: "restaurant", deliveryPreference: "maybe" });
    expect(["possible", "impossible"]).toContain(form.deliveryPreference);
  });
});

// ===========================================================================
// calcResult
// ===========================================================================
describe("calcResult", () => {
  it("기본 restaurant 폼으로 올바르게 계산한다", () => {
    const form = defaultForm();
    const result = calcResult(form);

    expect(result.hallSales).toBeGreaterThan(0);
    expect(result.totalSales).toBeGreaterThan(0);
    expect(typeof result.profit).toBe("number");
    expect(typeof result.netMargin).toBe("number");
    expect(typeof result.bep).toBe("number");
  });

  it("홀 매출 = (좌석 * 객단가 * 회전율 * 평일일수) + (좌석 * 객단가 * 회전율 * 주말배율 * 주말일수)", () => {
    const form = defaultForm({
      seats: 10,
      avgSpend: 10000,
      turnover: 2,
      weekdayDays: 20,
      weekendDays: 8,
      weekendMultiplier: 1.5,
      deliveryEnabled: false,
    });
    const result = calcResult(form);
    const expectedWeekday = 10 * 10000 * 2 * 20;  // 4,000,000
    const expectedWeekend = 10 * 10000 * 2 * 1.5 * 8;  // 2,400,000
    expect(result.hallSales).toBe(expectedWeekday + expectedWeekend);
    expect(result.weekdaySales).toBe(expectedWeekday);
    expect(result.weekendSales).toBe(expectedWeekend);
  });

  it("배달 비활성시 배달 순매출이 0이다", () => {
    const form = defaultForm({ deliveryEnabled: false });
    const result = calcResult(form);
    expect(result.deliveryNetSales).toBe(0);
  });

  it("배달 활성시 배달 순매출이 양수이다", () => {
    const form = defaultForm({ deliveryEnabled: true, deliverySales: 3000000 });
    const result = calcResult(form);
    expect(result.deliveryNetSales).toBeGreaterThan(0);
    // 수수료 차감 후이므로 원래 매출보다 작아야 함
    expect(result.deliveryNetSales).toBeLessThan(3000000);
  });

  it("인건비 직접 입력 방식이 올바르게 동작한다", () => {
    const form = defaultForm({ laborType: "direct", labor: 5000000 });
    const result = calcResult(form);
    expect(result.laborCost).toBe(5000000);
  });

  it("인건비 계산 방식이 올바르게 동작한다", () => {
    const form = defaultForm({
      laborType: "calculate",
      staffCount: 3,
      hourlyWage: 10000,
      workHoursPerDay: 8,
      workDaysPerMonth: 22,
    });
    const result = calcResult(form);
    expect(result.laborCost).toBe(3 * 10000 * 8 * 22);
  });

  it("대출 비활성시 월 상환액이 0이다", () => {
    const form = defaultForm({ loanEnabled: false });
    const result = calcResult(form);
    expect(result.monthlyLoanPayment).toBe(0);
  });

  it("대출 활성시 월 상환액이 양수이다", () => {
    const form = defaultForm({ loanEnabled: true, loanAmount: 50000000, loanInterestRate: 5, loanTermMonths: 48 });
    const result = calcResult(form);
    expect(result.monthlyLoanPayment).toBeGreaterThan(0);
  });

  it("이자율 0 대출은 단순 균등분할이다", () => {
    const form = defaultForm({ loanEnabled: true, loanAmount: 12000000, loanInterestRate: 0, loanTermMonths: 12 });
    const result = calcResult(form);
    expect(result.monthlyLoanPayment).toBe(1000000);
  });

  it("totalSales = hallSales + deliveryNetSales", () => {
    const form = defaultForm({ deliveryEnabled: true, deliverySales: 2000000 });
    const result = calcResult(form);
    expect(result.totalSales).toBe(result.hallSales + result.deliveryNetSales);
  });

  it("cashFlow = netProfit - monthlyLoanPayment", () => {
    const form = defaultForm({ loanEnabled: true, loanAmount: 50000000 });
    const result = calcResult(form);
    expect(result.cashFlow).toBeCloseTo(result.netProfit - result.monthlyLoanPayment, 0);
  });

  it("totalInitialCost가 각 초기비용 항목의 합이다", () => {
    const form = defaultForm({
      deposit: 10000000,
      premiumKey: 5000000,
      interior: 20000000,
      equipment: 10000000,
      signage: 2000000,
      franchiseFee: 1000000,
      trainingFee: 500000,
      otherSetup: 3000000,
    });
    const result = calcResult(form);
    expect(result.totalInitialCost).toBe(10000000 + 5000000 + 20000000 + 10000000 + 2000000 + 1000000 + 500000 + 3000000);
  });

  it("매출 0이면 recoveryMonthsActual이 999이다", () => {
    const form = defaultForm({ seats: 0, avgSpend: 0, turnover: 0, deliveryEnabled: false, deposit: 10000000 });
    const result = calcResult(form);
    expect(result.recoveryMonthsActual).toBe(999);
  });

  it("프랜차이즈 비활성시 로열티가 0이다", () => {
    const form = defaultForm({ franchiseEnabled: false });
    const result = calcResult(form);
    expect(result.royaltyCost).toBe(0);
  });

  it("프랜차이즈 활성시 로열티가 양수이다", () => {
    const form = defaultForm({ franchiseEnabled: true, franchiseRoyaltyRate: 5 });
    const result = calcResult(form);
    expect(result.royaltyCost).toBeGreaterThan(0);
  });

  it("costBreakdown이 올바른 구조를 가진다", () => {
    const form = defaultForm();
    const result = calcResult(form);
    expect(result.costBreakdown).toHaveProperty("labor");
    expect(result.costBreakdown).toHaveProperty("cogs");
    expect(result.costBreakdown).toHaveProperty("rent");
    expect(result.costBreakdown).toHaveProperty("utilities");
    expect(result.costBreakdown).toHaveProperty("cardFee");
    expect(result.costBreakdown).toHaveProperty("royalty");
    expect(result.costBreakdown).toHaveProperty("marketing");
    expect(result.costBreakdown).toHaveProperty("other");
  });
});

// ===========================================================================
// calcReverse
// ===========================================================================
describe("calcReverse", () => {
  it("목표 순이익에 대한 역산 결과를 반환한다", () => {
    const form = defaultForm();
    const result = calcReverse(form, 5000000);

    expect(typeof result.neededAvgSpend).toBe("number");
    expect(typeof result.neededTurnover).toBe("number");
    expect(typeof result.avgSpendDiff).toBe("number");
    expect(typeof result.turnoverDiff).toBe("number");
  });

  it("높은 목표 순이익일수록 필요 객단가가 높다", () => {
    const form = defaultForm();
    const low = calcReverse(form, 3000000);
    const high = calcReverse(form, 10000000);
    expect(high.neededAvgSpend).toBeGreaterThan(low.neededAvgSpend);
  });

  it("neededCogsRate가 null 또는 0~95 범위이다", () => {
    const form = defaultForm();
    const result = calcReverse(form, 5000000);
    if (result.neededCogsRate !== null) {
      expect(result.neededCogsRate).toBeGreaterThanOrEqual(0);
      expect(result.neededCogsRate).toBeLessThanOrEqual(95);
    }
  });

  it("avgSpendDiff = neededAvgSpend - form.avgSpend", () => {
    const form = defaultForm();
    const result = calcReverse(form, 5000000);
    expect(result.avgSpendDiff).toBe(result.neededAvgSpend - form.avgSpend);
  });
});

// ===========================================================================
// calcSimulation
// ===========================================================================
describe("calcSimulation", () => {
  it("업종별 simSteps 수 만큼 시뮬레이션 항목을 반환한다", () => {
    const form = defaultForm();
    const cfg = INDUSTRY_CONFIG[form.industry];
    const items = calcSimulation(form);
    expect(items).toHaveLength(cfg.simSteps);
  });

  it("각 항목이 올바른 구조를 가진다", () => {
    const form = defaultForm();
    const items = calcSimulation(form);
    for (const item of items) {
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("sales");
      expect(item).toHaveProperty("profit");
      expect(item).toHaveProperty("netProfit");
      expect(item).toHaveProperty("cashFlow");
    }
  });

  it("객단가 증가에 따라 매출이 증가한다", () => {
    const form = defaultForm();
    const items = calcSimulation(form);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].sales).toBeGreaterThan(items[i - 1].sales);
    }
  });
});

// ===========================================================================
// calcStrategies
// ===========================================================================
describe("calcStrategies", () => {
  it("최대 5개의 전략을 반환한다", () => {
    const form = defaultForm();
    const base = calcResult(form);
    const strategies = calcStrategies(form, base.profit);
    expect(strategies.length).toBeLessThanOrEqual(5);
    expect(strategies.length).toBeGreaterThan(0);
  });

  it("diff 기준으로 내림차순 정렬되어 있다", () => {
    const form = defaultForm();
    const base = calcResult(form);
    const strategies = calcStrategies(form, base.profit);
    for (let i = 1; i < strategies.length; i++) {
      expect(strategies[i - 1].diff).toBeGreaterThanOrEqual(strategies[i].diff);
    }
  });

  it("각 전략이 올바른 구조를 가진다", () => {
    const form = defaultForm();
    const base = calcResult(form);
    const strategies = calcStrategies(form, base.profit);
    for (const s of strategies) {
      expect(s).toHaveProperty("label");
      expect(s).toHaveProperty("profit");
      expect(s).toHaveProperty("diff");
      expect(s).toHaveProperty("tags");
      expect(Array.isArray(s.tags)).toBe(true);
    }
  });
});

// ===========================================================================
// calcAnalysis
// ===========================================================================
describe("calcAnalysis", () => {
  it("분석 결과가 배열로 반환된다", () => {
    const form = defaultForm();
    const result = calcResult(form);
    const analysis = calcAnalysis(form, result);
    expect(Array.isArray(analysis)).toBe(true);
    expect(analysis.length).toBeGreaterThan(0);
  });

  it("각 분석 항목이 올바른 구조를 가진다", () => {
    const form = defaultForm();
    const result = calcResult(form);
    const analysis = calcAnalysis(form, result);
    for (const item of analysis) {
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("body");
      expect(item).toHaveProperty("tone");
      expect(["default", "good", "warn", "bad"]).toContain(item.tone);
    }
  });

  it("적자 상태에서 bad tone이 포함된다", () => {
    const form = defaultForm({
      seats: 5,
      avgSpend: 5000,
      turnover: 0.5,
      rent: 10000000,
      labor: 10000000,
    });
    const result = calcResult(form);
    const analysis = calcAnalysis(form, result);
    const hasBad = analysis.some((a) => a.tone === "bad");
    expect(hasBad).toBe(true);
  });

  it("인건비 과다 시 경고가 포함된다", () => {
    const form = defaultForm({ labor: 50000000 });
    const result = calcResult(form);
    const analysis = calcAnalysis(form, result);
    const hasLaborWarn = analysis.some((a) => a.title.includes("인건비"));
    expect(hasLaborWarn).toBe(true);
  });
});

// ===========================================================================
// 모든 업종 기본값으로 calcResult가 오류 없이 동작하는지 확인
// ===========================================================================
describe("모든 업종 기본값 테스트", () => {
  for (const industry of VALID_INDUSTRIES) {
    it(`${industry} 업종 기본값으로 정상 계산된다`, () => {
      const cfg = INDUSTRY_CONFIG[industry];
      const form: FullForm = {
        industry,
        ...cfg.defaultStep1,
        ...cfg.defaultStep2,
        ...cfg.defaultStep3,
      };
      const result = calcResult(form);
      expect(result.totalSales).toBeGreaterThan(0);
      expect(typeof result.profit).toBe("number");
      expect(typeof result.netMargin).toBe("number");
    });
  }
});
