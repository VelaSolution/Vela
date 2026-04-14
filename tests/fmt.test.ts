import { describe, it, expect } from "vitest";
import { fmt, pct } from "@/lib/vela";

describe("fmt", () => {
  it("정수를 한국어 포맷으로 변환한다", () => {
    expect(fmt(1000)).toBe("1,000");
    expect(fmt(1000000)).toBe("1,000,000");
  });

  it("0을 처리한다", () => {
    expect(fmt(0)).toBe("0");
  });

  it("음수를 처리한다", () => {
    expect(fmt(-5000)).toBe("-5,000");
  });

  it("NaN은 0으로 처리한다", () => {
    expect(fmt(NaN)).toBe("0");
  });

  it("Infinity는 0으로 처리한다", () => {
    expect(fmt(Infinity)).toBe("0");
  });
});

describe("pct", () => {
  it("퍼센트를 소수점 1자리로 포맷한다", () => {
    expect(pct(33.333)).toBe("33.3%");
  });

  it("0%를 처리한다", () => {
    expect(pct(0)).toBe("0.0%");
  });
});
