import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * 모든 요청에서 Supabase 세션 쿠키를 동기화하고 만료된 access token을 자동 갱신한다.
 *
 * 동작:
 * 1. 요청 쿠키에서 sb-* 토큰 읽기
 * 2. supabase.auth.getUser() 호출 시 refresh token으로 자동 갱신
 * 3. 갱신된 토큰을 응답 Set-Cookie로 다시 굽기 (httpOnly, Secure, SameSite=Lax)
 *
 * Phase 1~3 시점에는 ssr 클라이언트가 사용되는 곳이 없어 사실상 no-op.
 * Phase 4(로그인 흐름 Server Action화) 이후부터 실효 발생.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1) 현재 요청 객체에 새 쿠키 반영 — 이후 supabase 내부 재호출 시 일관성 확보
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          // 2) 새 응답 객체 생성 후 Set-Cookie 헤더 부착
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getUser 호출은 필수 — 내부적으로 만료된 토큰을 refresh하고 setAll로 새 쿠키를 굽는다.
  await supabase.auth.getUser();

  return response;
}
