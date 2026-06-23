"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * 라우트 Error Boundary(error.tsx)들이 공유하는 폴백 UI.
 * store 결제 실패 화면(FailClient)과 동일한 톤 — 원형 아이콘 + 제목 + 안내 + 액션.
 */
export function ErrorView({
  title = "문제가 발생했습니다",
  description = "잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요.",
  reset,
  resetLabel = "다시 시도",
  homeHref = "/",
  homeLabel = "홈으로",
  digest,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  resetLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  digest?: string;
}) {
  return (
    <div
      className="min-h-[60vh] flex items-start justify-center"
      style={{ background: "var(--bg-pale)" }}
    >
      <div className="w-full max-w-[520px] px-5 pt-16 pb-12 text-center">
        <div
          className="inline-flex items-center justify-center mb-5"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--bg-white)",
            border: "1px solid var(--ink)",
          }}
        >
          <AlertTriangle size={26} strokeWidth={2.2} color="var(--ink)" />
        </div>

        <h1 className="t-h2 mb-2" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
        <p className="t-small mt-2" style={{ color: "var(--ink-light)" }}>
          {description}
        </p>

        <div className="flex flex-col gap-3 mt-8">
          {reset && (
            <button
              type="button"
              onClick={reset}
              className="btn btn-dark btn-lg w-full"
            >
              {resetLabel}
            </button>
          )}
          <Link
            href={homeHref}
            className="btn btn-ghost btn-lg w-full"
            style={{ border: "1px solid var(--ink)" }}
          >
            {homeLabel}
          </Link>
        </div>

        {digest && (
          <p className="t-caption mt-6" style={{ color: "var(--neutral-stone)" }}>
            오류 코드: {digest}
          </p>
        )}
      </div>
    </div>
  );
}
