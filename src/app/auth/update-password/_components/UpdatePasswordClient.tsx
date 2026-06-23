"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { translateSupabaseAuthError } from "@/lib/supabase-errors";

type Status = "checking" | "ready" | "invalid" | "submitting" | "done";

export function UpdatePasswordClient() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // callback이 code→세션 교환을 마친 뒤 이 페이지로 보내므로 recovery 세션이 쿠키에 있어야 한다.
  // 세션이 없으면(링크 만료/직접 접근) 재요청을 안내한다.
  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    });
    return () => {
      active = false;
    };
  }, []);

  const canSubmit =
    status === "ready" && password.length >= 8 && password === confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(translateSupabaseAuthError(updateError.message));
      setStatus("ready");
      return;
    }
    setStatus("done");
  };

  return (
    <div
      className="flex justify-center"
      style={{ minHeight: "calc(100vh * 2 / 3)", background: "var(--bg-pale)" }}
    >
      <div className="w-full max-w-[400px] px-4 py-12">
        <h1 className="t-h2 text-center mb-8" style={{ color: "var(--ink)" }}>
          비밀번호 재설정
        </h1>

        {status === "checking" && (
          <p className="t-small text-center" style={{ color: "var(--neutral-stone)" }}>
            확인 중…
          </p>
        )}

        {status === "invalid" && (
          <div className="flex flex-col gap-5 text-center">
            <p className="t-body" style={{ color: "var(--ink)" }}>
              링크가 만료되었거나 유효하지 않습니다.
              <br />
              비밀번호 찾기를 다시 진행해 주세요.
            </p>
            <button
              type="button"
              className="btn btn-dark btn-lg w-full"
              onClick={() => router.push("/find-password")}
            >
              비밀번호 찾기로 이동
            </button>
          </div>
        )}

        {status === "done" && (
          <div className="flex flex-col gap-5 text-center">
            <p className="t-body" style={{ color: "var(--ink)" }}>
              비밀번호가 변경되었습니다.
              <br />
              새 비밀번호로 로그인해 주세요.
            </p>
            <button
              type="button"
              className="btn btn-dark btn-lg w-full"
              onClick={() => router.push("/login")}
            >
              로그인하러 가기
            </button>
          </div>
        )}

        {(status === "ready" || status === "submitting") && (
          <form onSubmit={handleSubmit} className="find-form flex flex-col gap-5">
            <Field label="새 비밀번호">
              <input
                type="password"
                className="ds-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력해 주세요"
                autoComplete="new-password"
                minLength={8}
              />
            </Field>
            <Field label="새 비밀번호 확인">
              <input
                type="password"
                className="ds-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력해 주세요"
                autoComplete="new-password"
                minLength={8}
              />
            </Field>

            {confirm.length > 0 && password !== confirm && (
              <p className="t-small" style={{ color: "var(--alert-red)" }}>
                비밀번호가 일치하지 않습니다.
              </p>
            )}
            {error && (
              <p className="t-small" style={{ color: "var(--alert-red)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || !canSubmit}
              className="btn btn-dark btn-lg w-full mt-2"
            >
              {status === "submitting" ? "변경 중…" : "비밀번호 변경"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .find-form .ds-input {
          height: 48px;
          padding-top: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="t-small" style={{ color: "var(--ink)" }}>
        {label}
      </span>
      {children}
    </div>
  );
}
