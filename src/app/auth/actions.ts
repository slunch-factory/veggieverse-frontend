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
 * 성공 시 redirect를 throw하므로 실패 케이스만 직렬화된다.
 *
 * `alreadyRegistered`는 'User already registered' 케이스 식별용 — 클라이언트에서
 * AlreadyRegisteredModal 분기에 사용한다.
 */
export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string; alreadyRegistered?: boolean };

/**
 * 이메일/비밀번호 로그인 — 성공 시 쿠키에 세션 저장 후 next 경로로 redirect.
 */
export async function signInAction(formData: {
  email: string;
  password: string;
  next?: string;
}): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email.trim(),
    password: formData.password,
  });
  if (error) return { ok: false, error: translateSupabaseAuthError(error.message) };

  // redirect는 throws — try/catch로 감싸지 말 것.
  redirect(formData.next ?? "/");
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
