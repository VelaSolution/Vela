// ─── Types & Helpers ────────────────────────────────────────────────────────

export type Ingredient = {
  id: string;
  name: string;
  cost: string;
};

export type MenuItem = {
  id: string;
  name: string;
  price: string;
  category: string;
  ingredients: Ingredient[];
};

export type IndustryKey = "cafe" | "restaurant" | "bar" | "finedining" | "gogi";

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function num(v: string) {
  const n = Number(v.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

export function calcMenu(item: MenuItem) {
  const price = num(item.price);
  const costTotal = item.ingredients.reduce((s, i) => s + num(i.cost), 0);
  const profit = price - costTotal;
  const costRatio = price > 0 ? (costTotal / price) * 100 : 0;
  const profitRatio = price > 0 ? (profit / price) * 100 : 0;
  return { price, costTotal, profit, costRatio, profitRatio };
}

export const CATEGORIES = ["전체", "음료", "푸드", "디저트", "주류", "기타"];

export const CATEGORY_COLOR: Record<string, string> = {
  음료: "#3182F6",
  푸드: "#059669",
  디저트: "#D97706",
  주류: "#7C3AED",
  기타: "#6B7684",
};

export const INDUSTRY_INFO: Record<IndustryKey, { label: string; emoji: string; color: string; bg: string }> = {
  cafe:       { label: "카페",       emoji: "☕", color: "#3182F6", bg: "#EBF3FF" },
  restaurant: { label: "음식점",     emoji: "🍽️", color: "#059669", bg: "#ECFDF5" },
  bar:        { label: "술집/바",    emoji: "🍺", color: "#7C3AED", bg: "#F5F3FF" },
  finedining: { label: "파인다이닝", emoji: "✨", color: "#D97706", bg: "#FFFBEB" },
  gogi:       { label: "고깃집",     emoji: "🥩", color: "#DC2626", bg: "#FEF2F2" },
};
