"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { useStoreOrderDetail } from "@/lib/query/store";
import { queryKeys } from "@/lib/query/queryKeys";
import { DetailSkeleton } from "@/components/ui/DetailSkeleton";
import { useToast } from "@/components/ui/Toast";
import { RefundModal } from "./RefundModal";
import {
  formatDateTime,
  PriceRow,
  SectionCard,
  StoreOrderStatusBadge,
  SummaryRow,
} from "@/app/mypage/_components/order-ui";

/** 환불 버튼을 노출할지 결정. 결제완료·배송중 단계까지 허용. */
function isRefundable(rawStatus: string): boolean {
  const normalized = rawStatus.toUpperCase();
  return normalized === "PENDING" || normalized === "PAID" || normalized === "SHIPPING";
}

export function OrderDetailClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { orderId } = useParams<{ orderId: string }>();
  const { isLoadingSession } = useUser();
  const { data, isLoading, isError } = useStoreOrderDetail(orderId);
  const [refundOpen, setRefundOpen] = useState(false);
  const toast = useToast();

  const loading = isLoadingSession || isLoading;
  const error = isError;

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="t-small" style={{ color: "var(--alert-red)" }}>
          주문 상세를 불러오지 못했습니다.
        </p>
        <Link href="/mypage/orders" className="btn btn-ghost btn-sm">
          주문 내역으로 돌아가기
        </Link>
      </div>
    );
  }

  const totalItemCount = data.products.reduce((sum, p) => sum + p.quantity, 0);
  const discount = data.discountInfo?.discountAmount ?? 0;
  const couponName = data.discountInfo?.couponName;
  const eventName = data.discountInfo?.eventName;

  return (
    <div className="mx-auto max-w-[720px]">
      {/* 백 링크 */}
      <button
        type="button"
        onClick={() => router.push("/mypage/orders")}
        className="inline-flex items-center gap-1 t-small mb-6"
        style={{
          color: "var(--ink-light)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <ChevronLeft size={16} />
        주문 내역
      </button>

      {/* 주문 헤더 */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="t-h2" style={{ color: "var(--ink)" }}>주문 상세</h1>
          <StoreOrderStatusBadge status={data.status} />
        </div>
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          {data.orderNumber}
        </p>
        <p className="t-caption mt-0.5" style={{ color: "var(--neutral-stone)" }}>
          {formatDateTime(data.orderDate)} 결제
        </p>
      </header>

      {/* 주문 상품 */}
      <SectionCard label="Order Items" className="mb-4">
        <ul>
          {data.products.map((p, idx) => (
            <li
              key={`${p.productId}-${idx}`}
              className="flex items-center gap-3 px-5 py-4"
              style={{
                borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
              }}
            >
              <div
                className="shrink-0 overflow-hidden"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "var(--r-btn)",
                  background: "var(--bg-off)",
                  border: "1px solid var(--neutral-stone)",
                }}
              >
                {p.imageUrl && (
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="t-small truncate" style={{ color: "var(--ink)" }}>
                  {p.name}
                </p>
                <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
                  수량 {p.quantity}개
                  {p.discountLabel && (
                    <span className="ml-2" style={{ color: "var(--alert-red)" }}>
                      {p.discountLabel}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right shrink-0">
                {p.discountedPrice < p.originalPrice && (
                  <p
                    className="t-caption line-through"
                    style={{ color: "var(--neutral-stone)" }}
                  >
                    {(p.originalPrice * p.quantity).toLocaleString()}원
                  </p>
                )}
                <p className="t-small" style={{ color: "var(--ink)" }}>
                  {(p.discountedPrice * p.quantity).toLocaleString()}원
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--neutral-stone)", background: "var(--bg-pale)" }}
        >
          <span className="t-caption" style={{ color: "var(--ink-light)" }}>
            총 {totalItemCount}개
          </span>
        </div>
      </SectionCard>

      {/* 배송지 */}
      <SectionCard label="Delivery" className="mb-4">
        <div className="px-5 py-4 flex flex-col gap-2">
          <SummaryRow label="우편번호" value={data.deliveryAddress.zipCode || "-"} />
          <SummaryRow label="기본 주소" value={data.deliveryAddress.street || "-"} />
          <SummaryRow label="상세 주소" value={data.deliveryAddress.detail || "-"} />
        </div>
      </SectionCard>

      {/* 결제 금액 */}
      <SectionCard label="Payment" className="mb-8">
        <div className="px-5 py-4 flex flex-col gap-3 t-small">
          <PriceRow label="상품 금액" value={`${data.originalAmount.toLocaleString()}원`} />
          {discount > 0 && (
            <PriceRow
              label={
                couponName
                  ? `할인 (${couponName})`
                  : eventName
                  ? `할인 (${eventName})`
                  : "할인"
              }
              value={`- ${discount.toLocaleString()}원`}
              valueColor="var(--alert-red)"
            />
          )}
          <PriceRow
            label="배송비"
            value={data.shippingFee === 0 ? "무료" : `${data.shippingFee.toLocaleString()}원`}
            valueColor={data.shippingFee === 0 ? "var(--primary)" : undefined}
          />
          <div className="my-1" style={{ borderTop: "1px solid var(--ink)" }} />
          <div className="flex items-baseline justify-between">
            <span className="t-body" style={{ color: "var(--ink)" }}>최종 결제 금액</span>
            <span className="t-h2" style={{ color: "var(--ink)" }}>
              {data.finalAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </SectionCard>

      {/* 환불 CTA */}
      {isRefundable(data.status) && (
        <div className="flex justify-end mb-8">
          <button
            type="button"
            onClick={() => setRefundOpen(true)}
            className="btn btn-ghost btn-md"
            style={{ border: "1px solid var(--alert-red)", color: "var(--alert-red)" }}
          >
            환불 요청
          </button>
        </div>
      )}

      <RefundModal
        orderDbId={data.orderId}
        amount={data.finalAmount}
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        onRefunded={(updated) => {
          // 환불 응답을 RQ 캐시에 직접 반영 — 재페칭 없이 화면 갱신.
          queryClient.setQueryData(queryKeys.store.orderDetail(orderId), updated);
          setRefundOpen(false);
          toast.success("환불 요청이 정상적으로 접수되었습니다.");
        }}
      />
    </div>
  );
}

