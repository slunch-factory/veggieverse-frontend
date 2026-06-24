"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isAlreadyRegisteredError,
  isEmailNotConfirmedError,
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
  | {
      ok: false;
      error: string;
      alreadyRegistered?: boolean;
      /** 'Email not confirmed' — 가입은 됐으나 이메일 인증 미완료 계정 */
      emailNotConfirmed?: boolean;
    };

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
  if (error)
    return {
      ok: false,
      error: translateSupabaseAuthError(error.message),
      emailNotConfirmed: isEmailNotConfirmedError(error.message),
    };
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
 * 인증 메일(가입/비번재설정)이 돌아올 도착지(= GoTrue `redirect_to`, 템플릿의 `{{ .RedirectTo }}`).
 *
 * token_hash 방식을 쓰므로 메일 템플릿이 이 값 뒤에 쿼리를 붙여 최종 링크를 만든다:
 *   가입:   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup&next=%2Fsignup%3Fstep%3D2
 *   재설정: {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery&next=%2Fauth%2Fupdate-password
 *   = {origin}/auth/confirm?token_hash=...&type=...&next=...
 * `{{ .SiteURL }}`(단일 고정값) 대신 요청 origin 기반이라 로컬·운영 모두 자기 도메인으로 돌아온다.
 *
 * ⚠️ Supabase 대시보드 URL Configuration의 Redirect URLs에 `/auth/confirm`(로컬·운영)을
 *    등록해야 `{{ .RedirectTo }}`가 채워진다. 미등록 시 링크가 비어 인증이 깨진다.
 */
function buildAuthConfirmRedirect(origin: string): string {
  return origin ? `${origin}/auth/confirm` : `/auth/confirm`;
}

/**
 * 이메일/비밀번호 회원가입 — Supabase "Confirm email" 활성화 상태.
 * signUp은 세션을 생성하지 않고 인증 메일만 발송한다. 사용자가 메일 링크를 눌러야
 * 세션이 생기므로, 호출자는 ok 응답을 받으면 "메일을 확인하세요" 화면을 띄운다.
 */
export async function signUpAction(formData: {
  email: string;
  password: string;
}): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") ?? reqHeaders.get("x-forwarded-host") ?? "";
  const { data, error } = await supabase.auth.signUp({
    email: formData.email.trim(),
    password: formData.password,
    options: { emailRedirectTo: buildAuthConfirmRedirect(origin) },
  });
  if (error) {
    return {
      ok: false,
      error: translateSupabaseAuthError(error.message),
      alreadyRegistered: isAlreadyRegisteredError(error.message),
    };
  }
  // 이메일 enumeration 보호가 켜져 있으면, 이미 가입된 이메일은 에러 없이 obfuscate되어
  // 반환된다(빈 identities 배열). 이 경우를 "이미 가입됨"으로 판별한다.
  // (신규 가입은 identities에 email identity 1개가 채워져 들어온다.)
  const identities = data.user?.identities;
  if (identities && identities.length === 0) {
    return {
      ok: false,
      error: "이미 가입된 이메일입니다.",
      alreadyRegistered: true,
    };
  }
  return { ok: true };
}

/**
 * 회원가입 인증 메일 재발송 — "메일 확인" 화면의 재발송 버튼에서 호출.
 * signUp과 동일한 emailRedirectTo를 사용해 링크 도착지를 일치시킨다.
 */
export async function resendSignupConfirmationAction(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") ?? reqHeaders.get("x-forwarded-host") ?? "";
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
    options: { emailRedirectTo: buildAuthConfirmRedirect(origin) },
  });
  if (error) return { ok: false, error: translateSupabaseAuthError(error.message) };
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
 * 비밀번호 재설정 메일 발송.
 *
 * signup과 동일하게 token_hash 방식을 쓴다(`/auth/confirm` 재사용). PKCE `?code=` 방식은
 * resetPasswordForEmail 시점에 구운 code_verifier가 메일 클릭 시점(나중·다른 기기)에 없어
 * "PKCE code verifier not found"로 깨질 수 있다. token_hash는 verifier가 필요 없어 안전하다.
 *
 * redirectTo(= `{{ .RedirectTo }}`)는 `${origin}/auth/confirm`. Reset Password 메일 템플릿이
 * 그 뒤에 쿼리를 붙여 최종 링크를 만든다:
 *   {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery&next=%2Fauth%2Fupdate-password
 * /auth/confirm이 verifyOtp(type=recovery)로 세션을 발급한 뒤 /auth/update-password로 보낸다.
 *
 * 보안: 계정 열거(account enumeration) 방지를 위해 가입 여부와 무관하게 항상 ok를 반환한다.
 * (Supabase도 미가입 이메일에는 실제로 메일을 보내지 않는다.)
 */
export async function requestPasswordResetAction(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const reqHeaders = await headers();
  const origin = reqHeaders.get("origin") ?? reqHeaders.get("x-forwarded-host") ?? "";

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: buildAuthConfirmRedirect(origin),
  });
  // rate-limit 등 호출 자체가 실패한 경우만 에러로 노출, "미가입"은 노출하지 않는다.
  if (error) return { ok: false, error: translateSupabaseAuthError(error.message) };
  return { ok: true };
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
