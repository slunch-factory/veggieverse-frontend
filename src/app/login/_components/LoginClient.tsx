"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, signInWithKakaoAction } from "@/app/auth/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Kakao 브랜드 컬러 — 디자인 시스템 외 3rd-party 예외 */
const KAKAO_YELLOW = "#FEE500";
const KAKAO_LABEL = "rgba(0, 0, 0, 0.85)";

/** 오픈 리다이렉트 방지: 같은 사이트 절대경로(`/...`)만 허용. 그 외엔 홈으로. */
function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = Boolean(email.trim() && password.trim());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMessage(null);
    const result = await signInAction({ email, password });
    if (!result.ok) {
      setSubmitting(false);
      setErrorMessage(result.error);
      return;
    }
    // server에서 쿠키는 set됨. client supabase에도 알려 onAuthStateChange 발화 → UserContext 즉시 갱신.
    if (result.session) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.setSession(result.session);
    }
    setSubmitting(false);
    router.push(redirectTo);
  };

  const handleKakaoLogin = async () => {
    setErrorMessage(null);
    const result = await signInWithKakaoAction(redirectTo);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    window.location.href = result.url;
  };

  return (
    <div
      className="flex justify-center items-center"
      style={{
        minHeight: "calc(80vh)",
        background: "var(--bg-pale)",
      }}
    >
      <div className="w-full max-w-[400px] px-4 py-8 sm:py-12">
        <h1 className="t-h2 text-center mb-6 sm:mb-8" style={{ color: "var(--ink)" }}>
          로그인
        </h1>

        <form onSubmit={handleSubmit} className="login-form flex flex-col gap-3">
          <input
            type="email"
            className="ds-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요"
            autoComplete="email"
            inputMode="email"
          />

          <input
            type="password"
            className="ds-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해주세요"
            autoComplete="current-password"
          />

          {errorMessage && (
            <p className="ds-input-msg is-error">{errorMessage}</p>
          )}

          {/* 찾기 링크 */}
          <div
            className="flex justify-end items-center gap-2 mt-1 mb-2"
            style={{ color: "var(--ink-light)" }}
          >
            <Link
              href="/find-password"
              className="t-caption"
              style={{ color: "var(--ink-light)" }}
            >
              비밀번호 찾기
            </Link>
          </div>

          {/* 로그인 / 회원가입 */}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="btn btn-dark btn-lg w-full"
          >
            {submitting ? "처리 중..." : "로그인"}
          </button>

          <Link
            href="/signup"
            className="btn btn-ghost btn-lg w-full"
            style={{ borderColor: "var(--ink)" }}
          >
            회원가입
          </Link>
        </form>

        {/* 간편 로그인 */}
        <div className="mt-8 sm:mt-12">
          <p className="t-h3 text-center mb-4 sm:mb-5" style={{ color: "var(--ink)" }}>
            간편 로그인
          </p>

          <button
            type="button"
            onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-2 cursor-pointer transition-opacity hover:opacity-90"
            style={{
              height: 48,
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
                width: 20,
                height: 20,
                background: KAKAO_LABEL,
                color: KAKAO_YELLOW,
                borderRadius: "50%",
                fontSize: 13,
              }}
              aria-hidden
            >
              K
            </span>
            카카오로 계속하기
          </button>
        </div>
      </div>

      <style>{`
        .login-form .ds-input {
          height: 48px;
          padding-top: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}
