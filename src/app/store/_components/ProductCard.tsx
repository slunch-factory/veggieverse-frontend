"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { getProductThumbnailImages } from "@/utils/productImages";
import type { Product } from "../_data/products";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const rawImages = getProductThumbnailImages(product.id);
  const images = rawImages.length >= 3 ? rawImages.slice(0, 5) : rawImages.length > 0 ? [rawImages[0]] : [];
  const useSlider = images.length >= 3;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  useEffect(() => {
    setLoadedImages([]);
    setCurrentImageIndex(0);
  }, [product.id]);

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

  const handleImageClick = (e: React.MouseEvent) => {
    if (useSlider) {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const badgeVariant = product.soldOut
    ? "SOLD_OUT" as const
    : product.isNew
      ? "NEW" as const
      : null;

  const discountRate =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      className={`menu-card cursor-pointer ${product.soldOut ? "soldout" : ""}`}
      onClick={() => router.push(`/store/product/${product.id}`)}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-square bg-[#F5F5F5] rounded-[4px] overflow-hidden">
        {images.length > 0 ? (
          <div
            className="relative w-full h-full overflow-hidden"
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
                    key={`${product.id}-${idx}`}
                    className="relative bg-[#F5F5F5]"
                    style={{ flex: "0 0 auto", width: `${100 / images.length}%`, height: "100%" }}
                    onClick={handleImageClick}
                  >
                    {Math.abs(idx - currentImageIndex) <= 1 && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onLoad={() => {
                          if (!loadedImages.includes(img)) setLoadedImages((prev) => [...prev, img]);
                        }}
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
                onLoad={() => {
                  if (!loadedImages.includes(images[0])) setLoadedImages((prev) => [...prev, images[0]]);
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5] text-[13px] text-[var(--gray-lighter)]">
            IMG
          </div>
        )}

        {badgeVariant && (
          <div className="absolute top-2 left-2 z-20">
            <Badge variant={badgeVariant} />
          </div>
        )}

        {useSlider && !product.soldOut && (
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
                  backgroundColor: idx === currentImageIndex ? "var(--white-pure)" : "rgba(255,255,255,0.5)",
                }}
                aria-label={`이미지 ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {product.soldOut && (
          <div className="absolute inset-0 bg-black/50 z-[15]" />
        )}
      </div>

      {/* 상품 정보 */}
      <div className="menu-card-content pt-4">
        <h3 className="menu-card-title text-[15px] leading-[1.3] mb-2" style={{ color: product.soldOut ? "var(--gray)" : "#000" }}>
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[13px] text-[#6B6B6B] leading-[1.5] mb-3 overflow-hidden text-ellipsis whitespace-nowrap">
            {product.description}
          </p>
        )}
        <div>
          {product.originalPrice && product.originalPrice > product.price ? (
            <>
              <p className="text-[13px] text-[var(--gray-light)] line-through m-0 mb-1">
                {product.originalPrice.toLocaleString()}원
              </p>
              <div className="flex items-center gap-2">
                {discountRate && discountRate > 0 && (
                  <span className="text-[16px]" style={{ color: "#87b5e1" }}>{discountRate}%</span>
                )}
                <span className="text-[16px]" style={{ color: product.soldOut ? "var(--gray)" : "var(--black)" }}>
                  {product.price.toLocaleString()}원
                </span>
              </div>
            </>
          ) : (
            <span className="text-[16px]" style={{ color: product.soldOut ? "var(--gray)" : "var(--black)" }}>
              {product.price.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
