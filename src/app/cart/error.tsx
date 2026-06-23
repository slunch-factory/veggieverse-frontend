"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorView } from "@/components/ErrorView";

/** 장바구니 화면 Error Boundary. */
export default function CartError({
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
      title="장바구니를 불러오지 못했습니다"
      description="잠시 후 다시 시도해 주세요."
      reset={reset}
      homeHref="/store"
      homeLabel="스토어 둘러보기"
      digest={error.digest}
    />
  );
}
