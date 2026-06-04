"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronUp,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Truck,
  Info,
  X,
} from "lucide-react";
import type { StoreProductDetail } from "@/lib/api/store";
import { useCart } from "@/contexts/CartContext";
import { addCartItem } from "@/lib/api/cart";
import { useRouter } from "next/navigation";
import { ProductDetailTemplate } from "./ProductDetailTemplate";
import { PRODUCT_TEMPLATE_DATA, parseDescTemplate } from "../_data/templateData";

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: "review",  label: "리뷰" },
  { key: "detail",  label: "상세정보" },
  { key: "return",  label: "반품/교환정보" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProductDetailClient({ product }: { product: StoreProductDetail }) {
  const allImages = [product.images.main, ...product.images.subs, ...product.images.details];
  const { addItem } = useCart();
  const router = useRouter();

  const [mainIdx, setMainIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);

  async function handleAddToCart() {
    if (cartLoading) return;
    setCartLoading(true);
    try {
      await addCartItem(product.productId, quantity);
      addItem({
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        price: product.price,
        discountRate: product.discountRate,
        discountedPrice: product.discountedPrice,
        imageUrl: product.images.main.url,
      }, quantity);
      setShowCartPopup(true);
    } catch (err) {
      console.error("[addCartItem] failed:", err);
    } finally {
      setCartLoading(false);
    }
  }

  function handleBuyNow() {
    sessionStorage.setItem(
      "directBuyItem",
      JSON.stringify({
        productId: product.productId,
        slug: product.slug,
        name: product.name,
        tagline: product.tagline,
        price: product.price,
        discountRate: product.discountRate,
        discountedPrice: product.discountedPrice,
        imageUrl: product.images.main.url,
        quantity,
      }),
    );
    router.push("/order?directBuy=true");
  }
  const [activeTab, setActiveTab] = useState<TabKey>("review");
  const [tabSticky, setTabSticky] = useState(false);

  const sectionRefs = useRef<Record<TabKey, HTMLDivElement | null>>({
    review: null, detail: null, return: null,
  });
  const tabBarRef = useRef<HTMLDivElement | null>(null);
  const tabSentinelRef = useRef<HTMLDivElement | null>(null);
  const headerHRef = useRef(92);

  useEffect(() => {
    const update = () => {
      const el = document.querySelector<HTMLElement>(".scroll-lock-compensate");
      if (el) headerHRef.current = el.offsetHeight;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (tabSentinelRef.current) {
        setTabSticky(
          tabSentinelRef.current.getBoundingClientRect().top <= headerHRef.current
        );
      }
      const tabBarH = tabBarRef.current?.offsetHeight ?? 48;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[TABS[i].key];
        if (el) {
          if (el.getBoundingClientRect().top - tabBarH - 32 <= 0) {
            setActiveTab(TABS[i].key);
            return;
          }
        }
      }
      setActiveTab(TABS[0].key);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (key: TabKey) => {
    setActiveTab(key);
    const el = sectionRefs.current[key];
    if (!el) return;
    const tabBarH = tabBarRef.current?.offsetHeight ?? 48;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - tabBarH - 16, behavior: "smooth" });
  };

  const badge = product.labels.isNew ? "NEW" : product.labels.isBest ? "BEST" : null;
  const totalPrice = product.discountedPrice * quantity;

  return (
    <div className="min-h-screen bg-[var(--bg-pale)]">
      {/* 장바구니 담기 팝업 */}
      {showCartPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="relative w-full max-w-xs p-6 text-center" style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}>
            <button
              onClick={() => setShowCartPopup(false)}
              className="absolute top-3 right-3 flex items-center justify-center w-7 h-7"
              style={{ color: "var(--ink-light)" }}
              aria-label="닫기"
            >
              <X size={16} />
            </button>
            <p className="t-body mb-4" style={{ color: "var(--ink)" }}>상품이 장바구니에 담겼습니다.</p>
            <Link
              href="/cart"
              className="btn btn-dark w-full"
              style={{ justifyContent: "center" }}
            >
              장바구니 바로가기 &gt;
            </Link>
          </div>
        </div>
      )}

      {/* back nav */}
      <div className="mx-auto max-w-6xl px-4 py-3">
        <Link href="/store" className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--ink-light)" }}>
          <ChevronLeft size={16} />
          스토어
        </Link>
      </div>

      {/* main two-col */}
      <div className="mx-auto max-w-6xl px-4 pb-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT: image gallery */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-square w-full overflow-hidden" style={{ borderRadius: "var(--r-btn)", border: "1px solid var(--ink)", background: "var(--bg-off)" }}>
            {allImages[mainIdx] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={allImages[mainIdx].url}
                alt={allImages[mainIdx].altText}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>이미지 준비 중</span>
              </div>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setMainIdx(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${i === mainIdx ? "bg-black" : "bg-white/70"}`}
                    aria-label={`이미지 ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainIdx(i)}
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden transition-colors"
                  style={{
                    borderRadius: "var(--r-btn)",
                    border: `2px solid ${i === mainIdx ? "var(--ink)" : "var(--neutral-stone)"}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: product info */}
        <div className="w-full lg:w-1/2">
          {badge && (
            <div className="mb-2">
              <span className={`badge badge-${badge.toLowerCase()}`}>{badge}</span>
            </div>
          )}

          <h1 className="t-h2" style={{ marginBottom: 4 }}>{product.name}</h1>
          {product.tagline && (
            <p className="t-small" style={{ color: "var(--ink-light)", marginTop: 4 }}>{product.tagline}</p>
          )}

          <div className="mt-3">
            {product.discountRate > 0 ? (
              <>
                <p className="card-orig">{formatPrice(product.price)}원</p>
                <div className="card-price-row">
                  <span className="card-discount">{product.discountRate}%</span>
                  <span className="card-price" style={{ fontSize: 22 }}>{formatPrice(product.discountedPrice)}원</span>
                </div>
              </>
            ) : (
              <span className="card-price" style={{ fontSize: 22 }}>{formatPrice(product.discountedPrice)}원</span>
            )}
          </div>

          {product.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.categories.map((cat) => (
                <span key={cat} className="tag" style={{ pointerEvents: "none" }}>{cat}</span>
              ))}
            </div>
          )}

          <div className="my-5 border-t border-black" />

          <dl className="space-y-2" style={{ fontSize: 14 }}>
            <div className="flex">
              <dt className="w-24 flex-shrink-0" style={{ color: "var(--ink-light)" }}>포인트</dt>
              <dd style={{ color: "var(--ink)" }}>{formatPrice(Math.floor(product.discountedPrice * 0.01))}P 적립</dd>
            </div>
            <div className="flex">
              <dt className="w-24 flex-shrink-0" style={{ color: "var(--ink-light)" }}>배송방법</dt>
              <dd style={{ color: "var(--ink)" }}>택배</dd>
            </div>
            <div className="flex">
              <dt className="w-24 flex-shrink-0" style={{ color: "var(--ink-light)" }}>배송비</dt>
              <dd style={{ color: "var(--ink)" }}>3,500원 <span style={{ color: "var(--neutral-stone)" }}>(55,000원 이상 무료)</span></dd>
            </div>
          </dl>

          <div className="mt-4 flex items-start gap-2 p-3" style={{ border: "1px solid var(--ink)", borderRadius: "var(--r-btn)", background: "var(--bg-white)" }}>
            <Truck size={18} className="mt-0.5 flex-shrink-0" style={{ color: "var(--neutral-blue)" }} />
            <div style={{ fontSize: 14 }}>
              <p style={{ color: "var(--ink)" }}>오늘출발 상품</p>
              <p className="mt-0.5" style={{ color: "var(--ink-light)" }}>평일 14시 이전 주문 시 당일 출고됩니다.</p>
            </div>
            <Info size={14} className="ml-auto mt-0.5 flex-shrink-0" style={{ color: "var(--neutral-stone)" }} />
          </div>

          <div className="my-5" style={{ borderTop: "1px solid var(--ink)" }} />

          <div className="flex items-center justify-between">
            <span className="t-small" style={{ color: "var(--ink-light)" }}>총 상품금액</span>
            <span className="t-h2">{formatPrice(totalPrice)}원</span>
          </div>

          <div className="mt-6 hidden lg:flex gap-2 items-center">
            {/* 수량 선택 (하트 버튼 대체) */}
            <div className="flex items-center flex-shrink-0" style={{ border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-12 w-12 items-center justify-center disabled:opacity-30"
                style={{ color: "var(--ink)" }}
                aria-label="수량 감소"
              >
                <Minus size={16} />
              </button>
              <span className="flex h-12 w-12 items-center justify-center t-body" style={{ borderLeft: "1px solid var(--ink)", borderRight: "1px solid var(--ink)", color: "var(--ink)" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-12 w-12 items-center justify-center"
                style={{ color: "var(--ink)" }}
                aria-label="수량 증가"
              >
                <Plus size={16} />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={cartLoading} className="btn btn-ghost flex-1 gap-1.5">
              <ShoppingCart size={18} />
              장바구니
            </button>
            <button onClick={handleBuyNow} className="btn btn-dark flex-1">
              바로구매
            </button>
          </div>
        </div>
      </div>

      {/* TAB SECTION */}
      <div className="mx-auto max-w-6xl px-4 pb-40 lg:pb-16">
        <div ref={tabSentinelRef} />
        {tabSticky && <div style={{ height: tabBarRef.current?.offsetHeight ?? 48 }} />}

        <div
          ref={tabBarRef}
          className={`z-40 ${tabSticky ? "fixed left-0 right-0" : ""}`}
          style={{ borderBottom: "1px solid var(--ink)", background: "var(--bg-pale)", ...(tabSticky ? { top: "var(--header-area-h)" } : {}) }}
        >
          <div className={tabSticky ? "mx-auto max-w-6xl px-4 flex" : "flex"}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className="flex-1 py-3 text-center transition-colors t-small"
                style={{
                  color: activeTab === tab.key ? "var(--ink)" : "var(--neutral-stone)",
                  borderBottom: activeTab === tab.key ? "2px solid var(--ink)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 리뷰 */}
        <div ref={(el) => { sectionRefs.current.review = el; }} className="pt-8">
          <h2 className="t-h3" style={{ color: "var(--ink)", marginBottom: 16 }}>리뷰</h2>
          <div className="p-6 text-center t-small" style={{ border: "1px solid var(--ink)", borderRadius: "var(--r-btn)", background: "var(--bg-white)", color: "var(--neutral-stone)" }}>
            아직 작성된 리뷰가 없습니다.
          </div>
        </div>

        {/* 상세정보 */}
        <div ref={(el) => { sectionRefs.current.detail = el; }} className="pt-8">
          <h2 className="t-h3" style={{ color: "var(--ink)", marginBottom: 16 }}>상세정보</h2>
          {/* admin이 description에 실어보낸 템플릿을 우선 사용, 없으면 slug별 하드코딩 */}
          {(() => {
            const detailTemplate =
              parseDescTemplate(product.description) ?? PRODUCT_TEMPLATE_DATA[product.slug];
            return (
              <>
                <ProductDetailTemplate data={detailTemplate} />
                {!detailTemplate && (
                  <>
                    {product.description && (
                      <div className="p-6 t-small" style={{ border: "1px solid var(--ink)", borderRadius: "var(--r-btn)", background: "var(--bg-white)", color: "var(--ink-light)", lineHeight: 1.65 }}>
                        {product.description}
                      </div>
                    )}
              {product.images.details.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {product.images.details.map((img, i) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img key={i} src={img.url} alt={img.altText} className="w-full" style={{ borderRadius: "var(--r-btn)" }} />
                  ))}
                </div>
              )}
                  </>
                )}
              </>
            );
          })()}
        </div>

        {/* 반품/교환정보 */}
        <div ref={(el) => { sectionRefs.current.return = el; }} className="pt-8">
          <h2 className="t-h3" style={{ color: "var(--ink)", marginBottom: 16 }}>반품/교환정보</h2>
          <div className="acc mt-4">
            {[
              { title: "반품/교환 기한", body: "상품 수령일로부터 7일 이내 신청하실 수 있습니다. 단, 신선식품 특성상 상품 수령 후 즉시 상태를 확인해 주시기 바랍니다." },
              { title: "반품 배송비", body: "고객 변심에 의한 반품 시 왕복 배송비 5,000원이 부과됩니다. 상품 불량 또는 오배송의 경우에는 배송비 없이 반품 처리해 드립니다." },
              { title: "교환 불가 사유", body: "신선식품 특성상 단순 변심에 의한 교환은 어려울 수 있습니다. 상품 하자 또는 이물질 발견 시 사진과 함께 고객센터로 문의해 주시면 빠르게 처리해 드립니다." },
              { title: "환불 처리 기간", body: "반품 상품 수거 확인 후 영업일 기준 3~5일 이내에 환불이 처리됩니다. 카드 결제의 경우 카드사 정책에 따라 추가 영업일이 소요될 수 있습니다." },
              { title: "고객센터 안내", body: "반품/교환 문의는 고객센터(1588-0000)로 연락해 주시거나 하단의 상품문의 탭을 이용해 주세요. 평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00, 주말/공휴일 휴무)" },
            ].map(({ title, body }) => (
              <details key={title} className="acc-item">
                <summary><span>{title}</span><span className="acc-icon">+</span></summary>
                <div className="acc-body">{body}</div>
              </details>
            ))}
          </div>
        </div>

      </div>

      {/* mobile fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 py-3 lg:hidden" style={{ borderTop: "1px solid var(--ink)", background: "var(--bg-white)" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            onClick={() => setLiked((v) => !v)}
            className="btn btn-icon btn-md btn-ghost flex-shrink-0"
            style={liked ? { color: "#e05555" } : undefined}
            aria-label="좋아요"
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>
          <button onClick={handleAddToCart} disabled={cartLoading} className="btn btn-ghost flex-1 gap-1.5">
            <ShoppingCart size={18} />
            {cartLoading ? "담는 중..." : "장바구니"}
          </button>
          <button onClick={handleBuyNow} className="btn btn-dark flex-1">
            바로구매
          </button>
        </div>
      </div>

      {/* scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="btn btn-ghost btn-icon btn-md fixed bottom-20 right-4 z-50 lg:bottom-6"
        style={{ borderRadius: "50%" }}
        aria-label="맨 위로"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  );
}
