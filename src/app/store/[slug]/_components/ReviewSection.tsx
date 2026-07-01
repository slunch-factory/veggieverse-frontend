"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, Camera } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import {
  getProductReviews,
  summarizeReviews,
  type ProductReview,
} from "@/app/store/_data/reviews";

const PAGE_SIZE = 3;

type SortKey = "helpful" | "recent";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "helpful", label: "추천순" },
  { key: "recent", label: "최신순" },
];

/**
 * 상품상세 "리뷰" 탭 본문 — 평점 요약(평균·분포) + 정렬/포토 필터 + 리뷰 카드 목록.
 * 현재는 목 데이터(`getProductReviews`) 기반. 백엔드 연동(#86) 시 데이터 소스만 교체.
 */
export function ReviewSection({ slug }: { slug: string }) {
  const reviews = getProductReviews(slug);
  const summary = summarizeReviews(reviews);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [sort, setSort] = useState<SortKey>("helpful");
  const [photoOnly, setPhotoOnly] = useState(false);

  // 포토 필터 → 정렬(추천순=도움순, 최신순=날짜 내림차순).
  // (React Compiler가 자동 메모이즈 — 수동 useMemo 불필요)
  const filtered = photoOnly
    ? reviews.filter((r) => r.images && r.images.length > 0)
    : reviews;
  const ordered = [...filtered].sort((a, b) =>
    sort === "helpful" ? b.helpful - a.helpful : b.createdAt.localeCompare(a.createdAt),
  );

  // 전체 리뷰 사진 모음(요약과 정렬 사이 갤러리 스트립용).
  const allPhotos = reviews.flatMap((r) =>
    (r.images ?? []).map((src, idx) => ({ key: `${r.id}-${idx}`, src, author: r.author })),
  );

  // 정렬/필터를 바꾸면 더보기 페이지를 처음으로 되돌린다.
  const resetAnd = (fn: () => void) => {
    fn();
    setVisible(PAGE_SIZE);
  };

  if (reviews.length === 0) {
    return (
      <div
        className="p-6 text-center t-small"
        style={{
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-btn)",
          background: "var(--bg-white)",
          color: "var(--neutral-stone)",
        }}
      >
        아직 작성된 리뷰가 없습니다.
      </div>
    );
  }

  const shown = ordered.slice(0, visible);

  return (
    <div className="flex flex-col gap-4">
      {/* 평점 요약 */}
      <div
        className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-8"
        style={{
          border: "1px solid var(--ink)",
          borderRadius: "var(--r-btn)",
          background: "var(--bg-white)",
        }}
      >
        {/* 평균 */}
        <div className="flex flex-col items-center justify-center gap-1 sm:w-40 sm:flex-shrink-0">
          <span className="t-h1" style={{ color: "var(--ink)", lineHeight: 1 }}>
            {summary.average.toFixed(1)}
          </span>
          <StarRating value={summary.average} size={18} />
          <span className="t-caption" style={{ color: "var(--ink-light)" }}>
            리뷰 {summary.count}개
          </span>
        </div>

        {/* 분포 막대 */}
        <div className="flex flex-1 flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((score) => {
            const n = summary.distribution[score] ?? 0;
            const pct = summary.count === 0 ? 0 : Math.round((n / summary.count) * 100);
            return (
              <div key={score} className="flex items-center gap-2">
                <span
                  className="t-caption flex-shrink-0"
                  style={{ color: "var(--ink-light)", width: 28 }}
                >
                  {score}점
                </span>
                <div
                  className="h-1.5 flex-1 overflow-hidden"
                  style={{ background: "var(--bg-off)", borderRadius: 999 }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: "var(--ink)",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <span
                  className="t-caption flex-shrink-0 text-right"
                  style={{ color: "var(--ink-light)", width: 24 }}
                >
                  {n}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 전체 사진 모아보기 — 요약과 정렬 사이 갤러리 스트립 */}
      {allPhotos.length > 0 && (
        <div
          className="flex flex-col gap-2 p-4"
          style={{
            border: "1px solid var(--neutral-stone)",
            borderRadius: "var(--r-btn)",
            background: "var(--bg-white)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 t-small" style={{ color: "var(--ink)" }}>
              <Camera size={14} />
              사진 모아보기 {allPhotos.length}
            </span>
            <button
              type="button"
              onClick={() => resetAnd(() => setPhotoOnly((v) => !v))}
              className="t-caption"
              style={{ color: "var(--ink-light)", fontWeight: photoOnly ? 700 : 400 }}
            >
              {photoOnly ? "전체 리뷰 보기" : "포토 리뷰만 보기"}
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {allPhotos.map((photo) => (
              <button
                key={photo.key}
                type="button"
                onClick={() => resetAnd(() => setPhotoOnly(true))}
                aria-label={`${photo.author}님의 리뷰 사진`}
                className="relative flex-shrink-0 overflow-hidden"
                style={{
                  width: 80,
                  height: 80,
                  border: "1px solid var(--neutral-stone)",
                  borderRadius: "var(--r-btn)",
                  background: "var(--bg-off)",
                }}
              >
                <Image
                  src={photo.src}
                  alt={`${photo.author} 리뷰 사진`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 정렬 */}
      <div className="flex items-center gap-3">
        {SORTS.map((s) => {
          const active = sort === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => resetAnd(() => setSort(s.key))}
              className="t-small"
              style={{
                color: active ? "var(--ink)" : "var(--neutral-stone)",
                fontWeight: active ? 700 : 400,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* 리뷰 카드 목록 */}
      <div className="flex flex-col gap-3">
        {shown.length > 0 ? (
          shown.map((review) => <ReviewCard key={review.id} review={review} />)
        ) : (
          <div
            className="p-6 text-center t-small"
            style={{
              border: "1px solid var(--neutral-stone)",
              borderRadius: "var(--r-btn)",
              background: "var(--bg-white)",
              color: "var(--neutral-stone)",
            }}
          >
            조건에 맞는 리뷰가 없습니다.
          </div>
        )}
      </div>

      {/* 더보기 */}
      {visible < ordered.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="btn btn-ghost btn-md w-full"
          style={{ border: "1px solid var(--ink)" }}
        >
          리뷰 더보기 ({ordered.length - visible})
        </button>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  // 좋아요(도움이 됨) — 1차는 로컬 토글 mock. 백엔드 연동(#86) 시 실제 카운트로 교체.
  const [liked, setLiked] = useState(false);
  const helpfulCount = review.helpful + (liked ? 1 : 0);

  return (
    <div
      className="p-5"
      style={{
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
        background: "var(--bg-white)",
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="t-small" style={{ color: "var(--ink)" }}>
            {review.author}
          </span>
          <StarRating value={review.rating} size={13} />
        </div>
        <span className="t-caption" style={{ color: "var(--ink-light)" }}>
          {review.createdAt}
        </span>
      </div>

      <p className="t-small" style={{ color: "var(--ink)", lineHeight: 1.6 }}>
        {review.content}
      </p>

      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.images.map((src, i) => (
            <div
              key={i}
              className="overflow-hidden"
              style={{
                width: 72,
                height: 72,
                border: "1px solid var(--neutral-stone)",
                borderRadius: "var(--r-btn)",
                background: "var(--bg-off)",
              }}
            >
              <Image
                src={src}
                alt={`${review.author} 리뷰 이미지 ${i + 1}`}
                width={72}
                height={72}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setLiked((v) => !v)}
        aria-pressed={liked}
        aria-label="이 리뷰가 도움이 됐어요"
        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 t-caption transition-colors"
        style={{
          border: `1px solid ${liked ? "var(--ink)" : "var(--neutral-stone)"}`,
          borderRadius: 999,
          color: liked ? "var(--ink)" : "var(--ink-light)",
          background: liked ? "var(--bg-off)" : "transparent",
          fontWeight: liked ? 700 : 400,
        }}
      >
        <ThumbsUp size={13} fill={liked ? "currentColor" : "none"} />
        {helpfulCount}
      </button>
    </div>
  );
}
