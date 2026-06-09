import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Next.js 16의 `proxy.ts` 컨벤션 — 기존 `middleware.ts`의 후속.
 * 모든 요청 경로에서 Supabase 세션 쿠키를 동기화한다.
 * 자세한 동작은 `@/lib/supabase/proxy`의 `updateSession` 주석 참고.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 대해 실행:
     * - api (API 라우트 — /api/proxy 등은 자체적으로 쿠키→토큰 인증을 처리하므로
     *        여기서 getUser() 네트워크 왕복을 또 돌면 순수 중복 비용이다)
     * - _next/static (정적 자산)
     * - _next/image (Next 이미지 최적화)
     * - favicon.ico, sitemap.xml, robots.txt
     * - 이미지/폰트 등 정적 확장자
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)",
  ],
};
