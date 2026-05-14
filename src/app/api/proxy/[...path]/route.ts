import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 백엔드 API 프록시 — httpOnly 쿠키 세션 기반 인증 위임.
 *
 * 동작:
 * 1. 클라이언트가 `/api/proxy/<백엔드 path>?query`로 호출
 * 2. 서버 supabase 클라이언트로 쿠키에서 access_token 추출
 * 3. 백엔드(`${BACKEND_BASE}/<path>`)로 forward — Authorization Bearer 자동 부착
 * 4. 응답을 그대로 스트리밍해 클라이언트로 반환
 *
 * 클라이언트는 `X-Auth-Mode: auto|required|none` 헤더로 인증 정책을 지시한다.
 * 기본은 "auto" (세션 있으면 첨부, 없으면 그냥 호출 — 공개+보호 둘 다 허용).
 *
 * Phase 3 시점에는 `NEXT_PUBLIC_USE_AUTH_PROXY=false`가 기본이라 호출 자체가 발생하지 않음.
 * Phase 4(로그인 흐름 Server Action화) 이후 점진 활성화한다.
 */
const BACKEND_BASE =
  process.env.API_BASE_INTERNAL ?? process.env.NEXT_PUBLIC_API_BASE_PATH ?? "";

type AuthMode = "auto" | "required" | "none";

/**
 * 클라이언트 요청에서 백엔드로 그대로 전달할 헤더 목록.
 * "authorization": 호출부가 직접 토큰을 지정하는 케이스(예: 가입 직후 백엔드 발급 JWT 사용)를 지원.
 *   이때 proxy는 supabase 쿠키 토큰을 덮어쓰지 않는다.
 */
const FORWARD_REQUEST_HEADERS = ["accept", "content-type", "accept-language", "authorization"];

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = request.nextUrl.search;
  const backendUrl = `${BACKEND_BASE}/${pathStr}${search}`;

  const authMode = (request.headers.get("x-auth-mode") as AuthMode | null) ?? "auto";

  // 서버 supabase 클라이언트 — 쿠키에서 세션 토큰 추출
  let token: string | null = null;
  if (authMode !== "none") {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
    if (authMode === "required" && !token) {
      return new NextResponse(null, { status: 401, statusText: "No Supabase session" });
    }
  }

  // 백엔드로 forward할 헤더 구성
  const forwardHeaders = new Headers();
  for (const key of FORWARD_REQUEST_HEADERS) {
    const v = request.headers.get(key);
    if (v) forwardHeaders.set(key, v);
  }
  // 클라이언트가 직접 Authorization을 보낸 경우(예: 가입 직후 백엔드 JWT)는 그것을 우선.
  // 그 외에는 supabase 쿠키에서 추출한 토큰을 자동 부착한다.
  if (token && !forwardHeaders.has("Authorization")) {
    forwardHeaders.set("Authorization", `Bearer ${token}`);
  }

  // body — GET/HEAD는 없음, 그 외는 arrayBuffer로 통과
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  const backendRes = await fetch(backendUrl, {
    method: request.method,
    headers: forwardHeaders,
    body,
  });

  // 응답 헤더 정리 — content-encoding/transfer-encoding은 stream을 깨뜨릴 수 있어 제거
  const responseHeaders = new Headers();
  for (const [k, v] of backendRes.headers.entries()) {
    const lower = k.toLowerCase();
    if (lower === "content-encoding" || lower === "transfer-encoding") continue;
    responseHeaders.set(k, v);
  }

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: responseHeaders,
  });
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
