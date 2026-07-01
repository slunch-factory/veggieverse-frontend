import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 가벼운 세션 확인 — 회원가입 "메일 보냈어요" 대기 화면이 다른 탭의 이메일 인증 완료를
 * 폴링으로 감지하기 위해 사용한다.
 *
 * 원래 탭의 브라우저 supabase 클라이언트는 로드 시점(세션 없음)에 초기화되어, 다른 탭이
 * 이후에 구운 인증 쿠키를 getSession()으로 다시 읽지 못한다. 반면 브라우저는 매 요청에
 * 공유 쿠키를 함께 보내므로, 서버는 항상 최신 쿠키(다른 탭이 구운 세션)를 읽어 정확히 판별한다.
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return NextResponse.json(
    { email: data.user?.email ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
