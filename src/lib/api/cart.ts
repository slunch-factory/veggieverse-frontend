const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

const DEFAULT_USER_ID = 52;

export async function addCartItem(productId: number, quantity: number): Promise<void> {
  const url = `${API_BASE}/api/v1/veggieverse/store/cart/items?userId=${DEFAULT_USER_ID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  // 409: 이미 담긴 상품 — 정상 처리
  if (!res.ok && res.status !== 409) {
    throw new Error(`[addCartItem] ${res.status} ${res.statusText}`);
  }
}

export async function deleteCartItem(productId: number): Promise<boolean> {
  const url = `${API_BASE}/api/v1/veggieverse/store/cart/items/${productId}?userId=${DEFAULT_USER_ID}`;
  const res = await fetch(url, { method: "DELETE" });
  return res.status === 204;
}

export async function updateCartItemQuantity(productId: number, quantity: number): Promise<boolean> {
  const url = `${API_BASE}/api/v1/veggieverse/store/cart/items?userId=${DEFAULT_USER_ID}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify([{ productId, quantity }]),
  });
  return res.ok;
}
