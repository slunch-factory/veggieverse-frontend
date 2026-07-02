import { Skeleton } from "@/components/ui/Skeleton";

/**
 * /store/[slug] 진입 시 서버가 상품을 불러오는 동안 보여주는 스켈레톤.
 * 상세 페이지(뒤로가기 · 좌 이미지 갤러리 · 우 상품 정보 2단)와 동일한
 * 레이아웃·여백을 따라가 로딩→실데이터 전환 시 점프를 막는다.
 */
export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg-pale)]">
      {/* back nav 자리 */}
      <div className="mx-auto max-w-6xl px-4 py-3">
        <Skeleton width={64} height={16} />
      </div>

      {/* main two-col */}
      <div className="mx-auto max-w-6xl px-4 pb-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT: 이미지 갤러리 */}
        <div className="w-full lg:w-1/2">
          <Skeleton
            width="100%"
            height="auto"
            radius="var(--r-btn)"
            style={{ aspectRatio: "1 / 1" }}
          />
          {/* 썸네일 줄 */}
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width={64} height={64} radius="var(--r-btn)" />
            ))}
          </div>
        </div>

        {/* RIGHT: 상품 정보 */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <Skeleton width={52} height={22} radius="var(--r-pill)" />
          <Skeleton width="70%" height={28} style={{ marginTop: 14 }} />
          <Skeleton width="90%" height={15} style={{ marginTop: 10 }} />
          <Skeleton width={140} height={26} style={{ marginTop: 18 }} />

          <div
            className="mt-6 pt-6 flex flex-col gap-3"
            style={{ borderTop: "1px solid var(--neutral-stone)" }}
          >
            <Skeleton width="100%" height={48} radius="var(--r-btn)" />
            <Skeleton width="100%" height={48} radius="var(--r-btn)" />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Skeleton width={96} height={36} radius="var(--r-btn)" />
            <Skeleton width={120} height={24} />
          </div>

          <div className="mt-4 flex gap-3">
            <Skeleton width="50%" height={52} radius="var(--r-btn)" />
            <Skeleton width="50%" height={52} radius="var(--r-btn)" />
          </div>
        </div>
      </div>

      {/* 하단 탭바 + 섹션 자리 */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div
          className="flex gap-8 py-3"
          style={{ borderBottom: "1px solid var(--neutral-stone)" }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={72} height={16} />
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Skeleton width="40%" height={15} />
          <Skeleton width="85%" height={13} />
          <Skeleton width="72%" height={13} />
        </div>
      </div>
    </div>
  );
}
