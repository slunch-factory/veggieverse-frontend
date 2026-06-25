"use client";

import { Skeleton } from "@/components/ui/Skeleton";

// SubscribeShell과 동일한 높이 계산 — 스켈레톤이 같은 영역을 채워 레이아웃 점프 방지.
const SHELL_HEIGHT = "calc(100dvh - var(--header-area-h, var(--header-h, 64px)))";

function MealCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square">
        <Skeleton width="100%" height="100%" radius={8} />
      </div>
      <Skeleton width="85%" height={12} />
      <Skeleton width="55%" height={10} />
    </div>
  );
}

/** 좌측 메뉴 카탈로그 스켈레톤 — 필터 칩 + 메뉴 그리드 */
function MenuColumnSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={64} height={30} radius="var(--r-pill)" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <MealCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** 우측 플래너(캘린더 + 체크아웃 바) 스켈레톤 */
function PlannerColumnSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton width={140} height={20} />
          <Skeleton width={90} height={30} radius="var(--r-btn)" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-center">
            <Skeleton width={48} height={48} radius="var(--r-btn)" />
            <Skeleton width="100%" height={56} radius="var(--r-btn)" />
          </div>
        ))}
      </div>
      <div className="shrink-0 border-t border-black p-4 flex items-center justify-between">
        <Skeleton width={120} height={22} />
        <Skeleton width={140} height={44} radius="var(--r-btn)" />
      </div>
    </div>
  );
}

/** 구독 플래너 로딩 스켈레톤 — SubscribeShell 2열 레이아웃을 모사. */
export function PlannerSkeleton() {
  return (
    <div
      className="subscribe-shell w-full border-t border-black"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">구독 플래너를 불러오는 중</span>

      {/* 데스크톱 (lg+): 2열 그리드 */}
      <div
        className="hidden lg:grid"
        style={{ gridTemplateColumns: "1fr 440px", height: SHELL_HEIGHT }}
      >
        <div className="border-r border-black overflow-hidden bg-[#fcfaf8]">
          <MenuColumnSkeleton />
        </div>
        <div className="bg-[#fcfaf8] overflow-hidden">
          <PlannerColumnSkeleton />
        </div>
      </div>

      {/* 모바일 (<lg): 캘린더만 */}
      <div className="flex lg:hidden flex-col" style={{ height: SHELL_HEIGHT }}>
        <div className="flex-1 min-h-0 overflow-hidden bg-[#fcfaf8]">
          <PlannerColumnSkeleton />
        </div>
      </div>
    </div>
  );
}
