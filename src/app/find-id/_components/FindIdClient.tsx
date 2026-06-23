"use client";

import Link from "next/link";

/**
 * 아이디 찾기 — 현재 준비 중.
 *
 * 자사몰 인증은 Supabase(이메일=로그인 ID) 기반이라, "이름·휴대폰으로 가입 이메일 역조회"는
 * 백엔드에 전화번호→계정 매핑 조회 API가 있어야 가능하다(아직 없음).
 * 그 전까지 mock 대신 정직한 준비중 안내 + 대체 동선(로그인/비밀번호 찾기)을 제공한다.
 */
export function FindIdClient() {
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
          아이디 찾기
        </h1>

        <div className="flex flex-col gap-4 text-center">
          <p className="t-body" style={{ color: "var(--ink)" }}>
            아이디 찾기는 준비 중입니다.
          </p>
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            슬런치 팩토리는 이메일을 아이디로 사용합니다.
            <br />
            카카오로 가입하셨다면 카카오 로그인을 이용해 주세요.
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <Link href="/login" className="btn btn-dark btn-lg w-full">
            로그인하러 가기
          </Link>
          <Link
            href="/find-password"
            className="btn btn-ghost btn-lg w-full"
            style={{ border: "1px solid var(--ink)" }}
          >
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  );
}
