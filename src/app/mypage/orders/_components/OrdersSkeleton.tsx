"use client";

import { Skeleton } from "../../_components/Skeleton";

/**
 * 주문 카드 1개 모양의 스켈레톤.
 * OrderCard(헤더 + 상품 리스트 + 합계)와 동일한 레이아웃·여백을 따라가
 * 로딩→실데이터 전환 시 레이아웃 점프를 막는다.
 */
function OrderCardSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      {/* 헤더: 주문번호·날짜 / 상태 배지 */}
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <div className="min-w-0 flex-1">
          <Skeleton width="48%" height={13} />
          <Skeleton width="28%" height={11} style={{ marginTop: 7 }} />
        </div>
        <Skeleton width={56} height={22} radius="var(--r-pill)" />
      </header>

      {/* 상품 리스트: 썸네일 + 이름 */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton width={44} height={44} radius="var(--r-btn)" />
            <Skeleton width={`${55 - i * 12}%`} height={13} />
          </div>
        ))}
      </div>

      {/* 합계 */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--neutral-stone)" }}
      >
        <Skeleton width={84} height={13} />
        <Skeleton width={72} height={18} />
      </div>
    </div>
  );
}

/** 주문 목록 로딩 스켈레톤 — 카드 N개. */
export function OrdersSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">주문 내역을 불러오는 중</span>
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} rows={i === 0 ? 2 : 1} />
      ))}
    </div>
  );
}
