import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 브라우저(Client Component)용 Supabase 클라이언트 — 쿠키 storage 기반.
 *
 * 기존 `@/lib/supabase`의 supabase-js 싱글톤(localStorage 기반)과 별개로 운영.
 * Phase 4~5에서 인증 흐름을 Server Action으로 이전하면 이 클라이언트로 단일화한다.
 *
 * 매 호출마다 새 인스턴스를 만들지 않도록 모듈 스코프 싱글톤으로 캐싱.
 */
let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
  );
  return browserClient;
}
