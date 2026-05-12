"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api/client";

/**
 * Supabase OAuth(카카오 등) 리다이렉트 콜백.
 * - PKCE 흐름: URL ?code=... → exchangeCodeForSession 으로 세션 교환
 * - 암묵 흐름: URL #access_token=... → SDK가 detectSessionInUrl 옵션으로 자동 처리
 * 어느 쪽이든 세션이 자리잡으면 홈으로 이동.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        let userEmail: string | null = null;
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          userEmail = data.session?.user?.email ?? null;
        } else {
          // 암묵 흐름은 detectSessionInUrl=true 로 SDK가 처리.
          const { data } = await supabase.auth.getSession();
          userEmail = data.session?.user?.email ?? null;
        }

        if (cancelled) return;

        // 동일 email 계정 통합: 이미 자사몰 계정이 있으면 비밀번호 연동 모드로 이동
        if (userEmail) {
          const checkRes = await apiFetch(
            `/api/v1/veggieverse/users/email-check?email=${encodeURIComponent(userEmail)}`,
            { auth: "auto" },
          );
          if (checkRes.ok) {
            router.replace("/signup?link=1");
            return;
          }
        }

        // 백엔드 프로필 존재 여부로 신규/기존 유저 구분
        const profileRes = await apiFetch("/api/v1/veggieverse/users/profile", {
          auth: "required",
        });
        router.replace(profileRes.ok ? "/" : "/signup");
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "로그인 처리 중 오류가 발생했습니다.");
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div
      className="flex justify-center items-center"
      style={{ minHeight: "60vh", background: "var(--bg-pale)" }}
    >
      <div className="text-center">
        {errorMessage ? (
          <>
            <p className="t-body" style={{ color: "var(--alert-red)" }}>
              로그인에 실패했습니다.
            </p>
            <p className="t-small mt-2" style={{ color: "var(--ink-light)" }}>
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="btn btn-ghost btn-md mt-6"
              style={{ border: "1px solid var(--ink)" }}
            >
              로그인 페이지로 이동
            </button>
          </>
        ) : (
          <p className="t-body" style={{ color: "var(--ink)" }}>
            로그인 처리 중입니다...
          </p>
        )}
      </div>
    </div>
  );
}
