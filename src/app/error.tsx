"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorView } from "@/components/ErrorView";

/**
 * 루트 Error Boundary — 레이아웃 하위 페이지에서 던져진 에러를 잡는다.
 * (레이아웃 자체가 깨진 경우는 global-error.tsx가 담당)
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorView reset={reset} digest={error.digest} />;
}
