"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel, isComingSoon, type StoreProduct } from "@/lib/api/store";

export function ProductCard({ product }: { product: StoreProduct }) {
  const router = useRouter();
  const comingSoon = isComingSoon(product.slug);
  // Sold Out 상품도 상세는 누구나 볼 수 있다(구매 버튼만 상세 안에서 잠금).
  const detailHref = `/store/${product.slug}`;
  // 카테고리 태그(기본값): 분류가 없으면 "기타"로 표시
  const categoryTag = product.categories[0] ? categoryLabel(product.categories[0]) : "기타";
  const images = product.imageUrl ? [product.imageUrl] : [];
  const useSlider = images.length >= 3 && !comingSoon;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const goTo = (idx: number) => {
    const next = ((idx % images.length) + images.length) % images.length;
    setCurrentImageIndex(next);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!useSlider) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragStartX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!useSlider || dragStartX === null) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const delta = e.clientX - dragStartX;
    if (delta > 40) goTo(currentImageIndex - 1);
    else if (delta < -40) goTo(currentImageIndex + 1);
    setDragStartX(null);
  };

  const badgeVariant = product.labels.isNew
    ? "NEW" as const
    : product.labels.isBest
      ? "BEST" as const
      : null;

  const hasDiscount = product.discountRate > 0;

  return (
    <div
      className="card"
      onClick={() => router.push(detailHref)}
    >
      {/* 이미지 영역 */}
      <div
        className="card-img"
        style={{ aspectRatio: "1 / 1" }}
      >
        {images.length > 0 ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ touchAction: "pan-y" }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {useSlider ? (
              <div
                className="flex h-full"
                style={{
                  width: `${images.length * 100}%`,
                  transform: `translateX(-${currentImageIndex * (100 / images.length)}%)`,
                  transition: dragStartX === null ? "transform 0.3s ease-out" : "none",
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative bg-[#F5F5F5]"
                    style={{ flex: "0 0 auto", width: `${100 / images.length}%`, height: "100%" }}
                  >
                    {Math.abs(idx - currentImageIndex) <= 1 && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={images[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
            )}
          </div>
        ) : (
          <span className="text-[13px]" style={{ color: "var(--neutral-stone)" }}>IMG</span>
        )}

        {comingSoon && (
          <>
            {/* 최암색(--ink) 40% 디밍 막 — sticky 탭바(z-30)보다 낮게 둔다 */}
            <div
              className="absolute inset-0 z-[5] pointer-events-none"
              style={{ background: "rgba(37, 10, 0, 0.4)" }}
            />
            {/* 좌상단 SOLD OUT 배지 — 최암색 배경, 탭바(z-30) 아래로 */}
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span
                className="text-[12px] font-bold tracking-[0.1em]"
                style={{
                  color: "var(--bg-white)",
                  background: "var(--ink)",
                  borderRadius: "var(--r-btn)",
                  padding: "6px 12px",
                  boxShadow: "0 2px 8px rgba(37, 10, 0, 0.35)",
                }}
              >
                SOLD OUT
              </span>
            </div>
          </>
        )}

        {badgeVariant && !comingSoon && (
          <div className="card-badges">
            <Badge variant={badgeVariant} />
          </div>
        )}

        {useSlider && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className="border-none cursor-pointer transition-all duration-300"
                style={{
                  width: idx === currentImageIndex ? "8px" : "4px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: idx === currentImageIndex ? "var(--bg-white)" : "rgba(255,255,255,0.5)",
                }}
                aria-label={`이미지 ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="card-body">
        <span
          className="mb-1 inline-block text-[11px] font-semibold tracking-wide"
          style={{ color: "var(--neutral-stone)" }}
        >
          {categoryTag}
        </span>
        <p className="card-name">{product.name}</p>
        {product.tagline && (
          <p className="card-desc">{product.tagline}</p>
        )}
        <div>
          {hasDiscount ? (
            <>
              <p className="card-orig">{product.price.toLocaleString()}원</p>
              <div className="card-price-row">
                <span className="card-discount">{product.discountRate}%</span>
                <span className="card-price">{product.discountedPrice.toLocaleString()}원</span>
              </div>
            </>
          ) : (
            <span className="card-price">{product.discountedPrice.toLocaleString()}원</span>
          )}
        </div>
      </div>
    </div>
  );
}
