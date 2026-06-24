import { type EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 이메일 회원가입 인증 확인 — Next.js 16 Route Handler.
 *
 * PKCE(`?code=` + exchangeCodeForSession) 대신 token_hash(verifyOtp) 방식을 쓴다.
 * signUp을 Server Action에서 호출하면 PKCE code_verifier 쿠키가 브라우저에 안정적으로
 * 구워지지 않아 콜백에서 "PKCE code verifier not found in storage" 오류가 났다.
 * token_hash 방식은 verifier가 필요 없는 stateless 검증이라 이 문제를 피한다.
 *
 * 쿠키는 redirect 응답 객체에 직접 쓴다(아래 setAll). createSupabaseServerClient의
 * next/headers 기반 set은 새로 만든 NextResponse.redirect에 Set-Cookie가 실리지 않아
 * verifyOtp가 성공해도 세션 쿠키가 브라우저에 저장되지 않는 문제가 있었다.
 *
 * 흐름:
 * 1. 가입 인증 메일 링크 → /auth/confirm?token_hash=...&type=signup
 *    (메일 템플릿: {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=signup)
 * 2. verifyOtp로 세션 쿠키 발급(응답에 직접 부착)
 * 3. next(기본 /signup?confirmed=1)로 redirect — SignupClient가 "인증 완료" 화면을 띄우고,
 *    원래 가입 탭은 /auth/session-check 폴링으로 세션을 감지해 step2로 자동 진입한다.
 */

/**
 * 오픈 리다이렉트 방지 — 같은 출처의 내부 경로만 허용. (callback/route.ts와 동일 규칙)
 */
function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/")) return "/signup?confirmed=1";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/signup?confirmed=1";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  // 성공 시 반환할 redirect 응답 — verifyOtp가 이 응답 객체에 직접 Set-Cookie를 부착한다.
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    const msg = encodeURIComponent(error.message);
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  return response;
}
