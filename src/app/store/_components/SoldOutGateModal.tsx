"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { SOLD_OUT_CODE, grantSoldOutAccess } from "../_lib/soldOutAccess";

/**
 * Sold Out 상품 접근용 보안 코드 모달.
 * - 코드가 맞으면 grantSoldOutAccess()로 기록하고 onUnlock() 호출.
 * - onClose가 있으면 우측 상단 X / 배경 클릭으로 닫을 수 있다(닫기 동작은 호출부가 정의).
 */
export function SoldOutGateModal({
  open,
  onClose,
  onUnlock,
}: {
  open: boolean;
  onClose?: () => void;
  onUnlock: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim() === SOLD_OUT_CODE) {
      grantSoldOutAccess();
      setCode("");
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(37,10,0,0.55)" }}
      onClick={(e) => {
        // 카드 onClick 등으로 버블링되지 않도록 차단
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className="w-full max-w-[380px] bg-white border border-black rounded-[16px] px-7 py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="t-h3" style={{ color: "var(--ink)" }}>
            확인이 필요한 상품이에요
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="cursor-pointer"
              style={{ background: "none", border: "none", padding: 4, color: "var(--ink-light)" }}
            >
              <X size={18} />
            </button>
          )}
        </div>
        <p className="t-small mb-5" style={{ color: "var(--ink-light)" }}>
          준비 중인 상품입니다. 보안 코드를 입력하면 상세 페이지를 확인할 수 있어요.
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            className={`ds-input${error ? " is-error" : ""}`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (error) setError(false);
            }}
            placeholder="보안 코드"
            style={{ height: 48, paddingTop: 0, paddingBottom: 0, letterSpacing: "0.2em" }}
          />
          {error && (
            <p className="ds-input-msg is-error">코드가 올바르지 않습니다.</p>
          )}
          <button type="submit" className="btn btn-dark btn-lg w-full mt-1" disabled={!code.trim()}>
            확인
          </button>
        </form>
      </div>
    </div>
  );
}
