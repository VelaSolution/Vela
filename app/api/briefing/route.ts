import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-error";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { form, result } = await req.json();

  const industryLabels: Record<string, string> = {
    cafe: "카페", restaurant: "일반 음식점", bar: "술집/바", finedining: "파인다이닝",
  };
  const label = industryLabels[form.industry] ?? "음식점";

  const prompt = `당신은 외식업 전문 경영 컨설턴트입니다. 아래 매장 수치를 분석해 실용적인 조언을 제공하세요.

[기본 정보]
업종: ${label} / ${form.businessType === "new" ? "창업 예정" : "현재 운영 중"}
좌석 수: ${form.seats}석 / 객단가: ${Number(form.avgSpend).toLocaleString("ko-KR")}원 / 회전율: ${form.turnover}회
영업일: 평일 ${form.weekdayDays}일 + 주말 ${form.weekendDays}일 (주말 배율 ${form.weekendMultiplier}x)
배달 운영: ${form.deliveryEnabled ? `있음 (월 ${Number(form.deliverySales).toLocaleString("ko-KR")}원)` : "없음"}

[매출 현황]
홀 매출: ${Number(result.hallSales).toLocaleString("ko-KR")}원
배달 순매출: ${Number(result.deliveryNetSales).toLocaleString("ko-KR")}원
총 매출: ${Number(result.totalSales).toLocaleString("ko-KR")}원

[비용 구조]
인건비: ${Number(result.laborCost).toLocaleString("ko-KR")}원 (비율 ${result.laborRatio.toFixed(1)}%)
원가율: ${form.cogsRate}% / 카드수수료: ${form.cardFeeRate}%
임대료: ${Number(form.rent).toLocaleString("ko-KR")}원 / 공과금: ${Number(form.utilities).toLocaleString("ko-KR")}원
마케팅: ${Number(form.marketing).toLocaleString("ko-KR")}원 / 기타: ${Number(form.etc).toLocaleString("ko-KR")}원

[수익 현황]
세전 순이익: ${Number(result.profit).toLocaleString("ko-KR")}원 (순이익률 ${result.netMargin.toFixed(1)}%)
세후 실수령: ${Number(result.netProfit).toLocaleString("ko-KR")}원
현금흐름 (대출상환 후): ${Number(result.cashFlow).toLocaleString("ko-KR")}원
손익분기점: ${Number(result.bep).toLocaleString("ko-KR")}원 (${result.bepGap >= 0 ? "달성" : "미달"})

[초기비용 & 부채]
총 초기 투자비: ${Number(result.totalInitialCost).toLocaleString("ko-KR")}원
월 대출상환: ${Number(result.monthlyLoanPayment).toLocaleString("ko-KR")}원
투자금 회수 예상: ${result.recoveryMonthsActual === 999 ? "불가" : `${result.recoveryMonthsActual}개월`} (목표 ${form.recoveryMonths}개월)

다음 4가지를 JSON 형식으로만 응답하세요. JSON 외 다른 텍스트 절대 금지:
{
  "currentStatus": "현재 상태 2~3문장. 세후 실수령과 현금흐름 중심으로.",
  "mainIssue": "가장 시급한 문제 2~3문장. 투자 회수 포함 구체적 수치로.",
  "topAction": "최우선 실행 전략 2~3문장. 현실적이고 구체적으로.",
  "actionHint": "당장 이번 주 실행 가능한 액션 1~2가지. 짧고 명확하게."
}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return apiError("API 키가 설정되지 않았습니다.", 500);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) return apiError("AI 분석 중 오류가 발생했습니다.", 500);

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return new Response(JSON.stringify(parsed), { headers: { "Content-Type": "application/json" } });
  } catch {
    return apiError("응답 파싱에 실패했습니다.", 500);
  }
}
