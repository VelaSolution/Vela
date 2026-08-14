/**
 * Rate Limiter — Upstash Redis 기반 (env 없으면 in-memory 폴백)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitOptions {
  /** 고유 식별자 (엔드포인트별 분리) */
  key: string;
  /** 윈도우당 최대 요청 수 */
  limit: number;
  /** 윈도우 크기 (ms), 기본 60초 */
  windowMs?: number;
}

// ── Redis 기반 (프로덕션) ──

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const limiters = new Map<string, Ratelimit>();

function getRedisLimiter({ key, limit, windowMs = 60_000 }: RateLimitOptions) {
  const cacheKey = `${key}:${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    const windowSec = `${Math.ceil(windowMs / 1000)} s` as const;
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, windowSec as `${number} s`),
      prefix: `vela:rl:${key}`,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ── In-memory ���백 (개발 환경) ──

interface MemEntry { count: number; resetAt: number }
const memStores = new Map<string, Map<string, MemEntry>>();

function checkMemory(
  ip: string,
  { key, limit, windowMs = 60_000 }: RateLimitOptions
): { ok: boolean; remaining: number } {
  if (!memStores.has(key)) memStores.set(key, new Map());
  const store = memStores.get(key)!;
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

// ── 공개 API ──

export async function checkRateLimit(
  ip: string,
  opts: RateLimitOptions
): Promise<{ ok: boolean; remaining: number }> {
  if (hasRedis) {
    const limiter = getRedisLimiter(opts);
    const { success, remaining } = await limiter.limit(`${opts.key}:${ip}`);
    return { ok: success, remaining };
  }
  return checkMemory(ip, opts);
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
