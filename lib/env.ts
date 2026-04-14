/**
 * 환경변수 검증 — 서버 시작 시 필수 키 누락을 조기에 감지
 *
 * 사용법: 서버 컴포넌트나 API 라우트에서 import 하면 자동으로 검증 실행
 */

const REQUIRED_SERVER_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
] as const;

const OPTIONAL_SERVER_ENV = [
  "TOSS_SECRET_KEY",
  "RESEND_API_KEY",
  "BOK_API_KEY",
  "ADMIN_EMAIL",
] as const;

function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const key of REQUIRED_SERVER_ENV) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of OPTIONAL_SERVER_ENV) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `\n[VELA] 필수 환경변수 누락:\n${missing.map((k) => `  - ${k}`).join("\n")}\n`
    );
    // 런타임에서만 차단 (빌드 시에는 경고만)
    // Vercel 빌드 시 NEXT_PHASE가 설정되므로 이를 기준으로 구분
    const isBuild = process.env.NEXT_PHASE === "phase-production-build";
    if (process.env.NODE_ENV === "production" && !isBuild) {
      throw new Error(`필수 환경변수 누락: ${missing.join(", ")}`);
    }
  }

  if (warnings.length > 0) {
    console.warn(
      `[VELA] 선택 환경변수 미설정 (일부 기능 비활성화): ${warnings.join(", ")}`
    );
  }
}

// 모듈 로드 시 1회 실행
if (typeof process !== "undefined" && process.env) {
  validateEnv();
}

export { REQUIRED_SERVER_ENV, OPTIONAL_SERVER_ENV };
