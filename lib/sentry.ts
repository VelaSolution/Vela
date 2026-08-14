import * as Sentry from "@sentry/nextjs";

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("[VELA Error]", error.message, context);
  }
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[VELA ${level}]`, message);
  }
}
