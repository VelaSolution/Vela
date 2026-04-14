import { describe, it, expect } from "vitest";
import { PLANS, PLAN_LIMITS, PLAN_PRICES, type PlanId } from "@/lib/plans";

describe("Plans", () => {
  it("free와 standard 플랜이 정의되어 있다", () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toContain("free");
    expect(ids).toContain("standard");
  });

  it("free 플랜은 PLAN_PRICES에 포함되지 않는다 (0원)", () => {
    expect(PLAN_PRICES.free).toBeUndefined();
  });

  it("free 플랜의 priceNum은 0이다", () => {
    const free = PLANS.find((p) => p.id === "free");
    expect(free?.priceNum).toBe(0);
  });

  it("standard 플랜은 9900원이다", () => {
    expect(PLAN_PRICES.standard).toBe(9900);
  });

  it("free 플랜은 시뮬레이터 월 10회 제한", () => {
    expect(PLAN_LIMITS.free.simulatorPerMonth).toBe(10);
  });

  it("standard 플랜은 시뮬레이터 무제한", () => {
    expect(PLAN_LIMITS.standard.simulatorPerMonth).toBe(Infinity);
  });

  it("free 플랜은 AI 비활성화", () => {
    expect(PLAN_LIMITS.free.aiEnabled).toBe(false);
  });

  it("standard 플랜은 AI 활성화", () => {
    expect(PLAN_LIMITS.standard.aiEnabled).toBe(true);
  });
});
