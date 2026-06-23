"use client";

import { useState, type FormEvent } from "react";
import { requestPasswordResetAction } from "@/app/auth/actions";

type Tab = "phone" | "email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FindPasswordClient() {
  const [tab, setTab] = useState<Tab>("email");

  // 이메일 인증 탭 상태
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailCanSubmit = EMAIL_RE.test(email.trim()) && !submitting;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailCanSubmit) return;
    setSubmitting(true);
    setError(null);
    const result = await requestPasswordResetAction(email.trim());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // 계정 열거 방지 — 가입 여부와 무관하게 동일한 완료 화면을 보여준다.
    setSent(true);
  };

  return (
    <div
      className="flex justify-center"
      style={{
        minHeight: "calc(100vh * 2 / 3)",
        background: "var(--bg-pale)",
      }}
    >
      <div className="w-full max-w-[400px] px-4 py-12">
        <h1 className="t-h2 text-center mb-8" style={{ color: "var(--ink)" }}>
          비밀번호 찾기
        </h1>

        <Tabs tab={tab} onChange={setTab} />

        {tab === "phone" ? (
          <PhoneTabComingSoon />
        ) : sent ? (
          <div className="mt-8 flex flex-col gap-4 text-center">
            <p className="t-body" style={{ color: "var(--ink)" }}>
              <b>{email.trim()}</b> 으로
              <br />
              비밀번호 재설정 메일을 보냈습니다.
            </p>
            <p className="t-small" style={{ color: "var(--neutral-stone)" }}>
              메일이 보이지 않으면 스팸함을 확인해 주세요.
              <br />
              해당 이메일로 가입된 계정이 있는 경우에만 메일이 전송됩니다.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="find-form flex flex-col gap-5 mt-8">
            <Field label="이메일">
              <input
                type="email"
                className="ds-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입한 이메일을 입력해 주세요"
                autoComplete="email"
              />
            </Field>
            {error && (
              <p className="t-small" style={{ color: "var(--alert-red)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!emailCanSubmit}
              className="btn btn-dark btn-lg w-full mt-2"
            >
              {submitting ? "전송 중…" : "재설정 메일 받기"}
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

/* ─── 보조 컴포넌트 ─── */

function PhoneTabComingSoon() {
  return (
    <div className="mt-8 flex flex-col gap-4 text-center">
      <p className="t-body" style={{ color: "var(--ink)" }}>
        휴대폰 인증은 준비 중입니다.
      </p>
      <p className="t-small" style={{ color: "var(--neutral-stone)" }}>
        지금은 이메일 인증으로 비밀번호를 재설정할 수 있습니다.
      </p>
    </div>
  );
}

function Tabs({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div
      className="flex"
      style={{ borderBottom: "1px solid var(--neutral-stone)" }}
    >
      <TabButton active={tab === "phone"} onClick={() => onChange("phone")}>
        휴대폰 인증
      </TabButton>
      <TabButton active={tab === "email"} onClick={() => onChange("email")}>
        이메일 인증
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 transition-colors cursor-pointer"
      style={{
        height: 48,
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--ink)" : "none",
        marginBottom: -1,
        color: active ? "var(--ink)" : "var(--neutral-stone)",
        fontSize: 14,
      }}
    >
      {children}
    </button>
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
