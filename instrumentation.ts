import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: Parameters<
  typeof Sentry.captureRequestError
>[0] extends infer T
  ? (...args: T extends (...a: infer A) => unknown ? A : never) => void
  : never = (...args) => {
  Sentry.captureRequestError(...(args as Parameters<typeof Sentry.captureRequestError>));
};
