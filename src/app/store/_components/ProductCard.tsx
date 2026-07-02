"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { WishlistButton } from "@/components/ui/WishlistButton";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/contexts/CartContext";
import { addCartItem } from "@/lib/api/cart";
import { categoryLabel, isStockSoldOut, type StoreProduct } from "@/lib/api/store";

/** 그리드 상단(첫 행) 카드의 대표 이미지는 LCP 대상 → priority로 preload. */
const PRODUCT_CARD_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const router = useRouter();
  const { addItem } = useCart();
  const toast = useToast();
  const [cartLoading, setCartLoading] = useState(false);
  // 품절 = 실제 재고 SOLD_OUT. SOLD OUT 디자인(디밍 + 배지)으로 표시.
  const soldOut = isStockSoldOut(product.stock);
  // 품절임박 — 품절이 아닐 때만. (재고 LOW_STOCK)
  const lowStock = !soldOut && product.stock?.status === "LOW_STOCK";
  // Sold Out 상품도 상세는 누구나 볼 수 있다(구매 버튼만 상세 안에서 잠금).
  const detailHref = `/store/${product.slug}`;
  // 카테고리 태그(기본값): 분류가 없으면 "기타"로 표시
  const categoryTag = product.categories[0] ? categoryLabel(product.categories[0]) : "기타";
  const images = product.imageUrl ? [product.imageUrl] : [];
  const useSlider = images.length >= 3 && !soldOut;

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

  // 담기 — 상세 페이지와 동일하게 백엔드 카트 반영 후 화면 카트 갱신 (수량 1 고정)
  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (soldOut || cartLoading) return;
    setCartLoading(true);
    try {
      await addCartItem(product.productId, 1);
      addItem({
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        price: product.price,
        discountRate: product.discountRate,
        discountedPrice: product.discountedPrice,
        imageUrl: product.imageUrl,
      }, 1);
      toast.success("장바구니에 담았어요.", { emoji: "🛒", detail: product.name });
    } catch (err) {
      console.error("[addCartItem] failed:", err);
      toast.error("장바구니 담기에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setCartLoading(false);
    }
  }

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
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        sizes={PRODUCT_CARD_SIZES}
                        className="object-cover"
                        priority={priority && idx === 0}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Image
                src={images[0]}
                alt={product.name}
                fill
                sizes={PRODUCT_CARD_SIZES}
                className="object-cover"
                priority={priority}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
            )}
          </div>
        ) : (
          <span className="text-[13px]" style={{ color: "var(--neutral-stone)" }}>IMG</span>
        )}

        {soldOut && (
          <>
            {/* 최암색(--ink) 디밍 막 — sticky 탭바(z-30)보다 낮게 둔다 */}
            <div
              className="absolute inset-0 z-[5] pointer-events-none"
              style={{ background: "rgba(37, 10, 0, 0.25)" }}
            />
            {/* 좌상단 SOLD OUT 배지 — BEST 배지(10px)와 동일 폰트 크기, 탭바(z-30) 아래로 */}
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <span
                className="text-[10px] font-bold tracking-[0.04em]"
                style={{
                  color: "var(--bg-white)",
                  background: "var(--ink)",
                  borderRadius: "var(--r-btn)",
                  padding: "4px 8px",
                  boxShadow: "0 2px 8px rgba(37, 10, 0, 0.35)",
                }}
              >
                SOLD OUT
              </span>
            </div>
          </>
        )}

        {/* 품절임박 — 우상단. NEW/BEST(좌상단 .card-badges)와 겹치지 않도록 분리. */}
        {lowStock && (
          <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
            <span
              className="text-[10px] font-bold tracking-[0.04em]"
              style={{
                color: "var(--bg-white)",
                background: "var(--alert-red)",
                borderRadius: "var(--r-btn)",
                padding: "4px 8px",
                boxShadow: "0 2px 8px rgba(37, 10, 0, 0.25)",
              }}
            >
              품절임박
            </span>
          </div>
        )}

        {badgeVariant && !soldOut && (
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

        {/* 찜(위시리스트) — 우하단 */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <WishlistButton
            size={16}
            item={{
              key: `store:${product.slug}`,
              kind: "store",
              name: product.name,
              imageUrl: product.imageUrl,
              href: detailHref,
              price: product.price,
              discountedPrice: product.discountedPrice,
              discountRate: product.discountRate,
              tagline: product.tagline,
            }}
          />
        </div>
      </div>

      {/* 담기 — 이미지 바로 아래 (컬리 스타일) */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={soldOut || cartLoading}
        className="mt-2.5 flex w-full cursor-pointer items-center justify-center gap-1.5 border border-[rgba(26,10,5,0.2)] bg-white py-2 text-[13px] text-black transition-colors hover:border-black hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[rgba(26,10,5,0.2)] disabled:hover:bg-white disabled:hover:text-black"
        style={{ borderRadius: "var(--r-btn)" }}
      >
        <ShoppingCart size={14} strokeWidth={1.5} />
        {soldOut ? "품절" : "담기"}
      </button>

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
