// app/api/tools/generate/route.ts
// SNS 콘텐츠 생성기, 리뷰 답변 생성기, 상권 분석 도우미 전용 스트리밍 엔드포인트

import { NextRequest } from "next/server";

export const runtime = "edge";

const MAX_PROMPT_LENGTH = 4000;

export async function POST(req: NextRequest) {
  let body: { prompt?: unknown; systemPrompt?: unknown };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "잘못된 요청입니다." }), { status: 400 });
  }

  const { prompt, systemPrompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return new Response(JSON.stringify({ error: "프롬프트가 없습니다." }), { status: 400 });
  }

  // 프롬프트 길이 제한
  const safePrompt = prompt.slice(0, MAX_PROMPT_LENGTH);
  const safeSystem = typeof systemPrompt === "string"
    ? systemPrompt.slice(0, 1000)
    : "당신은 외식업 전문 마케터이자 경영 컨설턴트입니다. 사용자의 요청에 맞게 실용적이고 구체적으로 답변하세요.";

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API 키가 설정되지 않았습니다." }), { status: 500 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: safeSystem,
      stream: true,
      messages: [{ role: "user", content: safePrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "unknown");
    console.error("Anthropic API error:", response.status, errText);
    return new Response(JSON.stringify({ error: "AI 응답 중 오류가 발생했습니다." }), { status: 500 });
  }

  // SSE 스트림을 텍스트 청크로 변환해서 클라이언트로 전달
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) { controller.close(); return; }
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) { controller.close(); break; }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.trim());

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") { controller.close(); return; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                controller.enqueue(new TextEncoder().encode(parsed.delta.text));
              }
            } catch { /* skip malformed SSE lines */ }
          }
        }
      } catch (e) {
        controller.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
