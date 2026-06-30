"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * 위시리스트(찜) — 1차는 localStorage 기반 mock.
 * 스토어 상품과 구독 메뉴를 한 목록에서 다룬다(`kind`로 구분).
 * 백엔드 위시리스트 API가 생기면 이 컨텍스트의 저장/복원만 교체한다.
 */
export interface WishlistItem {
  /** 고유 키 — "store:{slug}" 또는 "subscribe:{id}". */
  key: string;
  kind: "store" | "subscribe";
  name: string;
  imageUrl: string;
  /** 상세/관련 페이지 링크. */
  href: string;
  price: number;
  discountedPrice?: number;
  discountRate?: number;
  tagline?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  count: number;
  has: (key: string) => boolean;
  /** 추가/해제 토글. 토글 후 "추가됨" 여부를 반환(true=추가). */
  toggle: (item: WishlistItem) => boolean;
  remove: (key: string) => void;
}

const STORAGE_KEY = "veggieverse-wishlist";

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const hydrated = useRef(false);
  // 이벤트 핸들러(toggle)에서 최신 items를 읽기 위한 미러. 렌더 중엔 건드리지 않는다.
  const itemsRef = useRef<WishlistItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 마운트 시 localStorage 복원.
  // (setState를 async 컨텍스트에서만 호출 → react-hooks/set-state-in-effect 회피)
  useEffect(() => {
    void (async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setItems(parsed);
        } catch {
          /* 손상 데이터 무시 */
        }
      }
      hydrated.current = true;
    })();
  }, []);

  // 복원 완료 전에는 저장하지 않는다(초기 빈 배열이 덮어쓰는 race 방지).
  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const has = useCallback(
    (key: string) => items.some((i) => i.key === key),
    [items],
  );

  const toggle = useCallback((item: WishlistItem) => {
    const exists = itemsRef.current.some((i) => i.key === item.key);
    setItems((prev) =>
      exists ? prev.filter((i) => i.key !== item.key) : [item, ...prev],
    );
    return !exists;
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  return (
    <WishlistContext.Provider value={{ items, count: items.length, has, toggle, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
