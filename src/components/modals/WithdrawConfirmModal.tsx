"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { HeartCrack } from "lucide-react";

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** "탈퇴하기" 확정 시 호출. 회원탈퇴 API(#60) 연동 전까지는 부모가 안내 처리. */
  onConfirm: () => void;
}

/**
 * 회원 탈퇴 확인 모달 — "정말 슬런치 팩토리를 떠나시나요?".
 *
 * NOTE: 회원탈퇴 백엔드 API는 아직 미구현(이슈 #60). 현재는 확인 UX만 제공하고
 * 실제 삭제는 onConfirm 콜백에서 안내(준비 중)로 처리한다. API 준비되면
 * onConfirm 내부에서 deleteAccount() 호출 + 로그아웃/홈 redirect로 교체.
 */
export function WithdrawConfirmModal({ isOpen, onClose, onConfirm }: WithdrawConfirmModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  // 오버레이를 document.body에 portal — <main>(z-0 스태킹 컨텍스트)에 갇혀
  // 헤더(z-50)/푸터 위로 못 덮는 문제 방지.
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="w-full max-w-[340px] mx-[16px] text-center"
        style={{
          background: "var(--bg-white)",
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-modal, 16px)",
          padding: "32px 24px",
        }}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      >
        <span
          className="mx-auto mb-4 flex items-center justify-center"
          style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-pale)" }}
        >
          <HeartCrack size={26} color="var(--alert-red)" />
        </span>

        <p className="t-body" style={{ color: "var(--ink)", lineHeight: 1.5 }}>
          정말 슬런치 팩토리를 떠나시나요?
        </p>
        <p className="t-small mt-2" style={{ color: "var(--ink-light)", lineHeight: 1.6 }}>
          탈퇴하시면 구독·주문 내역, 배지, 관심상품 등<br />
          모든 정보가 삭제되며 복구할 수 없어요.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 t-small"
            style={{
              padding: 12,
              color: "var(--ink)",
              background: "var(--point)",
              border: "1px solid var(--ink)",
              borderRadius: "var(--r-btn)",
              cursor: "pointer",
            }}
          >
            더 둘러볼게요
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 t-small"
            style={{
              padding: 12,
              color: "var(--alert-red)",
              background: "transparent",
              border: "1px solid var(--alert-red)",
              borderRadius: "var(--r-btn)",
              cursor: "pointer",
            }}
          >
            탈퇴하기
          </button>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
