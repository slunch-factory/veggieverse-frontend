"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export interface CarouselImage {
  url: string;
  altText?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  /** 메인 슬라이드 렌더러. 호출측이 실제 <img>/<MealImage> 등을 직접 제어한다. */
  renderImage: (image: CarouselImage, index: number) => ReactNode;
  /** 메인 프레임에 적용할 클래스. 점 인디케이터 배치를 위해 relative 가 포함되어야 한다. */
  frameClassName?: string;
  frameStyle?: CSSProperties;
  /** 하단 썸네일 스트립 노출 여부 (기본 false — 점 인디케이터만) */
  showThumbnails?: boolean;
  /** images 가 비어 있을 때 표시할 라벨 */
  emptyLabel?: string;
  /** 래퍼 클래스 */
  className?: string;
}

/**
 * 여러 장의 이미지를 점 인디케이터 + (선택) 썸네일 스트립으로 보여주는 공용 캐러셀.
 * 이미지가 1장이면 인디케이터/썸네일 없이 그 1장만 렌더한다.
 * 실제 이미지 엘리먼트는 renderImage 로 주입받아 스토어(plain img)·구독(MealImage) 양쪽에서 재사용한다.
 */
export function ImageCarousel({
  images,
  renderImage,
  frameClassName = "relative aspect-square w-full overflow-hidden",
  frameStyle,
  showThumbnails = false,
  emptyLabel = "이미지 준비 중",
  className,
}: ImageCarouselProps) {
  const [mainIdx, setMainIdx] = useState(0);
  const idx = Math.min(mainIdx, Math.max(0, images.length - 1));
  const current = images[idx];

  return (
    <div className={className}>
      <div className={frameClassName} style={frameStyle}>
        {current ? (
          renderImage(current, idx)
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>
              {emptyLabel}
            </span>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMainIdx(i)}
                className={`h-2 w-2 rounded-full transition-colors ${i === idx ? "bg-black" : "bg-white/70"}`}
                aria-label={`이미지 ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {showThumbnails && images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMainIdx(i)}
              className="relative h-16 w-16 flex-shrink-0 overflow-hidden transition-colors"
              style={{
                borderRadius: "var(--r-btn)",
                border: `2px solid ${i === idx ? "var(--ink)" : "var(--neutral-stone)"}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.altText ?? ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
