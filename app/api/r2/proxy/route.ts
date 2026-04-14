import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/api-error";

const ALLOWED_DOMAINS = [
  "pub-8fd7d785db83458b8cf8e3a4747b3370.r2.dev",
  "mkhnkgjpjsjadxuxtiya.supabase.co",
];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return apiError("URL 필요", 400);

  // SSRF 방지: 허용된 도메인만
  try {
    const parsed = new URL(url);
    if (!ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d))) {
      return apiError("허용되지 않은 도메인", 403);
    }
  } catch {
    return apiError("잘못된 URL", 400);
  }

  try {
    const res = await fetch(url);
    const contentType = res.headers.get("content-type") || "text/plain";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return apiError("파일 로드 실패", 500);
  }
}
