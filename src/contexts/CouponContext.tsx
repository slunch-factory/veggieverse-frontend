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
 * 쿠폰 발급 상태 — 1차는 localStorage 기반 mock.
 * 발급받은 쿠폰 "코드"만 저장하고, 코드→상세는 _data/coupons.ts 카탈로그에서 조회한다.
 * 백엔드 쿠폰 API가 생기면 이 컨텍스트의 저장/복원만 교체한다.
 */
interface CouponContextType {
  claimedCodes: string[];
  count: number;
  isClaimed: (code: string) => boolean;
  /** 발급. 이미 발급됐으면 false, 새로 발급되면 true 반환. */
  claim: (code: string) => boolean;
}

const STORAGE_KEY = "veggieverse-coupons";

const CouponContext = createContext<CouponContextType | null>(null);

export function CouponProvider({ children }: { children: ReactNode }) {
  const [claimedCodes, setClaimedCodes] = useState<string[]>([]);
  const hydrated = useRef(false);
  const codesRef = useRef<string[]>([]);
  useEffect(() => {
    codesRef.current = claimedCodes;
  }, [claimedCodes]);

  useEffect(() => {
    void (async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setClaimedCodes(parsed);
        } catch {
          /* 손상 데이터 무시 */
        }
      }
      hydrated.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(claimedCodes));
  }, [claimedCodes]);

  const isClaimed = useCallback(
    (code: string) => claimedCodes.includes(code),
    [claimedCodes],
  );

  const claim = useCallback((code: string) => {
    if (codesRef.current.includes(code)) return false;
    setClaimedCodes((prev) => (prev.includes(code) ? prev : [code, ...prev]));
    return true;
  }, []);

  return (
    <CouponContext.Provider value={{ claimedCodes, count: claimedCodes.length, isClaimed, claim }}>
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponContext);
  if (!ctx) throw new Error("useCoupons must be used within CouponProvider");
  return ctx;
}
