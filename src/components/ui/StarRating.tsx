"use client";

import { Star } from "lucide-react";

/**
 * 공용 별점 표시/입력 프리미티브.
 * - `onChange` 미지정 → 읽기 전용 표시(상품상세 평점·리뷰 카드).
 * - `onChange` 지정 → 입력 모드(리뷰 작성 모달). 별을 클릭/키보드로 선택.
 *
 * 색상은 디자인 토큰(`--ink` 채움 / `--neutral-stone` 빈 별)을 사용한다.
 */
export interface StarRatingProps {
  /** 현재 평점 (0~max). */
  value: number;
  /** 별 개수. 기본 5. */
  max?: number;
  /** 별 크기(px). 기본 14. */
  size?: number;
  /** 채운 별 색상. 기본 var(--ink). */
  fillColor?: string;
  /** 빈 별 색상. 기본 var(--neutral-stone). */
  emptyColor?: string;
  /** 지정 시 입력 모드. 클릭한 별점(1~max)을 콜백한다. */
  onChange?: (value: number) => void;
  /** 입력 모드 접근성 라벨. 기본 "별점 선택". */
  ariaLabel?: string;
  className?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 14,
  fillColor = "var(--ink)",
  emptyColor = "var(--neutral-stone)",
  onChange,
  ariaLabel = "별점 선택",
  className,
}: StarRatingProps) {
  const interactive = typeof onChange === "function";

  const stars = Array.from({ length: max }).map((_, i) => {
    const filled = i < Math.round(value);
    const star = (
      <Star
        size={size}
        strokeWidth={1.5}
        fill={filled ? fillColor : "transparent"}
        color={filled ? fillColor : emptyColor}
      />
    );

    if (!interactive) {
      return (
        <span key={i} className="inline-flex">
          {star}
        </span>
      );
    }

    return (
      <button
        key={i}
        type="button"
        onClick={() => onChange?.(i + 1)}
        aria-label={`${i + 1}점`}
        className="inline-flex cursor-pointer"
        style={{ background: "transparent", border: "none", padding: 1 }}
      >
        {star}
      </button>
    );
  });

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className ?? ""}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? ariaLabel : `별점 ${value}점 (5점 만점)`}
    >
      {stars}
    </div>
  );
}
