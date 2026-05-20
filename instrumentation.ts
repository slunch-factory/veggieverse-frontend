import * as Sentry from "@sentry/nextjs";

/**
 * Next.js가 server boot 시점에 호출. NEXT_RUNTIME에 따라 해당 runtime의
 * sentry.*.config 모듈을 dynamic import 하여 Sentry.init을 트리거한다.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/** Next.js 15+의 server-side React 에러를 자동으로 Sentry로 전송. */
export const onRequestError = Sentry.captureRequestError;
