"use client";

import { useEffect } from "react";

const KAKAO_YELLOW = "#FEE500";
const KAKAO_LABEL = "rgba(0, 0, 0, 0.85)";

interface AlreadyRegisteredModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onContinueWithKakao: () => void;
  onGoToLogin: () => void;
}

/**
 * '이미 가입된 이메일' 안내 모달.
 * 카카오 가입자/자사몰 가입자 모두를 안내 — provider 정보 미노출이므로
 * 사용자가 직접 선택할 수 있도록 두 가지 액션을 제공한다.
 */
export function AlreadyRegisteredModal({
  isOpen,
  email,
  onClose,
  onContinueWithKakao,
  onGoToLogin,
}: AlreadyRegisteredModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] mx-[16px] bg-white border border-black rounded-[16px] px-[24px] py-[28px] text-center"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="t-h3 mb-[12px]" style={{ color: "var(--ink)" }}>
          이미 가입된 이메일입니다
        </h2>
        <p
          className="t-small mb-[16px] break-all"
          style={{ color: "var(--ink)", fontWeight: 600 }}
        >
          {email}
        </p>
        <p
          className="t-small mb-[24px] leading-[1.6]"
          style={{ color: "var(--ink-light)" }}
        >
          카카오로 가입하셨다면 <strong style={{ color: "var(--ink)" }}>‘카카오로 계속하기’</strong>를,
          <br />
          이메일로 가입하셨다면{" "}
          <strong style={{ color: "var(--ink)" }}>‘로그인 페이지로 이동’</strong>을 선택해 주세요.
        </p>

        <div className="flex flex-col gap-[8px]">
          <button
            type="button"
            onClick={onContinueWithKakao}
            className="w-full flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
            style={{
              height: 44,
              background: KAKAO_YELLOW,
              color: KAKAO_LABEL,
              border: "none",
              borderRadius: "var(--r-btn)",
              fontSize: 14,
            }}
          >
            <span
              className="inline-flex items-center justify-center"
              style={{
                width: 18,
                height: 18,
                background: KAKAO_LABEL,
                color: KAKAO_YELLOW,
                borderRadius: "50%",
                fontSize: 12,
              }}
              aria-hidden
            >
              K
            </span>
            카카오로 계속하기
          </button>

          <button
            type="button"
            onClick={onGoToLogin}
            className="btn btn-ghost w-full"
            style={{ height: 44, border: "1px solid var(--ink)", fontSize: 14 }}
          >
            로그인 페이지로 이동
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer mt-[4px] t-small"
            style={{ color: "var(--ink-light)", textDecoration: "underline" }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
