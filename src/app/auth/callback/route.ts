import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 카카오 OAuth 콜백 — Next.js 16 Route Handler.
 *
 * 흐름:
 * 1. 카카오 → /auth/callback?code=...&next=/
 * 2. server supabase로 exchangeCodeForSession → 쿠키에 세션 자동 저장
 * 3. user.identities 확인:
 *    - email provider 있음
 *      - 카카오 identity가 방금 자동 linking된 경우(created_at == last_sign_in_at)
 *        → /signup?prompt=existing-email (자사몰 가입자 + 카카오 첫 시도 — case1-1-II 모달)
 *      - 그 외(이미 연동된 사용자의 일반 카카오 로그인) → profile 유무로 next 또는 /signup
 *    - 카카오만        → email-check로 자사몰 계정 존재 확인
 *      - 있음 → /signup?prompt=existing-email (자사몰 기존 가입자 안내 모달 — case1-1-II)
 *      - 없음 → /signup                       (카카오 신규 — case2-1-I — 1단계 패스하고 바로 프로필 작성)
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

  const user = data.session.user;
  const userEmail = user.email ?? null;
  const hasEmailIdentity = Boolean(
    user.identities?.some((i) => i.provider === "email"),
  );
  const accessToken = data.session.access_token;

  // 이미 비밀번호 연동까지 완료된 사용자 → link 페이지 건너뛰고 profile 유무로 분기.
  // 단, 자사몰 가입자가 같은 이메일로 카카오 OAuth를 시도해 supabase가 방금 자동 linking한
  // 케이스(카카오 identity의 first sign-in)에는 사용자에게 안내를 한 번 띄운다.
  if (hasEmailIdentity) {
    const kakaoIdentity = user.identities?.find((i) => i.provider === "kakao");
    const currentlySignedInWithKakao =
      data.session.user.app_metadata?.provider === "kakao";
    const isFirstKakaoSignIn = Boolean(
      kakaoIdentity &&
        kakaoIdentity.created_at &&
        kakaoIdentity.last_sign_in_at &&
        kakaoIdentity.created_at === kakaoIdentity.last_sign_in_at,
    );

    if (currentlySignedInWithKakao && isFirstKakaoSignIn) {
      // 자사몰 가입자(이메일/비번 보유) + 카카오 첫 자동 linking 시점 →
      // 명세 case1-1-II 모달로 사용자에게 선택권 제공.
      return NextResponse.redirect(`${origin}/signup?prompt=existing-email`);
    }

    const profileRes = await fetch(
      `${BACKEND_BASE}/api/v1/veggieverse/users/profile`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return NextResponse.redirect(`${origin}${profileRes.ok ? next : "/signup"}`);
  }

  // 자사몰에 동일 이메일 가입자 있음 (case1-1-II) — 사용자에게 모달로 선택권 제공.
  // 자동 link 진행 대신 ?prompt=existing-email 로 보내어 SignupClient가 모달을 띄움.
  if (userEmail) {
    const checkRes = await fetch(
      `${BACKEND_BASE}/api/v1/veggieverse/users/email-check?email=${encodeURIComponent(userEmail)}`,
      { headers: { Accept: "application/json" } },
    );
    if (checkRes.ok) {
      return NextResponse.redirect(`${origin}/signup?prompt=existing-email`);
    }
  }

  // 카카오 신규 (case2-1-I) — 자사몰 계정도 없고 프로필도 없음.
  // 명세상 1단계(비번 입력) 패스 → /signup 으로 보내면 SignupClient가 자동으로 step 2 진입.
  return NextResponse.redirect(`${origin}/signup`);
}
