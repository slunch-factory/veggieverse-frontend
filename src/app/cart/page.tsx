"use client";

import Link from "next/link";
import { ChevronLeft, Minus, Plus, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const SHIPPING_FEE = 3500;
const FREE_SHIPPING_THRESHOLD = 55000;

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

export default function CartPage() {
  const { items, totalPrice, totalCount, updateQuantity, removeItem } = useCart();

  const shippingFee = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const orderTotal = totalPrice + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--bg-pale)" }}>
        <ShoppingCart size={48} strokeWidth={1} style={{ color: "var(--neutral-stone)" }} />
        <div className="text-center">
          <p className="t-h3" style={{ color: "var(--ink)", marginBottom: 8 }}>장바구니가 비어 있습니다</p>
          <p className="t-small" style={{ color: "var(--ink-light)" }}>마음에 드는 상품을 담아보세요</p>
        </div>
        <Link href="/store" className="btn btn-dark btn-md">스토어 둘러보기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* back */}
        <Link href="/store" className="inline-flex items-center gap-1 t-small mb-6" style={{ color: "var(--ink-light)" }}>
          <ChevronLeft size={16} />
          스토어
        </Link>

        <h1 className="t-h2 mb-1" style={{ color: "var(--ink)" }}>장바구니</h1>
        <p className="t-small mb-8" style={{ color: "var(--ink-light)" }}>{totalCount}개 상품</p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 상품 목록 */}
          <div className="flex-1 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 p-4"
                style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
              >
                {/* 이미지 */}
                <Link href={`/store/${item.slug}`} className="flex-shrink-0">
                  <div
                    className="overflow-hidden"
                    style={{ width: 80, height: 80, borderRadius: "var(--r-btn)", background: "var(--bg-off)", border: "1px solid var(--neutral-stone)" }}
                  >
                    {item.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart size={20} style={{ color: "var(--neutral-stone)" }} />
                      </div>
                    )}
                  </div>
                </Link>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="t-body truncate" style={{ color: "var(--ink)" }}>{item.name}</p>
                      {item.tagline && (
                        <p className="t-caption truncate mt-0.5" style={{ color: "var(--ink-light)" }}>{item.tagline}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="flex-shrink-0 flex items-center justify-center w-6 h-6"
                      style={{ color: "var(--neutral-stone)" }}
                      aria-label="삭제"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    {/* 수량 */}
                    <div className="flex items-center" style={{ border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex items-center justify-center disabled:opacity-30"
                        style={{ width: 32, height: 32, color: "var(--ink)" }}
                        aria-label="수량 감소"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className="flex items-center justify-center t-small"
                        style={{ width: 36, height: 32, borderLeft: "1px solid var(--ink)", borderRight: "1px solid var(--ink)", color: "var(--ink)" }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex items-center justify-center"
                        style={{ width: 32, height: 32, color: "var(--ink)" }}
                        aria-label="수량 증가"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* 가격 */}
                    <div className="text-right">
                      {item.discountRate > 0 && (
                        <p className="card-orig">{formatPrice(item.price * item.quantity)}원</p>
                      )}
                      <p style={{ fontSize: 16, color: "var(--ink)" }}>
                        {formatPrice(item.discountedPrice * item.quantity)}원
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 주문 요약 */}
          <div className="lg:w-72 flex-shrink-0">
            <div
              className="p-5 sticky top-[var(--header-area-h)]"
              style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
            >
              <p className="t-h3 mb-4" style={{ color: "var(--ink)" }}>주문 요약</p>

              <dl className="flex flex-col gap-3 t-small" style={{ color: "var(--ink)" }}>
                <div className="flex justify-between">
                  <dt style={{ color: "var(--ink-light)" }}>상품 금액</dt>
                  <dd>{formatPrice(totalPrice)}원</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: "var(--ink-light)" }}>배송비</dt>
                  <dd>
                    {shippingFee === 0
                      ? <span style={{ color: "var(--primary)" }}>무료</span>
                      : `${formatPrice(shippingFee)}원`}
                  </dd>
                </div>
                {totalPrice < FREE_SHIPPING_THRESHOLD && (
                  <p className="t-caption" style={{ color: "var(--ink-light)" }}>
                    {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)}원 더 담으면 무료배송
                  </p>
                )}
              </dl>

              <div className="my-4" style={{ borderTop: "1px solid var(--ink)" }} />

              <div className="flex justify-between mb-5">
                <span className="t-body" style={{ color: "var(--ink)" }}>합계</span>
                <span className="t-h3" style={{ color: "var(--ink)" }}>{formatPrice(orderTotal)}원</span>
              </div>

              <button className="btn btn-dark w-full btn-lg">주문하기</button>
              <Link href="/store" className="btn btn-ghost w-full btn-md mt-2" style={{ justifyContent: "center" }}>
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
