"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { getUserProfile, restoreAccount } from "@/lib/api/user";
import { WithdrawalPendingModal } from "@/components/modals/WithdrawalPendingModal";

/** scheduledPurgeAt(ISO)까지 남은 일수 — 음수면 0. */
function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return null;
  return Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
}

/**
 * 탈퇴 신청(PENDING_DELETION) 계정이 로그인하면 전역 알림 모달을 띄운다.
 * 로그인 방식(이메일/카카오/헤더)과 무관하게 로그인 직후 어느 화면에서든 동작한다.
 * 사용자는 [계정 복구](restore) 또는 [로그아웃] 중 선택한다.
 */
export function WithdrawalPendingGate() {
  const { profileStatus, isLoadingSession, signOut, refetchProfile } = useUser();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);

  const isPending = !isLoadingSession && profileStatus === "pending_deletion";

  // 삭제 예정일 조회 — "N일 후 삭제" 표시용. 모달이 열릴 때(pending 전이 시)만 fetch.
  useEffect(() => {
    if (!isPending) return;
    let cancelled = false;
    getUserProfile().then((p) => {
      if (!cancelled) setDaysLeft(daysUntil(p?.scheduledPurgeAt));
    });
    return () => {
      cancelled = true;
    };
  }, [isPending]);

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    const ok = await restoreAccount();
    if (!ok) {
      setRestoring(false);
      // 실패해도 모달은 유지 — 사용자가 다시 시도하거나 로그아웃하도록.
      return;
    }
    // 복구 성공 — probe 재실행 시 complete로 전이되어 모달이 닫힌다.
    refetchProfile();
    setRestoring(false);
  };

  return (
    <WithdrawalPendingModal
      isOpen={isPending}
      daysLeft={daysLeft}
      restoring={restoring}
      onRestore={handleRestore}
      onLogout={() => void signOut()}
    />
  );
}
