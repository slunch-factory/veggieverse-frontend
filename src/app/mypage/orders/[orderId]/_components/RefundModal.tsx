"use client";

import { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { refundStoreOrder, StorePaymentError } from "@/lib/api/store-payment";
import type { StoreOrderDetailResponse } from "@/lib/api/store";

interface Props {
  orderDbId: number;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onRefunded: (updated: StoreOrderDetailResponse) => void;
}

const MIN_REASON = 5;
const MAX_REASON = 200;

/** BE 응답을 사용자 친화 메시지로 매핑. raw message는 노출하지 않음. */
function toUserFacingError(err: unknown): string {
  if (err instanceof StorePaymentError) {
    const status = err.status;
    if (status === 401) return "로그인이 만료되었습니다. 다시 로그인 후 시도해주세요.";
    if (status === 403) return "이 주문을 환불할 권한이 없습니다.";
    if (status === 404) return "주문 정보를 찾을 수 없습니다.";
    if (status === 409) return "이미 환불되었거나 환불할 수 없는 상태의 주문입니다.";
    if (status === 410) return "환불 가능 기간이 지났습니다.";
    if (status === 422) return "현재 주문 상태에서는 환불을 처리할 수 없습니다.";
    if (status >= 500) return "일시적인 오류로 환불 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
    return "환불 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";
  }
  return "환불 요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export function RefundModal({ orderDbId, amount, isOpen, onClose, onRefunded }: Props) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // ESC로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= MIN_REASON && trimmed.length <= MAX_REASON && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await refundStoreOrder(orderDbId, { reason: trimmed });
      onRefunded(updated);
    } catch (err) {
      console.error("[refund] 실패:", err);
      setError(toUserFacingError(err));
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      onClick={() => {
        if (!submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-modal-title"
    >
      <div
        className="w-full max-w-[440px] flex flex-col"
        style={{
          background: "var(--bg-white)",
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-btn)",
          maxHeight: "calc(100vh - 32px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <header
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--ink)" }}
        >
          <h2 id="refund-modal-title" className="t-h3" style={{ color: "var(--ink)" }}>
            환불 요청
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="닫기"
            className="cursor-pointer"
            style={{ background: "transparent", border: "none", padding: 4 }}
          >
            <X size={18} color="var(--ink)" />
          </button>
        </header>

        {/* 본문 */}
        <div className="px-5 py-5 flex flex-col gap-4 overflow-y-auto">
          <div
            className="p-3 flex flex-col gap-1"
            style={{
              background: "var(--bg-pale)",
              borderRadius: "var(--r-btn)",
              border: "1px solid var(--neutral-stone)",
            }}
          >
            <p className="t-caption" style={{ color: "var(--ink-light)" }}>환불 예정 금액</p>
            <p className="t-h3" style={{ color: "var(--ink)" }}>
              {amount.toLocaleString()}원
            </p>
            <p className="t-caption mt-1" style={{ color: "var(--ink-light)" }}>
              전액 환불만 지원됩니다. 결제 수단으로 환불 처리됩니다.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="t-small" style={{ color: "var(--ink)" }}>
              환불 사유
              <span className="ml-1" style={{ color: "var(--alert-red)" }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              maxLength={MAX_REASON}
              rows={4}
              placeholder={`환불 사유를 ${MIN_REASON}자 이상 입력해주세요`}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 13,
                color: "var(--ink)",
                background: "var(--bg-white)",
                border: "1px solid var(--neutral-stone)",
                borderRadius: "var(--r-btn)",
                outline: "none",
                resize: "vertical",
                minHeight: 96,
              }}
            />
            <div className="flex justify-end">
              <span className="t-caption" style={{ color: "var(--ink-light)" }}>
                {trimmed.length}/{MAX_REASON}
              </span>
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 p-3"
              style={{
                background: "rgba(220, 38, 38, 0.06)",
                border: "1px solid var(--alert-red)",
                borderRadius: "var(--r-btn)",
              }}
            >
              <AlertCircle
                size={16}
                color="var(--alert-red)"
                className="flex-shrink-0 mt-0.5"
              />
              <p className="t-small" style={{ color: "var(--alert-red)" }}>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <footer
          className="flex gap-2 px-5 py-4"
          style={{ borderTop: "1px solid var(--neutral-stone)" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-ghost btn-md flex-1"
            style={{ border: "1px solid var(--ink)" }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn btn-dark btn-md flex-1"
          >
            {submitting ? "처리 중..." : "환불 요청"}
          </button>
        </footer>
      </div>
    </div>
  );
}
