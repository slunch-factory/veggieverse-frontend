import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "";

/**
 * httpOnly 쿠키 기반 인증 프록시 사용 여부.
 *
 * Phase 5 이후 기본 ON — 클라이언트는 `/api/proxy/*` Route Handler를 경유해
 * 백엔드를 호출하며, 서버가 쿠키에서 access_token을 꺼내 Authorization으로 forward한다.
 * 명시적으로 `NEXT_PUBLIC_USE_AUTH_PROXY=false`로 설정하면 (Phase 1~3 시점의)
 * localStorage 기반 직접 호출 모드로 복귀한다.
 */
const USE_PROXY = process.env.NEXT_PUBLIC_USE_AUTH_PROXY !== "false";

/** 인증 정책
 * - "auto": 세션이 있으면 첨부, 없으면 그냥 호출 (공개+보호 둘 다 허용)
 * - "required": 세션 필수, 없으면 즉시 null/에러
 * - "none": Authorization 헤더 미부착
 */
export type ApiAuthMode = "auto" | "required" | "none";

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: ApiAuthMode;
  /** API_BASE prefix를 자동으로 붙일지 여부 (기본 true) */
  absolute?: boolean;
}

async function getAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

function buildUrl(path: string, absolute: boolean) {
  if (/^https?:\/\//i.test(path)) return path;

  // 프록시 모드: same-origin /api/proxy/<백엔드 path>로 라우팅
  if (USE_PROXY) {
    const norm = path.startsWith("/") ? path : `/${path}`;
    return `/api/proxy${norm}`;
  }

  if (!absolute) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

function isJsonBody(body: unknown): boolean {
  if (body == null) return false;
  if (body instanceof FormData) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  if (typeof body === "string") return false;
  return true;
}

/**
 * 백엔드 API 공통 fetch — Authorization Bearer 자동 첨부 + 401 시 1회 자동 refresh.
 * `auth: "auto"`(기본) 모드에서 세션이 없으면 헤더 없이 호출하므로 공개 엔드포인트에도 사용 가능.
 */
export async function apiFetch(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<Response> {
  const { auth = "auto", absolute = true, body, headers, ...rest } = opts;

  const url = buildUrl(path, absolute);

  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  if (isJsonBody(body)) baseHeaders["Content-Type"] = "application/json";

  const finalHeaders = new Headers({ ...baseHeaders, ...(headers as Record<string, string> | undefined) });

  let token: string | null = null;
  if (USE_PROXY) {
    // 프록시 모드: 토큰은 서버가 쿠키에서 꺼내 부착. 클라이언트는 정책만 전달.
    // "none"도 명시적으로 보내어 프록시가 불필요한 supabase 세션 조회를 하지 않도록 한다.
    finalHeaders.set("X-Auth-Mode", auth);
  } else if (auth !== "none") {
    token = await getAccessToken();
    if (auth === "required" && !token) {
      // 인증 필수 호출인데 세션이 없으면 합성 401을 만들어 반환
      return new Response(null, { status: 401, statusText: "No Supabase session" });
    }
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const init: RequestInit = {
    ...rest,
    headers: finalHeaders,
    body:
      body == null
        ? undefined
        : isJsonBody(body)
          ? JSON.stringify(body)
          : (body as BodyInit),
  };

  let res = await fetch(url, init);

  // 401 → 토큰 갱신 시도 후 1회 재시도 (직접 호출 모드 한정 — 프록시 모드는 proxy.ts가 갱신)
  if (!USE_PROXY && res.status === 401 && token && auth !== "none") {
    const supabase = getSupabaseBrowserClient();
    const { data: refreshed } = await supabase.auth.refreshSession();
    const newToken = refreshed.session?.access_token ?? null;
    if (newToken && newToken !== token) {
      finalHeaders.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, { ...init, headers: finalHeaders });
    }
  }

  // 인증 필수 호출인데 refresh 후에도 401이면 세션 사망 → 로그인으로 유도
  if (res.status === 401 && auth === "required" && typeof window !== "undefined") {
    const here = window.location.pathname + window.location.search;
    if (!here.startsWith("/login")) {
      const redirect = encodeURIComponent(here);
      window.location.href = `/login?redirect=${redirect}`;
    }
  }

  return res;
}

/** apiFetch + JSON 파싱. 비-2xx 또는 파싱 실패 시 null. */
export async function apiJson<T>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T | null> {
  const res = await apiFetch(path, opts);
  if (!res.ok) {
    if (res.status !== 401) {
      // 401은 미인증 상태에서 자주 발생 → 콘솔 노이즈 줄이기
      console.error(`[apiJson] ${path} HTTP ${res.status} ${res.statusText}`);
    }
    return null;
  }
  try {
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[apiJson] ${path} JSON parse failed:`, err);
    return null;
  }
}
