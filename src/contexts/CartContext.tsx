"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { getCart, syncCartAfterLogin, type CartResponse } from "@/lib/api/cart";
import { useUser } from "@/contexts/UserContext";

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  discountRate: number;
  discountedPrice: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  totalPrice: number;
  addItem: (product: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  /** 백엔드 GET /cart 응답을 화면 카트로 동기화 (백엔드 = 진실 원천) */
  syncFromServer: (response: CartResponse | null) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "veggieverse-cart";

/**
 * 백엔드 카트 응답을 화면 CartItem 배열로 변환.
 * 응답에 부족한 메타(slug, tagline, imageUrl, discountRate)는 prev(localStorage 캐시)에서 보강.
 */
function mergeServerCart(prev: CartItem[], response: CartResponse): CartItem[] {
  const prevById = new Map(prev.map((i) => [i.productId, i]));
  return response.items.map((srv) => {
    const cached = prevById.get(srv.productId);
    const discountRate =
      srv.unitPrice > 0
        ? Math.round(((srv.unitPrice - srv.discountedUnitPrice) / srv.unitPrice) * 100)
        : cached?.discountRate ?? 0;
    return {
      productId: srv.productId,
      slug: cached?.slug ?? "",
      name: srv.productName,
      tagline: cached?.tagline ?? "",
      price: srv.unitPrice,
      discountRate,
      discountedPrice: srv.discountedUnitPrice,
      imageUrl: cached?.imageUrl ?? "",
      quantity: srv.quantity,
    };
  });
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const suppressNextSave = useRef(false);
  const hydrated = useRef(false);
  /** 멤버 카트 fetch가 이미 완료된 사용자 id — 같은 세션에서 중복 호출 방지. */
  const fetchedForUserIdRef = useRef<string | null>(null);

  const { session, isAuthenticated, isLoadingSession } = useUser();
  const sessionUserId = session?.user.id ?? null;

  /**
   * UserContext에서 derived된 (session, isAuthenticated)에 반응.
   *   - 세션 없음                → 화면 카트만 비움(localStorage 유지)
   *   - 세션 있음 + incomplete   → 백엔드 호출 금지 (회원가입 미완료라 user 레코드 없음 → 404)
   *   - 세션 있음 + complete     → localStorage 복원 + 비회원 카트 병합 + 멤버 카트 동기화
   */
  useEffect(() => {
    if (isLoadingSession) return;

    if (!sessionUserId) {
      if (fetchedForUserIdRef.current !== null) {
        suppressNextSave.current = true;
        setItems([]);
        fetchedForUserIdRef.current = null;
      }
      hydrated.current = true;
      return;
    }

    // 백엔드 자사몰 user 레코드가 없으면 /cart 호출 시 404 — incomplete 가입 상태에서는 skip.
    // ProfileGate가 곧 /signup?step=2로 redirect하지만, 그 사이 한 번이라도 부르지 않도록 가드.
    if (!isAuthenticated) {
      hydrated.current = true;
      return;
    }

    if (fetchedForUserIdRef.current === sessionUserId) return;
    fetchedForUserIdRef.current = sessionUserId;

    void (async () => {
      // localStorage 복원 + 비회원 카트 병합 + 멤버 카트 동기화를 한 async chain으로.
      // setState를 async 컨텍스트에서만 호출 → react-hooks/set-state-in-effect 회피.
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch {}
      }
      const result = await syncCartAfterLogin();
      if (result.status === "merged") {
        if (result.cart) {
          const cartResponse = result.cart;
          setItems((prev) => mergeServerCart(prev, cartResponse));
        } else {
          const response = await getCart();
          if (response) {
            setItems((prev) => mergeServerCart(prev, response));
          }
        }
      }
      // 복원·병합이 끝난 뒤에야 저장 활성화 — 동기화 창 사이에 빈/부분 카트가
      // localStorage를 덮어써 게스트 항목이 유실되던 레이스 방지.
      hydrated.current = true;
    })();
  }, [sessionUserId, isAuthenticated, isLoadingSession]);

  useEffect(() => {
    // 첫 마운트 시 localStorage 복원이 끝나기 전엔 저장 안 함
    // (초기 빈 배열이 localStorage를 덮어쓰는 race condition 방지)
    if (!hydrated.current) return;
    if (suppressNextSave.current) {
      suppressNextSave.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Omit<CartItem, "quantity">, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const syncFromServer = useCallback((response: CartResponse | null) => {
    if (!response) return;
    setItems((prev) => mergeServerCart(prev, response));
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.discountedPrice * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, totalCount, totalPrice, addItem, removeItem, updateQuantity, clearCart, syncFromServer }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
