// app/api/tools/generate/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let body: { prompt?: unknown; systemPrompt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { prompt, systemPrompt } = body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "프롬프트가 없습니다." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  const safeSystem = typeof systemPrompt === "string" && systemPrompt.trim()
    ? systemPrompt.slice(0, 1000)
    : "당신은 외식업 전문 마케터이자 경영 컨설턴트입니다. 사용자의 요청에 맞게 실용적이고 구체적으로 답변하세요.";

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
      messages: [{ role: "user", content: prompt.slice(0, 4000) }],
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "unknown");
    console.error("Anthropic error:", response.status, err);
    return NextResponse.json({ error: "AI 응답 중 오류가 발생했습니다." }, { status: 500 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  return NextResponse.json({ text });
}

