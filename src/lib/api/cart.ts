import { apiFetch } from "@/lib/api/client";
import { supabase } from "@/lib/supabase";

const CART_SESSION_KEY = "veggieverse-cart-session";

export function saveCartSessionId(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_SESSION_KEY, token);
  }
}

export function clearCartSessionId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CART_SESSION_KEY);
  }
}

function getCartSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_SESSION_KEY);
}

function withSessionId(path: string, sessionId: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}sessionId=${encodeURIComponent(sessionId)}`;
}

async function issueCartSessionId(): Promise<string | null> {
  try {
    const res = await apiFetch("/api/v1/veggieverse/store/cart/session", {
      method: "POST",
      auth: "none",
    });
    if (!res.ok) {
      console.error("[issueCartSessionId] HTTP error:", res.status, res.statusText);
      return null;
    }
    const data: { sessionId: string } = await res.json();
    const token = data.sessionId ?? null;
    if (token) saveCartSessionId(token);
    return token;
  } catch (err) {
    console.error("[issueCartSessionId] fetch failed:", err);
    return null;
  }
}

async function ensureCartSessionId(): Promise<string | null> {
  const existing = getCartSessionId();
  if (existing) return existing;
  return issueCartSessionId();
}

async function cartFetch(
  path: string,
  options: Parameters<typeof apiFetch>[1] = {},
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    // 로그인 상태: JWT 토큰만 사용. sessionId는 전달하지 않음.
    // sessionId 정리는 syncCartAfterLogin()에서 병합 성공 시에만 수행.
    return apiFetch(path, { ...options, auth: "auto" });
  }
  // 비회원: sessionId 확보 (없으면 신규 발급) 후 파라미터로 전달
  const sessionId = await ensureCartSessionId();
  const url = sessionId ? withSessionId(path, sessionId) : path;
  return apiFetch(url, { ...options, auth: "none" });
}

export interface CartResponseItem {
  productId: number;
  productName: string;
  unitPrice: number;
  discountedUnitPrice: number;
  quantity: number;
}

export interface CartResponse {
  items: CartResponseItem[];
  totalOriginalAmount: number;
  totalDiscountedAmount: number;
  cartType: "MEMBER" | "ANONYMOUS";
}

export type SyncCartResult =
  | { status: "merged"; cart: CartResponse | null }
  | { status: "skipped" }
  | { status: "failed" };

/**
 * 로그인 직후 한 번만 호출: `POST /cart/merge?sessionId={A}`로 비회원 카트를
 * 멤버 카트에 병합한다(같은 productId는 수량 합산, 비회원 카트는 백엔드에서 삭제).
 * 성공 시 localStorage의 sessionId를 제거하고 병합된 카트 응답을 반환.
 *
 * @returns
 *   - status="merged":   병합 성공 (sessionId 없으면 cart=null로 노옵 처리)
 *   - status="skipped":  로그인 상태가 아니어서 패스
 *   - status="failed":   백엔드 에러 — 화면 갱신 보류로 데이터 손실 방지
 */
export async function syncCartAfterLogin(): Promise<SyncCartResult> {
  const sessionId = getCartSessionId();
  if (!sessionId) return { status: "merged", cart: null };

  const { data } = await supabase.auth.getSession();
  if (!data.session) return { status: "skipped" };

  const url = withSessionId("/api/v1/veggieverse/store/cart/merge", sessionId);
  const res = await apiFetch(url, { method: "POST", auth: "required" });
  if (res.ok) {
    const cart: CartResponse | null = await res.json().catch(() => null);
    console.log(
      "%c[syncCartAfterLogin] ✅ 비회원 카트 병합 완료",
      "color: #4A7F52; font-weight: bold;",
      cart,
    );
    clearCartSessionId();
    return { status: "merged", cart };
  }
  console.error(
    "[syncCartAfterLogin] HTTP error:",
    res.status,
    res.statusText,
  );
  return { status: "failed" };
}

export async function getCart(): Promise<CartResponse | null> {
  const res = await cartFetch("/api/v1/veggieverse/store/cart", {
    method: "GET",
  });
  if (!res.ok) {
    console.error("[getCart] HTTP error:", res.status, res.statusText);
    return null;
  }
  const data: CartResponse | null = await res.json().catch(() => null);
  console.log("%c[getCart] ✅ 카트 조회 성공", "color: #4A7F52; font-weight: bold;", data);
  return data;
}

export async function addCartItem(productId: number, quantity: number): Promise<void> {
  const res = await cartFetch("/api/v1/veggieverse/store/cart/items", {
    method: "POST",
    body: { productId, quantity },
  });
  // 409: 이미 담긴 상품 — 정상 처리
  if (!res.ok && res.status !== 409) {
    throw new Error(`[addCartItem] ${res.status} ${res.statusText}`);
  }
}

export async function deleteCartItem(productId: number): Promise<boolean> {
  const res = await cartFetch(`/api/v1/veggieverse/store/cart/items/${productId}`, {
    method: "DELETE",
  });
  // 204: 정상 삭제 / 404: 이미 카트에 없음 — 둘 다 사용자 의도(제거) 달성
  if (res.status === 204 || res.status === 404) return true;
  console.error("[deleteCartItem] HTTP error:", res.status, res.statusText);
  return false;
}

export async function updateCartItemQuantity(productId: number, quantity: number): Promise<boolean> {
  const res = await cartFetch("/api/v1/veggieverse/store/cart/items", {
    method: "PATCH",
    body: [{ productId, quantity }],
  });
  return res.ok;
}
