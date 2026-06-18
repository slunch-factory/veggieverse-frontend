"use client";

import type { CSSProperties } from "react";

/**
 * shimmer 스켈레톤 박스 — 마이페이지 비동기 카드 로딩 표시.
 * globals.css의 `.mp-skeleton`(shimmer 애니메이션)을 사용한다.
 */
export function Skeleton({
  width,
  height = 14,
  radius = 6,
  className = "",
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`mp-skeleton block ${className}`}
      style={{ width: width ?? "100%", height, borderRadius: radius, ...style }}
    />
  );
}

/** 최근 구독/주문 리스트 행 1개 모양의 스켈레톤 */
export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <Skeleton width="55%" height={13} />
        <Skeleton width="35%" height={11} style={{ marginTop: 7 }} />
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Skeleton width={52} height={18} radius="var(--r-pill)" />
        <Skeleton width={64} height={13} />
      </div>
    </div>
  );
}
