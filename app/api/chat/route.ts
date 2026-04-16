import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-error";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip, { key: "chat", limit: 10 });
  if (!rl.ok) return rateLimitResponse();
  const body = await req.json();
  const { messages, context } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return apiError("메시지가 없습니다.", 400);
  }
  if (messages.length > 100) {
    return apiError("대화가 너무 깁니다.", 400);
  }

  const industryLabels: Record<string, string> = {
    cafe: "카페", restaurant: "일반 음식점", bar: "술집/바", finedining: "파인다이닝", gogi: "고깃집",
  };

  const anonymousPrompt = `당신은 VELA의 외식업 전문 경영 컨설턴트 AI입니다.
외식업 사장님의 익명 고민 상담에 답변합니다.
업종: ${industryLabels[context?.industry ?? ""] ?? "외식업"}

답변 규칙:
1. 먼저 사장님의 상황에 공감하는 문장으로 시작하세요.
2. 문제의 핵심 원인을 짚어주세요.
3. 실행 가능한 구체적 해결책을 2~3가지 제안하세요.
4. 격려와 응원으로 마무리하세요.
5. 답변은 반드시 완결된 문장으로 끝내세요. 중간에 끊기지 않도록 하세요.

수치가 없어도 일반적인 경영 원칙과 실무 경험을 바탕으로 도움이 되는 답변을 해주세요.`;

  const deliveryConstraint = context?.form?.deliveryPreference === "impossible"
    ? "\n⚠️ 이 매장은 배달 운영 의사가 없습니다. 배달 관련 전략은 절대 추천하지 마세요."
    : "";

  const systemPrompt = context?.isAnonymousConsult
    ? anonymousPrompt
    : context?.form
    ? `당신은 VELA의 외식업 전문 경영 컨설턴트 AI입니다.
사용자의 매장 데이터를 기반으로 실용적이고 구체적인 조언을 제공하세요.
친절하고 명확하게 답변하되, 전문 용어는 쉽게 풀어서 설명하세요.
답변은 간결하게 3~5문장 이내로 유지하세요.${deliveryConstraint}

[현재 매장 데이터]
업종: ${industryLabels[context.form?.industry] ?? "음식점"} (${context.form?.businessType === "new" ? "창업 예정" : "운영 중"})
좌석: ${context.form?.seats}석 / 객단가: ${Number(context.form?.avgSpend ?? 0).toLocaleString("ko-KR")}원 / 회전율: ${context.form?.turnover}회
영업일: 평일 ${context.form?.weekdayDays}일 + 주말 ${context.form?.weekendDays}일

[월 수익 현황]
총 매출: ${Number(context.result?.totalSales ?? 0).toLocaleString("ko-KR")}원
세전 순이익: ${Number(context.result?.profit ?? 0).toLocaleString("ko-KR")}원 (순이익률 ${context.result?.netMargin?.toFixed(1)}%)
세후 실수령: ${Number(context.result?.netProfit ?? 0).toLocaleString("ko-KR")}원
현금흐름: ${Number(context.result?.cashFlow ?? 0).toLocaleString("ko-KR")}원
손익분기점: ${Number(context.result?.bep ?? 0).toLocaleString("ko-KR")}원 (${(context.result?.bepGap ?? 0) >= 0 ? "달성" : "미달"})
인건비 비율: ${context.result?.laborRatio?.toFixed(1)}%
원가율: ${context.result?.cogsRatio?.toFixed(1)}%
투자금 회수: ${context.result?.recoveryMonthsActual === 999 ? "불가" : `${context.result?.recoveryMonthsActual}개월 예상`}`
    : `당신은 VELA의 외식업 전문 경영 컨설턴트 AI입니다. 외식업 창업과 운영에 관한 질문에 친절하고 실용적으로 답변하세요. 답변은 3~5문장 이내로 간결하게 유지하세요.`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return apiError("API 키가 설정되지 않았습니다.", 500);
  }

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: context?.isAnonymousConsult ? 2048 : 1024,
        system: systemPrompt,
        stream: true,
        messages: messages
          .slice(-50)
          .map((m: { role: string; content: string }) => ({
            role: m.role,
            content: String(m.content).slice(0, 2000),
          })),
      }),
    });
  } catch {
    return apiError("AI 서버에 연결할 수 없습니다.", 502);
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text().catch(() => "unknown");
    console.error("[chat] Anthropic error:", anthropicRes.status, errText);
    return apiError("AI 응답 중 오류가 발생했습니다.", 500);
  }

  if (!anthropicRes.body) {
    return apiError("AI 응답 스트림이 없습니다.", 500);
  }

  // Anthropic SSE → plain text 변환 (pull 패턴)
  const reader = anthropicRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let done = false;

  const stream = new ReadableStream({
    async pull(controller) {
      if (done) { controller.close(); return; }

      while (true) {
        const result = await reader.read();
        if (result.done) {
          done = true;
          controller.close();
          return;
        }

        buffer += decoder.decode(result.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let enqueued = false;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(parsed.delta.text));
              enqueued = true;
            }
            if (parsed.type === "message_stop" || parsed.type === "error") {
              done = true;
              controller.close();
              return;
            }
          } catch { /* incomplete JSON chunk */ }
        }

        if (enqueued) return; // yield control back after enqueuing
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store",
      "Transfer-Encoding": "chunked",
      "X-Accel-Buffering": "no",
    },
  });
}
