// lib/quickStore.ts
// 시뮬레이터 <-> 도구 공유 데이터 스토어
// 중앙 storage 모듈을 통해 localStorage에 접근

import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  loadFormData,
  saveFormData,
} from "./storage";

export type QuickData = {
  /** 월 총 매출 */
  monthlySales: number;
  /** 임대료 */
  rent: number;
  /** 인건비 */
  laborCost: number;
  /** 원가율 (%) */
  cogsRate: number;
  /** 기타 비용 */
  etc: number;
  /** 업종 ID */
  industry: string;
  /** 좌석 수 */
  seats: number;
  /** 객단가 */
  avgSpend: number;
  /** ISO 날짜 */
  updatedAt: string;
  /** YYYY-MM */
  month: string;
};

/** QuickData 필드 유효성 검증 */
function validateQuickData(data: unknown): data is QuickData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.monthlySales === "number" &&
    typeof d.rent === "number" &&
    typeof d.laborCost === "number" &&
    typeof d.cogsRate === "number" &&
    typeof d.etc === "number" &&
    typeof d.industry === "string" &&
    typeof d.seats === "number" &&
    typeof d.avgSpend === "number" &&
    typeof d.updatedAt === "string" &&
    typeof d.month === "string"
  );
}

export function saveQuickData(data: QuickData): boolean {
  if (!validateQuickData(data)) {
    console.warn("[VELA quickStore] 유효하지 않은 QuickData:", data);
    return false;
  }
  return setStorageItem(STORAGE_KEYS.QUICK, data);
}

export function loadQuickData(): QuickData | null {
  const data = getStorageItem<QuickData>(STORAGE_KEYS.QUICK);
  if (data && !validateQuickData(data)) {
    console.warn("[VELA quickStore] 저장된 QuickData가 유효하지 않음, 무시합니다.");
    return null;
  }
  return data;
}

export function clearQuickData(): void {
  removeStorageItem(STORAGE_KEYS.QUICK);
}

/**
 * QuickData를 시뮬레이터 폼(vela-form-v3)에 병합
 * 월매출로부터 회전율을 역산하여 반영
 */
export function applyQuickToSimulator(data: QuickData): boolean {
  if (!validateQuickData(data)) {
    console.warn("[VELA quickStore] applyQuickToSimulator: 유효하지 않은 데이터");
    return false;
  }

  const existing = loadFormData<Record<string, unknown>>() ?? {};

  // 역산: 월매출 -> 좌석 * 객단가 * 회전율 추정
  const seats = data.seats || (existing.seats as number) || 20;
  const avgSpend = data.avgSpend || (existing.avgSpend as number) || 15000;
  const weekdayDays = (existing.weekdayDays as number) || 22;
  const weekendDays = (existing.weekendDays as number) || 8;
  const weekendMultiplier = (existing.weekendMultiplier as number) || 1.3;
  const totalDays = weekdayDays + weekendDays * weekendMultiplier;

  const turnover =
    data.monthlySales > 0
      ? Math.round((data.monthlySales / (seats * avgSpend * totalDays)) * 10) / 10
      : (existing.turnover as number) || 2;

  const merged = {
    ...existing,
    industry: data.industry || (existing.industry as string) || "restaurant",
    seats,
    avgSpend,
    turnover: Math.max(0.5, Math.min(turnover, 10)),
    rent: data.rent,
    labor: data.laborCost,
    cogsRate: data.cogsRate,
    etc: data.etc,
  };

  return saveFormData(merged);
}
