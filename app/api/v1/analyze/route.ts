import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-error";
import {
  INDUSTRY_CONFIG,
  INDUSTRY_BENCHMARK,
  sanitizeFullForm,
  calcResult,
  calcSimulation,
  calcStrategies,
  calcAnalysis,
  fmt,
  pct,
} from "@/lib/vela";

export const dynamic = "force-dynamic";

/**
 * VELA 분석 엔진 API v1
 *
 * POST /api/v1/analyze
 *
 * 외부 POS 시스템에서 매출 데이터를 보내면
 * 경영 분석 결과를 JSON으로 반환합니다.
 *
 * 인증: Bearer token (API_KEY)
 */

function verifyApiKey(req: NextRequest): boolean {
  const key = process.env.VELA_API_KEY;
  if (!key) return true; // 개발 환경
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${key}`;
}

export async function POST(req: NextRequest) {
  if (!verifyApiKey(req)) {
    return apiError("Invalid API key", 401);
  }

  try {
    const body = await req.json();
    const form = sanitizeFullForm(body);
    const result = calcResult(form);
    const simulation = calcSimulation(form);
    const strategies = calcStrategies(form, result.profit);
    const analysis = calcAnalysis(form, result);
    const config = INDUSTRY_CONFIG[form.industry];
    const benchmark = INDUSTRY_BENCHMARK[form.industry];

    return apiSuccess({
      // 기본 정보
      industry: { key: form.industry, label: config.label },
      businessType: form.businessType,

      // 핵심 지표
      summary: {
        totalSales: result.totalSales,
        totalSalesFormatted: `${fmt(result.totalSales)}원`,
        hallSales: result.hallSales,
        deliverySales: result.deliveryNetSales,
        profit: result.profit,
        profitFormatted: `${fmt(result.profit)}원`,
        netProfit: result.netProfit,
        netProfitFormatted: `${fmt(result.netProfit)}원`,
        netMargin: result.netMargin,
        netMarginFormatted: pct(result.netMargin),
        isProfit: result.profit >= 0,
      },

      // 비용 구조
      costs: {
        cogs: result.cogs,
        cogsRatio: result.cogsRatio,
        laborCost: result.laborCost,
        laborRatio: result.laborRatio,
        rent: form.rent,
        rentRatio: result.rentRatio,
        utilities: form.utilities + form.telecom,
        marketing: form.marketing,
        cardFee: result.cardFee,
        totalCost: result.totalCost,
      },

      // 손익분기
      breakeven: {
        bep: result.bep,
        bepFormatted: `${fmt(result.bep)}원`,
        bepGap: result.bepGap,
        achieved: result.bepGap >= 0,
      },

      // 투자 회수
      recovery: {
        months: result.recoveryMonthsActual,
        targetMonths: form.recoveryMonths,
        achieved: result.recoveryMonthsActual <= form.recoveryMonths,
      },

      // 세금
      tax: {
        vat: result.vatBurden,
        incomeTax: result.incomeTax,
        total: result.vatBurden + result.incomeTax,
      },

      // 현금흐름
      cashFlow: result.cashFlow,

      // 업종 벤치마크 비교
      benchmark: {
        industry: config.label,
        comparison: {
          cogsRate: { mine: result.cogsRatio, average: benchmark.cogsRate, diff: result.cogsRatio - benchmark.cogsRate },
          laborRate: { mine: result.laborRatio, average: benchmark.laborRate, diff: result.laborRatio - benchmark.laborRate },
          rentRate: { mine: result.rentRatio, average: benchmark.rentRate, diff: result.rentRatio - benchmark.rentRate },
          netMargin: { mine: result.netMargin, average: benchmark.netMargin, diff: result.netMargin - benchmark.netMargin },
        },
      },

      // 12개월 시뮬레이션
      simulation: simulation.slice(0, 12).map(m => ({
        label: m.label,
        sales: m.sales,
        profit: m.profit,
        netProfit: m.netProfit,
        cashFlow: m.cashFlow,
      })),

      // AI 전략 추천
      strategies: strategies.map(s => ({
        label: s.label,
        profit: s.profit,
        netProfit: s.netProfit,
        diff: s.diff,
        tags: s.tags,
      })),

      // 종합 분석
      analysis: analysis.map(a => ({
        title: a.title,
        body: a.body,
        tone: a.tone,
      })),
    });
  } catch (e) {
    console.error("Analyze API error:", e);
    return apiError("분석 실패: " + (e instanceof Error ? e.message : "알 수 없는 오류"), 400);
  }
}
