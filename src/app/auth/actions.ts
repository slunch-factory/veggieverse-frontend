"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isAlreadyRegisteredError,
  translateSupabaseAuthError,
} from "@/lib/supabase-errors";

/**
 * Server Action 공통 결과 타입 — 클라이언트가 form 응답으로 받음.
 *
 * 로그인 성공 시 토큰을 함께 반환한다.
 * 서버가 Set-Cookie로 세션 쿠키를 set해도 client supabase는 onAuthStateChange를
 * 자체 액션에만 발화하므로 UserContext가 즉시 갱신되지 않는다. 호출자는 토큰을 받아
 * client supabase의 `setSession()`을 명시 호출하여 onAuthStateChange를 발화시켜야 한다.
 *
 * `alreadyRegistered`는 'User already registered' 케이스 식별용 — 클라이언트에서
 * AlreadyRegisteredModal 분기에 사용한다.
 */
export type AuthSessionTokens = {
  access_token: string;
  refresh_token: string;
};

export type AuthActionResult =
  | { ok: true; session?: AuthSessionTokens | null }
  | { ok: false; error: string; alreadyRegistered?: boolean };

/**
 * 이메일/비밀번호 로그인 — 성공 시 쿠키에 세션 저장.
 * 과거엔 server에서 redirect()를 throw했지만, Next.js 16 + Turbopack dev 환경에서
 * client 측 navigation 처리가 끊겨 호출자의 await이 영구 대기하는 증상이 있어 결과만 반환한다.
 * 호출자(LoginClient/LoginModal)가 router.push 또는 router.refresh로 navigation을 처리한다.
 */
export async function signInAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email.trim(),
    password: formData.password,
  });
  if (error) return { ok: false, error: translateSupabaseAuthError(error.message) };
  return {
    ok: true,
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }
      : null,
  };
}

/**
 * 이메일/비밀번호 회원가입 — 성공 시 쿠키에 세션 저장.
 * 클라이언트가 후속 단계(step2 프로필 작성)를 진행하므로 여기서 redirect하지 않는다.
 */
export async function signUpAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: formData.email.trim(),
    password: formData.password,
  });
  if (error) {
    return {
      ok: false,
      error: translateSupabaseAuthError(error.message),
      alreadyRegistered: isAlreadyRegisteredError(error.message),
    };
  }
  return { ok: true };
}

/**
 * 카카오 로그인 트리거 — OAuth URL을 받아 클라이언트에서 redirect 한다.
 * redirect()를 서버에서 호출하면 PKCE code_verifier 쿠키 굽기 전에 응답이 끝나는 경우가 있어,
 * URL만 반환하고 클라이언트가 window.location.href = url 로 이동시키는 패턴을 사용.
 */
export async function signInWithKakaoAction(
  next: string = "/",
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") ?? reqHeaders.get("x-forwarded-host") ?? "";
  const redirectTo = origin
    ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    : `/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) return { ok: false, error: translateSupabaseAuthError(error.message) };
  if (!data.url) return { ok: false, error: "카카오 인증 URL을 받지 못했습니다." };
  return { ok: true, url: data.url };
}

/**
 * 카카오 가입자의 자사몰 비밀번호 추가(연동) — link 모드.
 */
export async function linkPasswordAction(
  password: string,
): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: translateSupabaseAuthError(error.message) };
  return { ok: true };
}

/**
 * 로그아웃 — 쿠키에서 세션 제거 후 홈으로 redirect.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
