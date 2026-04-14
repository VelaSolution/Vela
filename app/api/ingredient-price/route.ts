import { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api-error";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// KAMIS (농산물유통정보) API 또는 수동 관리 시세 데이터
// KAMIS API가 없으면 수동 업데이트된 시세 사용

type PriceItem = {
  name: string;
  category: string;
  unit: string;
  price: number;
  prevPrice: number;
  change: number;
  updatedAt: string;
};

// KAMIS API 품목 코드 매핑
const KAMIS_ITEMS: { code: string; name: string; category: string; unit: string }[] = [
  { code: "212", name: "삼겹살", category: "육류", unit: "1kg" },
  { code: "214", name: "목심(목살)", category: "육류", unit: "1kg" },
  { code: "215", name: "닭고기", category: "육류", unit: "1kg" },
  { code: "312", name: "쌀", category: "곡류", unit: "20kg" },
  { code: "111", name: "사과", category: "과일", unit: "10개" },
  { code: "141", name: "배추", category: "채소", unit: "1포기" },
  { code: "142", name: "양배추", category: "채소", unit: "1포기" },
  { code: "143", name: "시금치", category: "채소", unit: "1kg" },
  { code: "144", name: "상추", category: "채소", unit: "100g" },
  { code: "151", name: "무", category: "채소", unit: "1개" },
  { code: "152", name: "건고추", category: "채소", unit: "600g" },
  { code: "154", name: "대파", category: "채소", unit: "1kg" },
  { code: "155", name: "양파", category: "채소", unit: "1kg" },
  { code: "156", name: "마늘", category: "채소", unit: "1kg" },
  { code: "221", name: "계란", category: "유제품", unit: "30개" },
];

async function fetchKamisPrices(apiKey: string): Promise<PriceItem[]> {
  const today = new Date();
  const regday = today.toISOString().slice(0, 10).replace(/-/g, "");
  const url = `https://www.kamis.or.kr/service/price/xml.do?action=dailyPriceByCategoryList&p_product_cls_code=01&p_country_code=1101&p_regday=${regday}&p_convert_kg_yn=Y&p_cert_key=${apiKey}&p_cert_id=velaanalytics&p_returntype=json`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`KAMIS ${res.status}`);
  const json = await res.json();

  const items = json?.data?.item;
  if (!Array.isArray(items)) return getManualPrices();

  const result: PriceItem[] = [];
  for (const mapping of KAMIS_ITEMS) {
    const found = items.find((i: Record<string, string>) => i.item_code === mapping.code);
    if (!found) continue;
    const price = parseInt(String(found.dpr1 ?? "0").replace(/,/g, "")) || 0;
    const prevPrice = parseInt(String(found.dpr2 ?? "0").replace(/,/g, "")) || price;
    if (price <= 0) continue;
    const change = prevPrice > 0 ? parseFloat(((price - prevPrice) / prevPrice * 100).toFixed(1)) : 0;
    result.push({
      name: mapping.name,
      category: mapping.category,
      unit: mapping.unit,
      price,
      prevPrice,
      change,
      updatedAt: today.toISOString().slice(0, 10),
    });
  }

  return result.length > 0 ? result : getManualPrices();
}

// 주요 외식업 식재료 시세 (수동 관리 — KAMIS API 미연결 시 폴백)
function getManualPrices(): PriceItem[] {
  const today = new Date().toISOString().slice(0, 10);
  return [
    // 육류
    { name: "국내산 삼겹살", category: "육류", unit: "1kg", price: 22800, prevPrice: 23200, change: -1.7, updatedAt: today },
    { name: "국내산 목살", category: "육류", unit: "1kg", price: 19500, prevPrice: 19800, change: -1.5, updatedAt: today },
    { name: "수입 소고기 (채끝)", category: "육류", unit: "1kg", price: 38000, prevPrice: 37500, change: 1.3, updatedAt: today },
    { name: "닭가슴살", category: "육류", unit: "1kg", price: 6800, prevPrice: 6500, change: 4.6, updatedAt: today },
    // 수산물
    { name: "연어 (노르웨이)", category: "수산물", unit: "1kg", price: 32000, prevPrice: 31000, change: 3.2, updatedAt: today },
    { name: "새우 (흰다리)", category: "수산물", unit: "1kg", price: 18500, prevPrice: 18000, change: 2.8, updatedAt: today },
    // 채소
    { name: "양파", category: "채소", unit: "1kg", price: 1800, prevPrice: 2100, change: -14.3, updatedAt: today },
    { name: "대파", category: "채소", unit: "1kg", price: 3200, prevPrice: 3500, change: -8.6, updatedAt: today },
    { name: "마늘", category: "채소", unit: "1kg", price: 8500, prevPrice: 8200, change: 3.7, updatedAt: today },
    { name: "양배추", category: "채소", unit: "1kg", price: 1200, prevPrice: 1400, change: -14.3, updatedAt: today },
    // 유제품/기타
    { name: "우유", category: "유제품", unit: "1L", price: 2800, prevPrice: 2750, change: 1.8, updatedAt: today },
    { name: "계란", category: "유제품", unit: "30개", price: 7200, prevPrice: 7000, change: 2.9, updatedAt: today },
    // 곡류
    { name: "쌀 (20kg)", category: "곡류", unit: "20kg", price: 58000, prevPrice: 57000, change: 1.8, updatedAt: today },
    { name: "밀가루", category: "곡류", unit: "1kg", price: 1500, prevPrice: 1450, change: 3.4, updatedAt: today },
    // 음료 원재료
    { name: "원두 (브라질)", category: "음료", unit: "1kg", price: 18000, prevPrice: 17500, change: 2.9, updatedAt: today },
    { name: "원두 (에티오피아)", category: "음료", unit: "1kg", price: 24000, prevPrice: 23000, change: 4.3, updatedAt: today },
    // 주류
    { name: "소주 (1박스)", category: "주류", unit: "20병", price: 24000, prevPrice: 24000, change: 0, updatedAt: today },
    { name: "생맥주 (케그 20L)", category: "주류", unit: "20L", price: 65000, prevPrice: 63000, change: 3.2, updatedAt: today },
  ];
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, { key: "ingredient-price", limit: 20 });
  if (!rl.ok) return rateLimitResponse();

  // KAMIS API 연동
  const kamisKey = process.env.KAMIS_API_KEY;
  let prices: PriceItem[];

  if (kamisKey) {
    try {
      prices = await fetchKamisPrices(kamisKey);
    } catch (e) {
      console.error("KAMIS API error, falling back to manual:", e);
      prices = getManualPrices();
    }
  } else {
    prices = getManualPrices();
  }

  // 카테고리별 그룹핑
  const categories = [...new Set(prices.map((p) => p.category))];
  const grouped = Object.fromEntries(
    categories.map((cat) => [cat, prices.filter((p) => p.category === cat)])
  );

  return apiSuccess({
    source: kamisKey ? "kamis" : "manual",
    updatedAt: new Date().toISOString().slice(0, 10),
    totalItems: prices.length,
    categories: grouped,
  });
}
