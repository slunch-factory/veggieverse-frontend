"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * 최상위 Error Boundary — 루트 레이아웃이 렌더 중 깨진 경우만 사용.
 * 이 컴포넌트는 layout을 대체하므로 직접 <html>/<body>를 렌더해야 하고,
 * globals.css(디자인 토큰)가 로드되지 않으므로 색상은 인라인 리터럴로 지정한다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body style={{ margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fcfaf8",
            fontFamily:
              "-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic','Segoe UI',Roboto,sans-serif",
            padding: "24px",
          }}
        >
          <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
            <h1
              style={{
                margin: "0 0 12px 0",
                fontSize: 22,
                fontWeight: 700,
                color: "#250a00",
              }}
            >
              일시적인 오류가 발생했습니다
            </h1>
            <p
              style={{
                margin: "0 0 28px 0",
                fontSize: 14,
                lineHeight: 1.7,
                color: "#6e5035",
              }}
            >
              페이지를 불러오지 못했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-block",
                padding: "13px 32px",
                fontSize: 15,
                fontWeight: 700,
                color: "#dcfd4a",
                background: "#250a00",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              다시 시도
            </button>
            {error.digest && (
              <p style={{ marginTop: 24, fontSize: 12, color: "#b0a89f" }}>
                오류 코드: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
