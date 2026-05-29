"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

/**
 * 주문·결제 화면 진입 인증 가드.
 *
 * - 비로그인(세션 없음) 상태로는 결제 화면을 아예 렌더하지 않고 `/login?redirect=...`로 보낸다.
 *   로그인 후 다시 주문 화면으로 복귀(directBuy 아이템은 sessionStorage에 유지되므로 보존됨).
 * - "incomplete" 프로필은 글로벌 ProfileGate가 /signup?step=2로 처리하므로 여기선 렌더만 보류.
 * - 뒤로가기 등으로 bfcache에서 복원될 때(Toss 결제창 오버레이가 되살아나는 증상) reload하여
 *   결제창 잔재를 제거하고 인증 상태를 다시 검증한다. (useEffect는 bfcache 복원 시 재실행되지 않음)
 */
export function OrderAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, profileStatus, isLoadingSession } = useUser();

  // bfcache 복원 대응 — 되살아난 결제창 제거 + 가드 재실행
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // 미인증 진입 차단
  useEffect(() => {
    if (isLoadingSession || profileStatus === "loading") return; // 세션 확인 중
    if (isAuthenticated) return; // 통과
    if (profileStatus === "incomplete") return; // ProfileGate가 /signup?step=2로 처리
    const qs = searchParams.toString();
    const here = `/order${qs ? `?${qs}` : ""}`;
    router.replace(`/login?redirect=${encodeURIComponent(here)}`);
  }, [isAuthenticated, profileStatus, isLoadingSession, searchParams, router]);

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-pale)" }}
      >
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          로그인 확인 중...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
