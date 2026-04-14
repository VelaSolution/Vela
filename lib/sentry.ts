/**
 * Sentry Error Monitoring — scaffold
 *
 * To activate:
 * 1. npm install @sentry/nextjs
 * 2. Create Sentry account at sentry.io
 * 3. Get DSN and add to env: NEXT_PUBLIC_SENTRY_DSN
 * 4. Uncomment the initialization below
 *
 * For now, errors are logged to console.
 */

export function captureError(error: Error, context?: Record<string, unknown>) {
  // TODO: Replace with Sentry.captureException when activated
  console.error("[VELA Error]", error.message, context);

  // Uncomment after Sentry setup:
  // if (typeof window !== "undefined" && (window as any).Sentry) {
  //   (window as any).Sentry.captureException(error, { extra: context });
  // }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  console.log(`[VELA ${level}]`, message);
}
