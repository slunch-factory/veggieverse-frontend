"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { signInAction, signInWithKakaoAction } from "@/app/auth/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

const KAKAO_YELLOW = "#FEE500";
const KAKAO_LABEL = "rgba(0, 0, 0, 0.85)";

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSubmit = Boolean(email.trim() && password.trim()) && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMessage(null);
    const result = await signInAction({ email, password });
    if (!result.ok) {
      setSubmitting(false);
      setErrorMessage(result.error);
      return;
    }
    // server에서 쿠키는 이미 set됨. client supabase에도 명시적으로 알려 onAuthStateChange 발화 → UserContext 즉시 갱신.
    if (result.session) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.setSession(result.session);
    }
    setSubmitting(false);
    // 모달은 현재 페이지를 유지 — 모달 닫고 RSC 데이터만 재요청.
    onLoginSuccess?.();
    onClose();
    router.refresh();
  };

  const handleKakaoLogin = async () => {
    setErrorMessage(null);
    const next =
      typeof window !== "undefined" ? window.location.pathname : "/";
    const result = await signInWithKakaoAction(next);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    window.location.href = result.url;
  };

  const navigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="sl-modal-overlay login-modal-overlay" onClick={onClose}>
      <div
        className="login-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="login-modal-close"
          aria-label="닫기"
        >
          <X size={20} strokeWidth={1.5} color="var(--ink)" />
        </button>

        <h2 className="t-h2 text-center mb-6" style={{ color: "var(--ink)" }}>
          로그인
        </h2>

        <form onSubmit={handleSubmit} className="login-form flex flex-col gap-3">
          <input
            type="email"
            className="ds-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            autoComplete="email"
            inputMode="email"
          />

          <input
            type="password"
            className="ds-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
          />

          {errorMessage && (
            <p className="ds-input-msg is-error">{errorMessage}</p>
          )}

          <div className="flex items-center justify-between mt-1 mb-2">
            <label className="chk-wrap">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="t-small" style={{ color: "var(--ink)" }}>
                이메일 저장
              </span>
            </label>
            <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>
              보안접속
            </span>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="btn btn-dark btn-lg w-full"
          >
            {submitting ? "처리 중..." : "로그인"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-5 mb-5">
          <button
            type="button"
            onClick={() => navigate("/find-password")}
            className="t-caption login-link"
          >
            비밀번호 찾기
          </button>
          <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>
            |
          </span>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="t-caption login-link"
          >
            회원가입
          </button>
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="login-kakao"
        >
          <span className="login-kakao-icon" aria-hidden>
            K
          </span>
          카카오로 계속하기
        </button>
      </div>

      <style>{`
        .login-modal-overlay {
          z-index: 100;
          padding: 16px;
        }
        .login-modal {
          width: 100%;
          max-width: 400px;
          background: var(--bg-white);
          border: 1px solid var(--ink);
          border-radius: var(--r-btn);
          padding: 32px 28px;
          position: relative;
        }
        .login-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .login-form .ds-input {
          height: 48px;
          padding-top: 0;
          padding-bottom: 0;
        }
        .login-link {
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--ink-light);
          padding: 0;
        }
        .login-link:hover {
          color: var(--ink);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .login-kakao {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: ${KAKAO_YELLOW};
          color: ${KAKAO_LABEL};
          border: none;
          border-radius: var(--r-btn);
          font-size: 14px;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }
        .login-kakao:hover { opacity: 0.9; }
        .login-kakao-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: ${KAKAO_LABEL};
          color: ${KAKAO_YELLOW};
          border-radius: 50%;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
