"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorView } from "@/components/ErrorView";

/** 마이페이지(프로필·주문·구독 관리) Error Boundary. */
export default function MypageError({
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
      title="페이지를 불러오지 못했습니다"
      description="잠시 후 다시 시도해 주세요. 문제가 계속되면 다시 로그인해 주세요."
      reset={reset}
      homeHref="/mypage"
      homeLabel="마이페이지 홈"
      digest={error.digest}
    />
  );
}
