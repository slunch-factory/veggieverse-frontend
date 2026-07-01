"use client";

import { Skeleton } from "./Skeleton";

/**
 * 마이페이지 상세(주문 상세·구독 상세) 공용 로딩 스켈레톤.
 * 백 링크 + 헤더(제목·번호·일시) + 섹션 카드(썸네일 행) 레이아웃을 모사.
 */
export function DetailSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <div className="mx-auto max-w-[720px]" aria-busy="true" aria-live="polite">
      <span className="sr-only">불러오는 중</span>

      {/* 백 링크 */}
      <Skeleton width={72} height={14} style={{ marginBottom: 24 }} />

      {/* 헤더 */}
      <div className="mb-8">
        <Skeleton width={140} height={26} />
        <Skeleton width="45%" height={13} style={{ marginTop: 10 }} />
        <Skeleton width="30%" height={11} style={{ marginTop: 6 }} />
      </div>

      {/* 섹션 카드 */}
      {Array.from({ length: sections }).map((_, s) => (
        <div
          key={s}
          className="mb-4"
          style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
        >
          <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--neutral-stone)" }}>
            <Skeleton width={90} height={12} />
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton width={56} height={56} radius="var(--r-btn)" />
                <div className="flex-1 min-w-0">
                  <Skeleton width="55%" height={13} />
                  <Skeleton width="30%" height={11} style={{ marginTop: 6 }} />
                </div>
                <Skeleton width={64} height={13} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
