"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Package } from "lucide-react";
import { type StoreOrderHistoryItem } from "@/lib/api/store";
import { useUser } from "@/contexts/UserContext";
import { useStoreOrderHistory } from "@/lib/query/store";
import { OrdersSkeleton } from "./_components/OrdersSkeleton";
import {
  CardDivider,
  Eyebrow,
  formatDate,
  mapStoreStatus,
  OrderCardShell,
  ProductPreviewList,
  StoreOrderStatusBadge,
} from "../_components/order-ui";

const STATUS_TABS = ["전체", "결제완료", "배송중", "배송완료", "취소됨"] as const;

export default function MyOrdersPage() {
  const { isLoadingSession } = useUser();
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("전체");
  const { data, isLoading, isError } = useStoreOrderHistory();

  const loading = isLoadingSession || isLoading;
  const error = isError;

  const ordersContent = data?.content;
  const filtered = useMemo(() => {
    const list: StoreOrderHistoryItem[] = ordersContent ?? [];
    if (activeTab === "전체") return list;
    return list.filter((o) => mapStoreStatus(o.status) === activeTab);
  }, [ordersContent, activeTab]);

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tag${activeTab === tab ? " is-selected" : ""}`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : error ? (
        <div className="text-center py-20">
          <Package size={40} color="var(--neutral-stone)" className="inline-block mb-3" />
          <p className="t-small" style={{ color: "var(--alert-red)" }}>
            주문 내역을 불러오지 못했습니다.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} color="var(--neutral-stone)" className="inline-block mb-3" />
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            {activeTab === "전체" ? "주문 내역이 없습니다." : "해당 상태의 주문이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: StoreOrderHistoryItem }) {
  const router = useRouter();
  const itemCount = order.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <OrderCardShell onClick={() => router.push(`/mypage/orders/${order.orderId}`)}>
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <Eyebrow>주문 · {order.orderNumber}</Eyebrow>
          <p className="t-caption mt-1" style={{ color: "var(--ink-light)" }}>
            {formatDate(order.orderDate)}
          </p>
        </div>
        <StoreOrderStatusBadge status={order.status} />
      </div>

      <CardDivider />

      <ProductPreviewList products={order.products} showThumbnails />

      <CardDivider />

      <div className="flex items-center justify-between px-5 py-3">
        <span className="t-small" style={{ color: "var(--ink-light)" }}>
          총 {itemCount}개 · 합계
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="t-h3" style={{ color: "var(--ink)" }}>
            {order.finalAmount.toLocaleString()}원
          </span>
          <ArrowRight size={16} color="var(--ink-light)" />
        </span>
      </div>
    </OrderCardShell>
  );
}
