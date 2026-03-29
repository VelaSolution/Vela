// lib/quickStore.ts
// 시뮬레이터 ↔ 도구 공유 데이터 스토어

const QUICK_KEY = "vela-quick-v1";

export type QuickData = {
  // 기본 매출 정보
  monthlySales: number;       // 월 총 매출
  rent: number;               // 임대료
  laborCost: number;          // 인건비
  cogsRate: number;           // 원가율 (%)
  etc: number;                // 기타 비용
  // 업종 정보
  industry: string;
  seats: number;
  avgSpend: number;
  // 메타
  updatedAt: string;          // ISO 날짜
  month: string;              // YYYY-MM
};

export function saveQuickData(data: QuickData) {
  try {
    localStorage.setItem(QUICK_KEY, JSON.stringify(data));
  } catch {}
}

export function loadQuickData(): QuickData | null {
  try {
    const raw = localStorage.getItem(QUICK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuickData;
  } catch {
    return null;
  }
}

export function clearQuickData() {
  try {
    localStorage.removeItem(QUICK_KEY);
  } catch {}
}

// QuickData → vela-form-v3 키에 병합 (시뮬레이터 자동 채움)
export function applyQuickToSimulator(data: QuickData) {
  try {
    const STORAGE_KEY = "vela-form-v3";
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};

    // 역산: 월매출 → 좌석·객단가·회전율 추정
    const seats = data.seats || existing.seats || 20;
    const avgSpend = data.avgSpend || existing.avgSpend || 15000;
    // 주 5.5일 기준, 4.345주
    const weekdayDays = existing.weekdayDays || 22;
    const weekendDays = existing.weekendDays || 8;
    const weekendMultiplier = existing.weekendMultiplier || 1.3;
    const totalDays = weekdayDays + weekendDays * weekendMultiplier;
    const turnover = data.monthlySales > 0
      ? Math.round((data.monthlySales / (seats * avgSpend * totalDays)) * 10) / 10
      : existing.turnover || 2;

    const merged = {
      ...existing,
      industry: data.industry || existing.industry || "restaurant",
      seats,
      avgSpend,
      turnover: Math.max(0.5, Math.min(turnover, 10)),
      rent: data.rent,
      labor: data.laborCost,
      cogsRate: data.cogsRate,
      etc: data.etc,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}
