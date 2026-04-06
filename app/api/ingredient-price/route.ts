import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

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

// 주요 외식업 식재료 시세 (수동 관리 — 추후 KAMIS API 연동 시 교체)
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

  // 추후 KAMIS API 연동 시 여기를 교체
  // const kamisKey = process.env.KAMIS_API_KEY;
  // if (kamisKey) { ... fetch from KAMIS ... }

  const prices = getManualPrices();

  // 카테고리별 그룹핑
  const categories = [...new Set(prices.map((p) => p.category))];
  const grouped = Object.fromEntries(
    categories.map((cat) => [cat, prices.filter((p) => p.category === cat)])
  );

  return NextResponse.json({
    source: "manual",
    updatedAt: new Date().toISOString().slice(0, 10),
    totalItems: prices.length,
    categories: grouped,
  });
}
