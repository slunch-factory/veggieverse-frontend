"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getStoreOrderDetail,
  type StoreOrderDetailResponse,
} from "@/lib/api/store";
import { useUser } from "@/contexts/UserContext";
import { RefundModal } from "./RefundModal";

type OrderStatus = "결제완료" | "배송중" | "배송완료" | "환불됨" | "취소됨" | "기타";

const STORE_STATUS_LABEL: Record<string, OrderStatus> = {
  PENDING: "결제완료",
  PAID: "결제완료",
  COMPLETED: "배송완료",
  SHIPPING: "배송중",
  REFUNDED: "환불됨",
  CANCELED: "취소됨",
};

function mapStatus(status: string): OrderStatus {
  return STORE_STATUS_LABEL[status] ?? "기타";
}

/** 환불 버튼을 노출할지 결정. 결제완료·배송중 단계까지 허용. */
function isRefundable(rawStatus: string): boolean {
  const normalized = rawStatus.toUpperCase();
  return normalized === "PENDING" || normalized === "PAID" || normalized === "SHIPPING";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function OrderDetailClient() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const { isLoggedIn, isLoadingSession } = useUser();
  const [data, setData] = useState<StoreOrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    if (isLoadingSession) return;
    if (!isLoggedIn) {
      setError(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getStoreOrderDetail(orderId).then((res) => {
      if (cancelled) return;
      if (!res) {
        setError(true);
        setLoading(false);
        return;
      }
      setData(res);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId, isLoggedIn, isLoadingSession]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          주문 상세를 불러오는 중...
        </p>
      </div>
    );
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
  const status = mapStatus(data.status);

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
          <OrderStatusBadge status={status} />
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
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={p.imageUrl}
                    alt={p.name}
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
          setData(updated);
          setRefundOpen(false);
        }}
      />
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
        style={{
          borderBottom: "1px solid var(--ink)",
          background: "var(--bg-pale)",
        }}
      >
        <p
          className="t-caption"
          style={{
            color: "var(--ink-light)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
      </header>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="t-caption" style={{ color: "var(--ink-light)" }}>{label}</span>
      <span className="t-small text-right" style={{ color: "var(--ink)" }}>{value}</span>
    </div>
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

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant: Record<OrderStatus, { bg: string; color: string }> = {
    "결제완료": { bg: "var(--point)", color: "var(--ink)" },
    "배송중": { bg: "var(--neutral-blue)", color: "var(--ink)" },
    "배송완료": { bg: "var(--bg-off)", color: "var(--ink-light)" },
    "환불됨": { bg: "var(--bg-off)", color: "var(--alert-red)" },
    "취소됨": { bg: "var(--bg-off)", color: "var(--alert-red)" },
    "기타": { bg: "var(--bg-off)", color: "var(--ink-light)" },
  };
  const v = variant[status];
  return (
    <span
      className="inline-flex items-center"
      style={{
        background: v.bg,
        color: v.color,
        padding: "3px 10px",
        borderRadius: "var(--r-pill)",
        border: "1px solid var(--ink)",
        fontSize: 11,
        letterSpacing: "0.02em",
      }}
    >
      {status}
    </span>
  );
}
