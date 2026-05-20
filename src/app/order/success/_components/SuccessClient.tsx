"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle } from "lucide-react";
import { STORE_ORDER_SNAPSHOT_KEY } from "@/app/order/_components/OrderClient";
import {
  confirmStorePayment,
  StorePaymentError,
} from "@/lib/api/store-payment";
import type { StoreOrderDetailResponse } from "@/lib/api/store";
import { useCart } from "@/contexts/CartContext";
import { OrderCompletion } from "./OrderCompletion";

type ConfirmStatus =
  | "loading"
  | "done"
  | "retryable"
  | "expired"
  | "rejected"
  | "mismatch"
  | "unknown";

interface ConfirmFailState {
  status: Exclude<ConfirmStatus, "loading" | "done">;
  message: string;
}

export function SuccessClient() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<ConfirmStatus>("loading");
  const [order, setOrder] = useState<StoreOrderDetailResponse | null>(null);
  const [failState, setFailState] = useState<ConfirmFailState | null>(null);
  const didRun = useRef(false);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amountRaw = searchParams.get("amount");

  const runConfirm = async () => {
    if (!paymentKey || !orderId || !amountRaw) {
      setFailState({ status: "unknown", message: "결제 정보가 올바르지 않습니다." });
      setStatus("unknown");
      return;
    }
    const amount = Number(amountRaw);
    if (!Number.isFinite(amount)) {
      setFailState({ status: "unknown", message: "결제 금액 정보가 올바르지 않습니다." });
      setStatus("unknown");
      return;
    }

    setStatus("loading");
    setFailState(null);

    try {
      const detail = await confirmStorePayment({ paymentKey, orderId, amount });
      sessionStorage.removeItem(STORE_ORDER_SNAPSHOT_KEY);
      clearCart();
      setOrder(detail);
      setStatus("done");
    } catch (err) {
      console.error("[order/success] confirm 실패:", err);
      if (err instanceof StorePaymentError) {
        if (err.code === "PaymentRetryable" || err.status === 503) {
          setFailState({ status: "retryable", message: err.message });
          setStatus("retryable");
        } else if (err.code === "OrderExpired" || err.status === 410) {
          setFailState({ status: "expired", message: err.message });
          setStatus("expired");
          sessionStorage.removeItem(STORE_ORDER_SNAPSHOT_KEY);
        } else if (err.code === "AmountMismatch") {
          setFailState({ status: "mismatch", message: err.message });
          setStatus("mismatch");
          sessionStorage.removeItem(STORE_ORDER_SNAPSHOT_KEY);
        } else {
          setFailState({ status: "rejected", message: err.message });
          setStatus("rejected");
        }
      } else {
        setFailState({
          status: "retryable",
          message:
            err instanceof Error ? err.message : "결제 승인 중 알 수 없는 오류가 발생했습니다.",
        });
        setStatus("retryable");
      }
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void runConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg-pale)" }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--ink)" }} />
        <p className="t-body" style={{ color: "var(--ink)" }}>결제를 확인하고 있습니다…</p>
        <p className="t-caption" style={{ color: "var(--ink-light)" }}>
          창을 닫지 말고 잠시만 기다려주세요.
        </p>
      </div>
    );
  }

  if (status === "done" && order) {
    return <OrderCompletion order={order} />;
  }

  // 실패 분기
  const fs = failState!;
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
          {titleFor(fs.status)}
        </h1>
        <p className="t-small mt-2" style={{ color: "var(--ink-light)" }}>
          {fs.message}
        </p>

        <div className="flex flex-col gap-3 mt-8">
          {fs.status === "retryable" && (
            <button
              type="button"
              onClick={() => void runConfirm()}
              className="btn btn-dark btn-lg w-full"
            >
              다시 시도
            </button>
          )}
          {(fs.status === "expired" || fs.status === "mismatch") && (
            <Link href="/order" className="btn btn-dark btn-lg w-full">
              주문 다시 시작하기
            </Link>
          )}
          {fs.status === "rejected" && (
            <Link href="/order" className="btn btn-dark btn-lg w-full">
              다른 결제수단으로 재시도
            </Link>
          )}
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

function titleFor(status: ConfirmFailState["status"]): string {
  switch (status) {
    case "retryable":
      return "결제 처리가 지연되고 있습니다";
    case "expired":
      return "결제 가능 시간이 만료되었습니다";
    case "mismatch":
      return "주문 정보가 일치하지 않습니다";
    case "rejected":
      return "결제가 거절되었습니다";
    default:
      return "결제를 확인할 수 없습니다";
  }
}
