"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  issueSubscriptionBillingKey,
  chargeSubscriptionOrder,
  PAYMENT_RESULT_KEY,
  SubscriptionPaymentError,
} from "@/lib/api/payment";

/**
 * Toss 빌링(자동결제) 등록 성공 후 리다이렉트되는 콜백.
 * 쿼리(orderId + Toss가 붙여준 authKey·customerKey)로
 *   빌링키 발급 → 1회차 결제(charge) → 완료 페이지 이동을 수행한다.
 */
export function BillingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const didRun = useRef(false);

  const orderId = searchParams.get("orderId");
  const customerKey = searchParams.get("customerKey");
  const authKey = searchParams.get("authKey");
  const paramsOk = Boolean(orderId && customerKey && authKey);

  const runBilling = async () => {
    if (!orderId || !customerKey || !authKey) {
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      setRetryable(false);
      return;
    }
    setErrorMsg(null);
    try {
      // [3단계] 빌링키 발급 → [4단계] 1회차 결제
      await issueSubscriptionBillingKey({ authKey, customerKey });
      const result = await chargeSubscriptionOrder(orderId);
      sessionStorage.setItem(PAYMENT_RESULT_KEY, JSON.stringify(result));
      router.replace("/subscribe/order/complete");
    } catch (err) {
      console.error("[subscribe/order/billing] 빌링/charge 실패:", err);
      const message =
        err instanceof SubscriptionPaymentError
          ? err.message
          : "결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      // 일시적 오류·거절은 동일 화면에서 재시도 가능
      const canRetry =
        err instanceof SubscriptionPaymentError
          ? err.code === "Retryable" || err.code === "Rejected"
          : true;
      setErrorMsg(message);
      setRetryable(canRetry);
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void runBilling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!errorMsg) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg-pale)" }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--ink)" }} />
        <p className="t-body" style={{ color: "var(--ink)" }}>구독 결제를 확인하고 있습니다…</p>
        <p className="t-caption" style={{ color: "var(--ink-light)" }}>
          창을 닫지 말고 잠시만 기다려주세요.
        </p>
      </div>
    );
  }

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
          <AlertTriangle size={26} strokeWidth={2.2} color="var(--ink)" />
        </div>

        <h1 className="t-h2 mb-2" style={{ color: "var(--ink)" }}>
          결제를 완료하지 못했습니다
        </h1>
        <p className="t-small mt-2" style={{ color: "var(--ink-light)" }}>
          {errorMsg}
        </p>

        <div className="flex flex-col gap-3 mt-8">
          {retryable && paramsOk && (
            <button
              type="button"
              onClick={() => void runBilling()}
              className="btn btn-dark btn-lg w-full"
            >
              다시 시도
            </button>
          )}
          <Link href="/subscribe/order" className="btn btn-dark btn-lg w-full">
            주문 다시 시작하기
          </Link>
          <Link
            href="/subscribe"
            className="btn btn-ghost btn-lg w-full"
            style={{ border: "1px solid var(--ink)" }}
          >
            구독 식단으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
