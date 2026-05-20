import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버(Server Component / Server Action / Route Handler)용 Supabase 클라이언트.
 *
 * Next.js 16의 `cookies()`는 비동기이므로 await 후 getAll/setAll 어댑터를 구성한다.
 * Server Component 컨텍스트에서 `set` 호출은 throw하지만 middleware가 세션 갱신을
 * 책임지므로 try/catch로 흡수해도 안전하다.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component 렌더 중에는 cookies().set이 throw — middleware가 처리.
          }
        },
      },
    },
  );
}
