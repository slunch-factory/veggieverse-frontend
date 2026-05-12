import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Supabase 환경 변수가 설정됐는지 여부.
 * 미설정 시에도 모듈 로드는 통과시키고 (placeholder 사용), 실제 인증 호출 시점에 안내한다.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다.\n" +
      ".env.local 에 키를 추가하기 전까지 인증 기능은 동작하지 않습니다.",
  );
}

/**
 * createClient 는 빈 문자열 URL을 거부하므로, 미설정 시 placeholder 도메인을 넘긴다.
 * 실제 네트워크 호출은 일어나지 않는 한 이 placeholder는 의미가 없으며,
 * 페이지 렌더만 우선 통과시키는 용도.
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder-anon-key",
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
      detectSessionInUrl: isSupabaseConfigured,
      storageKey: "veggieverse-auth",
    },
  },
);
