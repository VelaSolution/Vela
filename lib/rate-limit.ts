/**
 * 간단한 인메모리 Rate Limiter (Edge Runtime 호환)
 * - 프로덕션에서는 Redis 기반으로 전환 권장
 * - 서버리스 환경에서는 인스턴스별로 독립 동작
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

interface RateLimitOptions {
  /** 고유 식별자 (엔드포인트별 분리) */
  key: string;
  /** 윈도우당 최대 요청 수 */
  limit: number;
  /** 윈도우 크기 (ms), 기본 60초 */
  windowMs?: number;
}

export function checkRateLimit(
  ip: string,
  { key, limit, windowMs = 60_000 }: RateLimitOptions
): { ok: boolean; remaining: number } {
  if (!stores.has(key)) stores.set(key, new Map());
  const store = stores.get(key)!;

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

/** IP 추출 헬퍼 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

/** Rate limit 초과 시 응답 생성 */
export function rateLimitResponse() {
  return new Response(
    JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    }
  );
}
