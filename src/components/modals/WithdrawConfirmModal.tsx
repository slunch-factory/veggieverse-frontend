"use client";

import { HeartCrack } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface WithdrawConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** "탈퇴하기" 확정 시 호출 — deleteAccount() + 로그아웃/홈 redirect 수행. */
  onConfirm: () => void;
  /** 탈퇴 처리 중이면 버튼을 비활성화하고 진행 상태를 표시. */
  loading?: boolean;
}

/**
 * 회원 탈퇴 확인 모달 — "정말 슬런치 팩토리를 떠나시나요?".
 *
 * 확정 시 부모의 onConfirm이 deleteAccount() API(DELETE /users/profile)를 호출하고
 * 성공하면 Supabase 세션 종료 + 홈 redirect를 수행한다.
 */
export function WithdrawConfirmModal({ isOpen, onClose, onConfirm, loading = false }: WithdrawConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="withdraw-confirm-title"
      zIndex={200}
      closeOnEsc={!loading}
      closeOnBackdropClick={!loading}
      className="w-full max-w-[340px] mx-[16px] text-center"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-modal, 16px)",
        padding: "32px 24px",
      }}
    >
      <span
        className="mx-auto mb-4 flex items-center justify-center"
        style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-pale)" }}
      >
        <HeartCrack size={26} color="var(--alert-red)" />
      </span>

      <p id="withdraw-confirm-title" className="t-body" style={{ color: "var(--ink)", lineHeight: 1.5 }}>
        정말 슬런치 팩토리를 떠나시나요?
      </p>
      <p className="t-small mt-2" style={{ color: "var(--ink-light)", lineHeight: 1.6 }}>
        탈퇴 신청 후 <strong>15일이 지나면</strong> 구독·주문 내역, 배지,<br />
        관심상품 등 모든 정보가 완전히 삭제돼요.<br />
        그 전에 다시 로그인하면 복구할 수 있어요.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 t-small"
          style={{
            padding: 12,
            color: "var(--ink)",
            background: "var(--point)",
            border: "1px solid var(--ink)",
            borderRadius: "var(--r-btn)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
          }}
        >
          더 둘러볼게요
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 t-small"
          style={{
            padding: 12,
            color: "var(--alert-red)",
            background: "transparent",
            border: "1px solid var(--alert-red)",
            borderRadius: "var(--r-btn)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "처리 중..." : "탈퇴하기"}
        </button>
      </div>
    </Modal>
  );
}
