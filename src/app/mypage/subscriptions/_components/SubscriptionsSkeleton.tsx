"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * 구독 카드 1개 모양의 스켈레톤.
 * SubscriptionCard(헤더: 구독번호·기간·배송주기 + 상태배지 / 상품 리스트 / 합계)와 동일 레이아웃.
 */
function SubscriptionCardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <header
        className="flex items-start justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <div className="min-w-0 flex-1">
          <Skeleton width="30%" height={11} />
          <Skeleton width="60%" height={18} style={{ marginTop: 6 }} />
          <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
        </div>
        <Skeleton width={52} height={22} radius="var(--r-pill)" />
      </header>

      <div className="px-5 py-4 flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} width={`${60 - i * 12}%`} height={13} />
        ))}
      </div>

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--neutral-stone)" }}
      >
        <Skeleton width={120} height={13} />
        <Skeleton width={72} height={18} />
      </div>
    </div>
  );
}

/** 구독 목록 로딩 스켈레톤 — 카드 N개. */
export function SubscriptionsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">구독 내역을 불러오는 중</span>
      {Array.from({ length: count }).map((_, i) => (
        <SubscriptionCardSkeleton key={i} rows={i === 0 ? 2 : 1} />
      ))}
    </div>
  );
}
