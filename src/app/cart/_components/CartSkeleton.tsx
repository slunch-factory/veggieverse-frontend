"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 장바구니 아이템 카드 1개 모양의 스켈레톤.
 * cart/page.tsx의 상품 카드(체크박스 + 72px 썸네일 + 정보/수량/가격)와 같은 레이아웃.
 */
function CartItemSkeleton() {
  return (
    <div
      className="flex gap-3 p-4"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--neutral-stone)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <Skeleton width={18} height={18} radius={4} style={{ marginTop: 4 }} />
      <Skeleton width={72} height={72} radius="var(--r-btn)" />
      <div className="flex-1 min-w-0">
        <Skeleton width="60%" height={15} />
        <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
        <div className="flex items-center justify-between mt-4">
          <Skeleton width={94} height={30} radius="var(--r-btn)" />
          <Skeleton width={64} height={15} />
        </div>
      </div>
    </div>
  );
}

/** 장바구니 서버 동기화 중 로딩 스켈레톤 — 진입 시 '비어있음' 깜빡임 방지. */
export function CartSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      <div className="mx-auto max-w-5xl px-4 py-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">장바구니를 불러오는 중</span>
        <Skeleton width={48} height={13} style={{ marginBottom: 24 }} />
        <Skeleton width={120} height={28} style={{ marginBottom: 32 }} />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <CartItemSkeleton key={i} />
            ))}
          </div>
          <div className="lg:w-64 flex-shrink-0">
            <div
              className="p-5 flex flex-col gap-4"
              style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
            >
              <Skeleton width={80} height={17} />
              <Skeleton width="100%" height={13} />
              <Skeleton width="100%" height={13} />
              <Skeleton width="100%" height={44} radius="var(--r-btn)" style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
