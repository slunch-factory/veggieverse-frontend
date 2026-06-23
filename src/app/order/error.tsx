"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorView } from "@/components/ErrorView";

/** 스토어 주문·결제 화면 Error Boundary. */
export default function OrderError({
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
      title="주문 화면을 불러오지 못했습니다"
      description="결제는 진행되지 않았습니다. 다시 시도하거나 장바구니로 돌아가 주세요."
      reset={reset}
      homeHref="/cart"
      homeLabel="장바구니로 돌아가기"
      digest={error.digest}
    />
  );
}
