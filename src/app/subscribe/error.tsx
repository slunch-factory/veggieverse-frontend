"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorView } from "@/components/ErrorView";

/** 구독 식단 구성·주문 화면 Error Boundary (하위 /subscribe/order 포함). */
export default function SubscribeError({
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
    <ErrorView
      title="식단 화면을 불러오지 못했습니다"
      description="결제는 진행되지 않았습니다. 다시 시도해 주세요."
      reset={reset}
      homeHref="/subscribe"
      homeLabel="구독 식단으로 돌아가기"
      digest={error.digest}
    />
  );
}
