"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { syncCartAfterLogin, type CartResponse } from "@/lib/api/cart";

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

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // 초기 로드: 로그인 상태일 때만 localStorage 복원
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try { setItems(JSON.parse(saved)); } catch {}
        }
      }
      // 복원 시도 완료 — 이제부터 items 변경 시 localStorage 저장 허용
      hydrated.current = true;
    });

    // 로그아웃 → 화면만 비움 (localStorage 유지)
    // 로그인 → localStorage에서 복원
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        suppressNextSave.current = true;
        setItems([]);
      } else if (event === "SIGNED_IN") {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try { setItems(JSON.parse(saved)); } catch {}
        }
        // 로그인 직후 비회원 카트 → 멤버 카트 명시적 병합 + 응답으로 화면 동기화
        void (async () => {
          const result = await syncCartAfterLogin();
          if (result.status === "merged" && result.cart) {
            const cartResponse = result.cart;
            setItems((prev) => mergeServerCart(prev, cartResponse));
          }
        })();
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

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
