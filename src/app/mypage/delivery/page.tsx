"use client";

import { Truck, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import type { StoreOrderHistoryItem } from "@/lib/api/store";
import { useUser } from "@/contexts/UserContext";
import { useStoreOrderHistory } from "@/lib/query/store";

/**
 * 배송 조회 — 주문별 배송 진행 단계를 보여준다.
 * 운송장(택배사·송장번호) 실시간 추적은 품고(3PL) 연동 후 제공 예정이라,
 * 현재는 주문 상태 기반 단계 표시 + 추적 안내 자리만 둔다. (#63)
 */

const STEPS = ["결제완료", "상품 준비중", "배송중", "배송완료"] as const;

// 주문 상태 → 도달한 단계 index. 중간 단계(상품 준비중)는 별도 신호가 없어 PAID에서 멈춘 것으로 표시.
const STATUS_TO_STEP: Record<string, number> = {
  PAID: 0,
  SHIPPING: 2,
  COMPLETED: 3,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function MyDeliveryPage() {
  const { isLoadingSession } = useUser();
  const { data, isLoading, isError } = useStoreOrderHistory();
  const router = useRouter();

  const loading = isLoadingSession || isLoading;
  const orders: StoreOrderHistoryItem[] = (data?.content ?? []).filter(
    (o) => o.status !== "CANCELED",
  );

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="mb-6 flex items-center gap-2">
        <Truck size={20} color="var(--ink)" />
        <h1 className="t-h3" style={{ color: "var(--ink)" }}>배송 조회</h1>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse"
              style={{ background: "var(--bg-off)", borderRadius: "var(--r-btn)" }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <Package size={40} color="var(--neutral-stone)" className="inline-block mb-3" />
          <p className="t-small" style={{ color: "var(--alert-red)" }}>
            배송 정보를 불러오지 못했습니다.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Truck size={40} color="var(--neutral-stone)" className="inline-block mb-3" />
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            배송 중인 주문이 없습니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <DeliveryCard key={order.orderId} order={order} onOpen={() => router.push(`/mypage/orders/${order.orderId}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DeliveryCard({
  order,
  onOpen,
}: {
  order: StoreOrderHistoryItem;
  onOpen: () => void;
}) {
  const reached = STATUS_TO_STEP[order.status] ?? 0;
  const itemCount = order.products.reduce((sum, p) => sum + p.quantity, 0);
  const firstName = order.products[0]?.name ?? "주문 상품";
  const summary = itemCount > 1 ? `${firstName} 외 ${itemCount - 1}건` : firstName;

  return (
    <div
      className="p-5"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="t-small" style={{ color: "var(--ink)" }}>{order.orderNumber}</p>
          <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
            {formatDate(order.orderDate)} · {summary}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="t-caption underline underline-offset-2"
          style={{ color: "var(--ink-light)" }}
        >
          주문 상세
        </button>
      </header>

      {/* 진행 단계 */}
      <ol className="flex items-center">
        {STEPS.map((label, i) => {
          const done = i <= reached;
          const isLast = i === STEPS.length - 1;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px]"
                  style={{
                    background: done ? "var(--ink)" : "var(--bg-off)",
                    color: done ? "var(--point)" : "var(--neutral-stone)",
                    border: `1px solid ${done ? "var(--ink)" : "var(--neutral-stone)"}`,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[10.5px] whitespace-nowrap"
                  style={{ color: done ? "var(--ink)" : "var(--neutral-stone)" }}
                >
                  {label}
                </span>
              </div>
              {!isLast && (
                <span
                  className="mx-1 mb-4 h-px flex-1"
                  style={{ background: i < reached ? "var(--ink)" : "var(--neutral-stone)" }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* 운송장 추적 — 품고 연동 예정 */}
      <div
        className="mt-5 flex items-center gap-2 px-3 py-2.5"
        style={{ background: "var(--bg-pale)", borderRadius: "var(--r-btn)" }}
      >
        <Truck size={14} color="var(--ink-light)" />
        <p className="t-caption" style={{ color: "var(--ink-light)" }}>
          실시간 운송장 추적은 곧 제공될 예정입니다.
        </p>
      </div>
    </div>
  );
}
