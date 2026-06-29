"use client";

import { HeartCrack } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface WithdrawalPendingModalProps {
  isOpen: boolean;
  /** 완전 삭제까지 남은 일수. null이면 일수 안내를 생략. */
  daysLeft: number | null;
  /** 복구 처리 중이면 버튼 비활성 + "복구 중..." */
  restoring?: boolean;
  /** [계정 복구하기] */
  onRestore: () => void;
  /** [로그아웃] — 탈퇴 유지 */
  onLogout: () => void;
}

/**
 * 탈퇴 신청(PENDING_DELETION) 계정이 로그인했을 때 뜨는 전역 알림 모달.
 * 며칠 후 완전 삭제되는지 알리고 [계정 복구] / [로그아웃] 중 선택하게 한다.
 * 결정 전까지 닫을 수 없도록(배경 클릭/ESC 닫힘 없음) 처리한다.
 */
export function WithdrawalPendingModal({
  isOpen,
  daysLeft,
  restoring = false,
  onRestore,
  onLogout,
}: WithdrawalPendingModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onLogout}
      labelledBy="withdrawal-pending-title"
      zIndex={200}
      closeOnEsc={false}
      closeOnBackdropClick={false}
      wrapperClassName="px-4"
      className="w-full max-w-[360px] text-center"
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

      <p id="withdrawal-pending-title" className="t-body" style={{ color: "var(--ink)", lineHeight: 1.5 }}>
        탈퇴 신청된 계정이에요
      </p>
      <p className="t-small mt-2" style={{ color: "var(--ink-light)", lineHeight: 1.6 }}>
        {daysLeft !== null ? (
          <>
            <strong style={{ color: "var(--alert-red)" }}>{daysLeft}일 후</strong> 모든 정보가 완전히 삭제돼요.
          </>
        ) : (
          <>유예 기간이 지나면 모든 정보가 완전히 삭제돼요.</>
        )}
        <br />
        지금 복구하면 예전 그대로 다시 이용할 수 있어요.
      </p>

      <div className="mt-6 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onRestore}
          disabled={restoring}
          className="btn btn-dark btn-lg w-full"
          style={{ opacity: restoring ? 0.6 : 1, cursor: restoring ? "not-allowed" : "pointer" }}
        >
          {restoring ? "복구 중..." : "계정 복구하기"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          disabled={restoring}
          className="t-small"
          style={{
            padding: 10,
            color: "var(--neutral-stone)",
            background: "transparent",
            border: "none",
            cursor: restoring ? "not-allowed" : "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          로그아웃
        </button>
      </div>
    </Modal>
  );
}
