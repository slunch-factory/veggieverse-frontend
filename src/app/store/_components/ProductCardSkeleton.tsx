"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * ProductCard와 동일한 레이아웃(이미지·담기 버튼·카테고리·이름·설명·가격)의 스켈레톤.
 * 정렬/필터 전환 중 화면을 어둡게 덮는 대신 이걸 그리드에 채워 로딩을 표현한다.
 */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      {/* 이미지 (1:1) */}
      <Skeleton
        width="100%"
        height="auto"
        radius="var(--r-btn)"
        style={{ aspectRatio: "1 / 1" }}
      />
      {/* 담기 버튼 자리 */}
      <Skeleton width="100%" height={37} radius="var(--r-btn)" style={{ marginTop: 10 }} />
      {/* 상품 정보 */}
      <div className="flex flex-col gap-2 pt-3.5">
        <Skeleton width={44} height={11} />
        <Skeleton width="65%" height={15} />
        <Skeleton width="88%" height={13} />
        <Skeleton width={92} height={18} style={{ marginTop: 4 }} />
      </div>
    </div>
  );
}
