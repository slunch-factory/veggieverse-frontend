import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 카카오 OAuth 콜백 — Next.js 16 Route Handler.
 *
 * 흐름:
 * 1. 카카오 → /auth/callback?code=...&next=/
 * 2. server supabase로 exchangeCodeForSession → 쿠키에 세션 자동 저장
 * 3. user.identities 확인:
 *    - email provider 있음 → 자사몰 비번 연동 완료 → profile 유무로 / 또는 /signup
 *    - 카카오만        → email-check로 자사몰 계정 존재 확인
 *      - 있음 → /signup?link=1 (비번 추가 연동)
 *      - 없음 → /signup (신규 프로필 작성)
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

  // 이미 비밀번호 연동까지 완료된 사용자 → link 페이지 건너뛰고 profile 유무로 분기
  if (hasEmailIdentity) {
    const profileRes = await fetch(
      `${BACKEND_BASE}/api/v1/veggieverse/users/profile`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return NextResponse.redirect(`${origin}${profileRes.ok ? next : "/signup"}`);
  }

  // 동일 email 계정 통합: 자사몰 계정 있으면 비밀번호 연동 모드
  if (userEmail) {
    const checkRes = await fetch(
      `${BACKEND_BASE}/api/v1/veggieverse/users/email-check?email=${encodeURIComponent(userEmail)}`,
      { headers: { Accept: "application/json" } },
    );
    if (checkRes.ok) {
      return NextResponse.redirect(`${origin}/signup?link=1`);
    }
  }

  // 백엔드 프로필 존재 여부로 신규/기존 유저 구분
  const profileRes = await fetch(
    `${BACKEND_BASE}/api/v1/veggieverse/users/profile`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return NextResponse.redirect(`${origin}${profileRes.ok ? next : "/signup"}`);
}
