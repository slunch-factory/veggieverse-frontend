"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api/client";

type Phase = "exchanging" | "checking" | "routing";

const PHASE_MESSAGES: Record<Phase, { main: string; sub: string }> = {
  exchanging: {
    main: "카카오 계정으로 로그인 중이에요",
    sub: "잠시만 기다려 주세요",
  },
  checking: {
    main: "계정 정보를 확인하고 있어요",
    sub: "거의 다 됐어요",
  },
  routing: {
    main: "준비가 끝났어요",
    sub: "곧 이동합니다",
  },
};

/**
 * Supabase OAuth(카카오 등) 리다이렉트 콜백.
 * - PKCE 흐름: URL ?code=... → exchangeCodeForSession 으로 세션 교환
 * - 암묵 흐름: URL #access_token=... → SDK가 detectSessionInUrl 옵션으로 자동 처리
 * 어느 쪽이든 세션이 자리잡으면 홈으로 이동.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("exchanging");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        let userEmail: string | null = null;
        let hasEmailIdentity = false;
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          userEmail = data.session?.user?.email ?? null;
          hasEmailIdentity = Boolean(
            data.session?.user?.identities?.some((i) => i.provider === "email"),
          );
        } else {
          // 암묵 흐름은 detectSessionInUrl=true 로 SDK가 처리.
          const { data } = await supabase.auth.getSession();
          userEmail = data.session?.user?.email ?? null;
          hasEmailIdentity = Boolean(
            data.session?.user?.identities?.some((i) => i.provider === "email"),
          );
        }

        if (cancelled) return;
        setPhase("checking");

        // 이미 비밀번호 연동까지 완료된 사용자(identities에 email 있음)는
        // link 페이지를 건너뛰고 프로필 유무로 분기 — 비밀번호 변경은 마이페이지에서.
        if (hasEmailIdentity) {
          const profileRes = await apiFetch("/api/v1/veggieverse/users/profile", {
            auth: "required",
          });
          if (cancelled) return;
          setPhase("routing");
          router.replace(profileRes.ok ? "/" : "/signup");
          return;
        }

        // 동일 email 계정 통합: 이미 자사몰 계정이 있으면 비밀번호 연동 모드로 이동
        if (userEmail) {
          const checkRes = await apiFetch(
            `/api/v1/veggieverse/users/email-check?email=${encodeURIComponent(userEmail)}`,
            { auth: "auto" },
          );
          if (cancelled) return;
          if (checkRes.ok) {
            setPhase("routing");
            router.replace("/signup?link=1");
            return;
          }
        }

        // 백엔드 프로필 존재 여부로 신규/기존 유저 구분
        const profileRes = await apiFetch("/api/v1/veggieverse/users/profile", {
          auth: "required",
        });
        if (cancelled) return;
        setPhase("routing");
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

  const { main, sub } = PHASE_MESSAGES[phase];

  return (
    <div
      className="flex justify-center items-center px-4"
      style={{ minHeight: "80vh", background: "var(--bg-pale)" }}
    >
      {errorMessage ? (
        <div
          className="w-full max-w-[360px] bg-white border border-black rounded-[16px] px-[24px] py-[32px] text-center animate-fadeIn"
        >
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
        </div>
      ) : (
        <div
          className="w-full max-w-[360px] bg-white border border-black rounded-[16px] px-[24px] py-[40px] text-center animate-fadeIn"
          role="status"
          aria-live="polite"
        >
          <Loader2
            size={32}
            strokeWidth={1.5}
            className="mx-auto mb-[20px] animate-spin"
            style={{ color: "var(--ink)" }}
          />
          <p key={phase} className="t-body mb-[6px] animate-fadeIn" style={{ color: "var(--ink)" }}>
            {main}
          </p>
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            {sub}
          </p>

          <div
            className="flex items-center justify-center gap-[6px] mt-[24px]"
            aria-hidden
          >
            <PhaseDot active={phase === "exchanging"} done={phase !== "exchanging"} />
            <PhaseDot active={phase === "checking"} done={phase === "routing"} />
            <PhaseDot active={phase === "routing"} done={false} />
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseDot({ active, done }: { active: boolean; done: boolean }) {
  const filled = active || done;
  return (
    <span
      style={{
        width: active ? 18 : 6,
        height: 6,
        borderRadius: 999,
        background: filled ? "var(--ink)" : "var(--neutral-stone)",
        transition: "width 300ms ease, background 300ms ease",
      }}
    />
  );
}
