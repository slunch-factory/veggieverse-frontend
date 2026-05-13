"use client";

import { useState, type FormEvent } from "react";

type Tab = "phone" | "email";

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function filterAlphanumeric(v: string) {
  return v.replace(/[^a-zA-Z0-9]/g, "");
}

export function FindPasswordClient() {
  const [tab, setTab] = useState<Tab>("phone");

  // 휴대폰 인증 탭 상태
  const [phoneUserId, setPhoneUserId] = useState("");
  const [phone, setPhone] = useState("");

  // 이메일 인증 탭 상태
  const [emailUserId, setEmailUserId] = useState("");
  const [email, setEmail] = useState("");

  const phoneCanSubmit = Boolean(phoneUserId.trim() && phone.trim());
  const emailCanSubmit = Boolean(emailUserId.trim() && email.trim());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: 실제 인증 API 연동
    if (tab === "phone" && phoneCanSubmit) {
      alert("휴대폰으로 비밀번호 재설정 링크가 전송되었습니다. (mock)");
    } else if (tab === "email" && emailCanSubmit) {
      alert("이메일로 비밀번호 재설정 링크가 전송되었습니다. (mock)");
    }
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

        <form onSubmit={handleSubmit} className="find-form flex flex-col gap-5 mt-8">
          {tab === "phone" ? (
            <>
              <Field label="아이디">
                <input
                  className="ds-input"
                  value={phoneUserId}
                  onChange={(e) => setPhoneUserId(filterAlphanumeric(e.target.value))}
                  placeholder="아이디를 입력해 주세요"
                  autoComplete="username"
                />
              </Field>
              <Field label="휴대폰 번호">
                <input
                  type="tel"
                  className="ds-input"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="휴대폰 번호를 입력해 주세요"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={13}
                />
              </Field>
              <button
                type="submit"
                disabled={!phoneCanSubmit}
                className="btn btn-dark btn-lg w-full mt-2"
              >
                인증번호 받기
              </button>
            </>
          ) : (
            <>
              <Field label="아이디">
                <input
                  className="ds-input"
                  value={emailUserId}
                  onChange={(e) => setEmailUserId(filterAlphanumeric(e.target.value))}
                  placeholder="아이디를 입력해 주세요"
                  autoComplete="username"
                />
              </Field>
              <Field label="이메일">
                <input
                  type="email"
                  className="ds-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력해 주세요"
                  autoComplete="email"
                />
              </Field>
              <button
                type="submit"
                disabled={!emailCanSubmit}
                className="btn btn-dark btn-lg w-full mt-2"
              >
                확인
              </button>
            </>
          )}
        </form>
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
