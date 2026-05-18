"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { STORE_ORDER_SNAPSHOT_KEY } from "@/app/order/_components/OrderClient";

const TOSS_ERROR_CODE_MAP: Record<string, { title: string; hint?: string }> = {
  USER_CANCEL: {
    title: "결제를 취소하셨어요",
    hint: "다시 결제를 진행하거나 장바구니로 돌아갈 수 있습니다.",
  },
  PAY_PROCESS_CANCELED: {
    title: "결제가 취소되었습니다",
  },
  PAY_PROCESS_ABORTED: {
    title: "결제가 중단되었습니다",
  },
  REJECT_CARD_COMPANY: {
    title: "카드사에서 결제가 거절되었습니다",
    hint: "다른 결제수단으로 다시 시도해주세요.",
  },
  EXCEED_MAX_DAILY_PAYMENT_COUNT: {
    title: "일일 결제 한도를 초과했습니다",
    hint: "내일 다시 시도하거나 다른 결제수단을 사용해주세요.",
  },
  NOT_AVAILABLE_BANK: {
    title: "은행 점검 시간입니다",
    hint: "잠시 후 다시 시도해주세요.",
  },
};

export function FailClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const message = searchParams.get("message") ?? "결제가 완료되지 못했습니다.";
  const orderId = searchParams.get("orderId") ?? "";

  // 실패 시 결제 컨텍스트 스냅샷은 보관할 의미가 없음
  useEffect(() => {
    sessionStorage.removeItem(STORE_ORDER_SNAPSHOT_KEY);
  }, []);

  const mapped = TOSS_ERROR_CODE_MAP[code];
  const title = mapped?.title ?? "결제가 완료되지 못했습니다";

  return (
    <div
      className="min-h-screen flex items-start justify-center"
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
          <XCircle size={26} strokeWidth={2.2} color="var(--ink)" />
        </div>

        <h1 className="t-h2 mb-2" style={{ color: "var(--ink)" }}>
          {title}
        </h1>
        <p className="t-small mt-2" style={{ color: "var(--ink-light)" }}>
          {message}
        </p>
        {mapped?.hint && (
          <p className="t-caption mt-2" style={{ color: "var(--ink-light)" }}>
            {mapped.hint}
          </p>
        )}

        {(code || orderId) && (
          <dl
            className="mt-6 mx-auto text-left inline-block"
            style={{
              padding: "12px 16px",
              border: "1px solid var(--neutral-stone)",
              borderRadius: "var(--r-btn)",
              background: "var(--bg-white)",
            }}
          >
            {code && (
              <div className="flex gap-2 t-caption">
                <dt style={{ color: "var(--ink-light)" }}>코드</dt>
                <dd style={{ color: "var(--ink)" }}>{code}</dd>
              </div>
            )}
            {orderId && (
              <div className="flex gap-2 t-caption mt-1">
                <dt style={{ color: "var(--ink-light)" }}>주문번호</dt>
                <dd style={{ color: "var(--ink)" }}>{orderId}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="flex flex-col gap-3 mt-8">
          <Link href="/order" className="btn btn-dark btn-lg w-full">
            다시 결제하기
          </Link>
          <Link
            href="/cart"
            className="btn btn-ghost btn-lg w-full"
            style={{ border: "1px solid var(--ink)" }}
          >
            장바구니로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
