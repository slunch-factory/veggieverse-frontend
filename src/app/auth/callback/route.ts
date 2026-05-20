import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 카카오 OAuth 콜백 — Next.js 16 Route Handler.
 *
 * 흐름:
 * 1. 카카오 → /auth/callback?code=...&next=/
 * 2. server supabase로 exchangeCodeForSession → 쿠키에 세션 자동 저장
 * 3. BE email-check 응답의 providers로 분기:
 *    - exists && providers=["email"]            → /signup?prompt=existing-email (case1-1-II)
 *    - exists && providers ⊇ {"email","kakao"}  → next (이미 연동된 사용자 일반 로그인)
 *    - exists && providers=["kakao"]            → next (카카오 전용 가입자 재로그인)
 *    - !exists                                  → /signup (카카오 신규 — step 2 자동 진입)
 */
const BACKEND_BASE =
  process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE_PATH ?? "";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    const msg = encodeURIComponent(error?.message ?? "exchange_failed");
    return NextResponse.redirect(`${origin}/login?error=${msg}`);
  }

  const userEmail = data.session.user.email ?? null;

  // BE의 자사몰 가입 상태(providers)를 단일 시그널로 사용한다.
  // Supabase identities/app_metadata는 자동 link 활성화 여부, timestamp 정밀도 등에 좌우되어
  // 이번 OAuth가 카카오인지·자사몰 이메일 가입자가 있었는지를 정확히 판별하기 어렵다.
  // 반면 BE의 consumer.users.auth_providers는 가입/연동 시점에만 갱신되므로 신뢰 가능.
  if (userEmail) {
    const checkRes = await fetch(
      `${BACKEND_BASE}/api/v1/veggieverse/users/email-check?email=${encodeURIComponent(userEmail)}`,
      { headers: { Accept: "application/json" } },
    );
    if (checkRes.ok) {
      const body = (await checkRes.json().catch(() => null)) as
        | { exists?: boolean; providers?: string[] }
        | null;
      const providers = (body?.providers ?? []).map((p) => p.toLowerCase());
      const hasEmail = providers.includes("email");
      const hasKakao = providers.includes("kakao");

      // 자사몰 이메일/비번 가입자 + 카카오 OAuth 첫 시도 → case1-1-II 모달.
      if (body?.exists && hasEmail && !hasKakao) {
        return NextResponse.redirect(`${origin}/signup?prompt=existing-email`);
      }
      // 이미 카카오까지 등록된 사용자 또는 카카오 전용 가입자 → 정상 로그인.
      // (incomplete 프로필은 ProfileGate가 /signup?step=2로 redirect — 여기서는 next로 보냄.)
      if (body?.exists) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // 카카오 신규 (case2-1-I) — 자사몰 계정도 없고 프로필도 없음.
  // 명세상 1단계(비번 입력) 패스 → /signup 으로 보내면 SignupClient가 자동으로 step 2 진입.
  return NextResponse.redirect(`${origin}/signup`);
}
