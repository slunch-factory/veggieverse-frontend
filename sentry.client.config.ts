// import * as Sentry from "@sentry/nextjs";

// Sentry.init({
//     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, // Sentry 프로젝트의 고유 키로, 에러 데이터를 전송하는 데 사용됩니다.
//     tracesSampleRate: 0.2, // 트랜잭션 데이터를 샘플링하는 비율을 설정합니다. 1.0은 100% 샘플링을 의미합니다.
//     replaysSessionSampleRate: 0.1, // 세션 리플레이를 캡처할 확률을 설정합니다. 0.1은 10%의 세션을 캡처합니다.
//     replaysOnErrorSampleRate: 1.0, // 에러 발생 시 리플레이를 캡처할 확률을 설정합니다. 1.0은 에러가 발생한 모든 세션을 캡처합니다.

//     integrations: [
//         Sentry.replayIntegration({
//         // replay 를 이용할 수 있습니다. (사용자 추적)
//         maskAllText: true,
//         blockAllMedia: true,
//         }),
//         Sentry.breadcrumbsIntegration({
//         console: true, // 콘솔 로그를 자동으로 Breadcrumbs에 기록하도록 설정합니다.
//         }),
//         Sentry.browserTracingIntegration(), // 브라우저에서의 성능 추적을 위한 통합을 활성화합니다.
//     ],
// });