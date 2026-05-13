"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  STORE_ORDER_RESULT_KEY,
  type StoreOrderResult,
} from "@/app/order/_components/OrderClient";

function toKoreanDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export function CompleteClient() {
  const router = useRouter();
  const [result, setResult] = useState<StoreOrderResult | null>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    const raw = sessionStorage.getItem(STORE_ORDER_RESULT_KEY);
    if (!raw) {
      router.replace("/store");
      return;
    }
    try {
      setResult(JSON.parse(raw) as StoreOrderResult);
      sessionStorage.removeItem(STORE_ORDER_RESULT_KEY);
    } catch {
      router.replace("/store");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!result) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ background: "var(--bg-pale)" }}
      >
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          주문 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  const discount = result.subtotal - (result.total - result.shippingFee);

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
            {toKoreanDate(result.orderDate)} 결제
          </p>
        </div>

        {/* 주문 상품 */}
        <SectionCard label="Order Items" className="mb-4">
          <ul>
            {result.items.map((item, idx) => (
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
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={item.imageUrl}
                      alt={item.name}
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
                  {item.discountRate > 0 && (
                    <p
                      className="t-caption line-through"
                      style={{ color: "var(--neutral-stone)" }}
                    >
                      {(item.price * item.quantity).toLocaleString()}원
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

        {/* 결제 금액 */}
        <SectionCard label="Payment" className="mb-8">
          <div className="px-5 py-4 flex flex-col gap-3 t-small">
            <PriceRow label="상품 금액" value={`${result.subtotal.toLocaleString()}원`} />
            {discount > 0 && (
              <PriceRow
                label="할인"
                value={`- ${discount.toLocaleString()}원`}
                valueColor="var(--alert-red)"
              />
            )}
            <PriceRow
              label="배송비"
              value={result.shippingFee === 0 ? "무료" : `${result.shippingFee.toLocaleString()}원`}
              valueColor={result.shippingFee === 0 ? "var(--primary)" : undefined}
            />
            <div className="my-1" style={{ borderTop: "1px solid var(--ink)" }} />
            <div className="flex items-baseline justify-between">
              <span className="t-body" style={{ color: "var(--ink)" }}>최종 결제 금액</span>
              <span className="t-h2" style={{ color: "var(--ink)" }}>
                {result.total.toLocaleString()}원
              </span>
            </div>
          </div>
        </SectionCard>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/mypage/orders"
            className="btn btn-ghost btn-lg flex-1 text-center"
            style={{ border: "1px solid var(--ink)" }}
          >
            주문 내역 보기
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
