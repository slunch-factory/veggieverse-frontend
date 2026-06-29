"use client";

import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import type { StoreOrderDetailResponse } from "@/lib/api/store";

function toKoreanDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

interface Props {
  order: StoreOrderDetailResponse;
}

/** 결제 확정(confirm 200) 직후 보여주는 완료 화면.
 *  OrderDetailResponse 한 객체만 받아 렌더링한다 — 별도 sessionStorage 의존 없음. */
export function OrderCompletion({ order }: Props) {
  const productSubtotal = order.products.reduce(
    (s, p) => s + p.discountedPrice * p.quantity,
    0,
  );
  const discount = Math.max(0, order.originalAmount - productSubtotal);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      <div className="mx-auto max-w-[600px] px-5 pt-12 pb-12">
        {/* 완료 헤더 */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center mb-5"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--point)",
              border: "1px solid var(--ink)",
            }}
          >
            <Check size={26} strokeWidth={2.2} color="var(--ink)" />
          </div>
          <h1 className="t-h1 mb-2" style={{ color: "var(--ink)" }}>
            주문이 완료되었습니다
          </h1>
          <p className="t-caption mt-1" style={{ color: "var(--neutral-stone)" }}>
            {toKoreanDate(order.orderDate)} 결제 · 주문번호 {order.orderNumber}
          </p>
        </div>

        {/* 주문 상품 */}
        <SectionCard label="Order Items" className="mb-4">
          <ul>
            {order.products.map((item, idx) => (
              <li
                key={item.productId}
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
                }}
              >
                <div
                  className="shrink-0 overflow-hidden"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--r-btn)",
                    background: "var(--bg-off)",
                    border: "1px solid var(--neutral-stone)",
                  }}
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={52}
                      height={52}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="t-small truncate" style={{ color: "var(--ink)" }}>
                    {item.name}
                  </p>
                  <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
                    수량 {item.quantity}개
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {item.originalPrice !== item.discountedPrice && (
                    <p
                      className="t-caption line-through"
                      style={{ color: "var(--neutral-stone)" }}
                    >
                      {(item.originalPrice * item.quantity).toLocaleString()}원
                    </p>
                  )}
                  <p className="t-small" style={{ color: "var(--ink)" }}>
                    {(item.discountedPrice * item.quantity).toLocaleString()}원
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 배송지 */}
        {(order.deliveryAddress.zipCode || order.deliveryAddress.street) && (
          <SectionCard label="Delivery" className="mb-4">
            <div className="px-5 py-4 flex flex-col gap-1 t-small" style={{ color: "var(--ink)" }}>
              {order.deliveryAddress.zipCode && (
                <p style={{ color: "var(--ink-light)" }}>({order.deliveryAddress.zipCode})</p>
              )}
              {order.deliveryAddress.street && <p>{order.deliveryAddress.street}</p>}
              {order.deliveryAddress.detail && <p>{order.deliveryAddress.detail}</p>}
            </div>
          </SectionCard>
        )}

        {/* 결제 금액 */}
        <SectionCard label="Payment" className="mb-8">
          <div className="px-5 py-4 flex flex-col gap-3 t-small">
            <PriceRow label="상품 금액" value={`${order.originalAmount.toLocaleString()}원`} />
            {discount > 0 && (
              <PriceRow
                label="할인"
                value={`- ${discount.toLocaleString()}원`}
                valueColor="var(--alert-red)"
              />
            )}
            <PriceRow
              label="배송비"
              value={order.shippingFee === 0 ? "무료" : `${order.shippingFee.toLocaleString()}원`}
              valueColor={order.shippingFee === 0 ? "var(--primary)" : undefined}
            />
            <div className="my-1" style={{ borderTop: "1px solid var(--ink)" }} />
            <div className="flex items-baseline justify-between">
              <span className="t-body" style={{ color: "var(--ink)" }}>최종 결제 금액</span>
              <span className="t-h2" style={{ color: "var(--ink)" }}>
                {order.finalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </SectionCard>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href={`/mypage/orders/${order.orderId}`}
            className="btn btn-ghost btn-lg flex-1 text-center"
            style={{ border: "1px solid var(--ink)" }}
          >
            주문 상세 보기
          </Link>
          <Link href="/store" className="btn btn-dark btn-lg flex-1 text-center">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── 보조 컴포넌트 ─── */

function SectionCard({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
        overflow: "hidden",
      }}
    >
      <header
        className="px-5 py-3"
        style={{ borderBottom: "1px solid var(--ink)", background: "var(--bg-pale)" }}
      >
        <p
          className="t-caption"
          style={{ color: "var(--ink-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          {label}
        </p>
      </header>
      {children}
    </section>
  );
}

function PriceRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span style={{ color: "var(--ink-light)" }}>{label}</span>
      <span style={{ color: valueColor ?? "var(--ink)" }}>{value}</span>
    </div>
  );
}
