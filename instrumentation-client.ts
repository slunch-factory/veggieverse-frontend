import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // production에서는 0.1~0.2로 낮춰 비용 폭주를 방지하는 것을 권장.
  tracesSampleRate: 1.0,

  // 세션 리플레이 — 평상시 10%, 에러 발생 세션은 100% 캡처.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
});

/** App Router의 클라이언트 라우터 전환을 트랜잭션으로 추적. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
