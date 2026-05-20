"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

/**
 * "유령 로그인" 방지 글로벌 가드.
 *
 * 시나리오: 카카오 OAuth로 Supabase 세션은 생겼지만 step2(프로필 입력)에서 이탈하면
 * 백엔드 자사몰 users 레코드가 없는 상태로 메인을 떠돌게 된다. 이 상태에서 마이페이지/카트/주문
 * API를 호출하면 404가 나서 화면이 깨진다.
 *
 * 해결: profileStatus === "incomplete"일 때 회원가입 step2로 강제 redirect.
 * 단, /signup·/auth/* 자체에서는 가입을 마저 진행해야 하므로 예외.
 *
 * "error" 상태는 일시적일 수 있어 차단하지 않는다 — 다음 probe 결과를 기다린다.
 */
const ALLOWED_PATH_PREFIXES = ["/signup", "/auth", "/api"];

function isAllowedPath(pathname: string) {
  return ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function ProfileGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { profileStatus, isLoadingSession } = useUser();

  useEffect(() => {
    if (isLoadingSession) return;
    if (profileStatus !== "incomplete") return;
    if (isAllowedPath(pathname)) return;
    router.replace("/signup?step=2");
  }, [profileStatus, pathname, isLoadingSession, router]);

  return null;
}
