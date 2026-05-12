"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, ChevronDown } from "lucide-react";
import {
  getStoreOrderHistory,
  type StoreOrderHistoryItem,
  type StoreOrderHistoryProduct,
} from "@/lib/api/store";
import { useUser } from "@/contexts/UserContext";

type OrderStatus = "결제완료" | "배송중" | "배송완료" | "취소됨" | "기타";

const STATUS_TABS = ["전체", "결제완료", "배송중", "배송완료", "취소됨"] as const;

const STORE_STATUS_LABEL: Record<string, OrderStatus> = {
  PENDING: "결제완료",
  COMPLETED: "배송완료",
  SHIPPING: "배송중",
  CANCELED: "취소됨",
};

function mapStatus(status: string): OrderStatus {
  return STORE_STATUS_LABEL[status] ?? "기타";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function MyOrdersPage() {
  const { isLoggedIn, isLoadingSession } = useUser();
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("전체");
  const [orders, setOrders] = useState<StoreOrderHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isLoadingSession) return;
    if (!isLoggedIn) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    getStoreOrderHistory().then((res) => {
      if (cancelled) return;
      if (!res) {
        setError(true);
        setLoading(false);
        return;
      }
      setOrders(res.content);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isLoadingSession]);

  const filtered = useMemo(() => {
    if (!orders) return [];
    if (activeTab === "전체") return orders;
    return orders.filter((o) => mapStatus(o.status) === activeTab);
  }, [orders, activeTab]);

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
        <div className="text-center py-20">
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            주문 내역을 불러오는 중...
          </p>
        </div>
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
  const status = mapStatus(order.status);
  const itemCount = order.products.reduce((sum, p) => sum + p.quantity, 0);

  const handleClick = () => {
    router.push(`/mypage/orders/${order.orderId}`);
  };

  return (
    <div
      onClick={handleClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className="cursor-pointer transition-colors hover:bg-[var(--bg-pale)]"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <div>
          <p className="t-small" style={{ color: "var(--ink)" }}>{order.orderNumber}</p>
          <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
            {formatDate(order.orderDate)}
          </p>
        </div>
        <OrderStatusBadge status={status} />
      </header>

      <ProductList products={order.products} />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--neutral-stone)" }}
      >
        <span className="t-small" style={{ color: "var(--ink-light)" }}>
          총 {itemCount}개 · 합계
        </span>
        <span className="t-h3" style={{ color: "var(--ink)" }}>
          {order.finalAmount.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}

const VISIBLE_COUNT = 3;

function ProductList({ products }: { products: StoreOrderHistoryProduct[] }) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, products.length - VISIBLE_COUNT);
  const visible = expanded ? products : products.slice(0, VISIBLE_COUNT);
  const hasMore = hiddenCount > 0;

  return (
    <div className="px-5 py-4 flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {visible.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <div
              className="shrink-0 overflow-hidden"
              style={{
                width: 44,
                height: 44,
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
            <p className="t-small flex-1 min-w-0 truncate" style={{ color: "var(--ink)" }}>
              {item.name}
              {item.quantity > 1 && (
                <span className="ml-1.5" style={{ color: "var(--ink-light)" }}>×{item.quantity}</span>
              )}
            </p>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="t-caption inline-flex items-center gap-1 self-start mt-1"
          style={{
            color: "var(--ink-light)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {expanded ? "접기" : `외 ${hiddenCount}개 더보기`}
          <ChevronDown
            size={12}
            style={{
              transform: expanded ? "rotate(180deg)" : undefined,
              transition: "transform 0.15s",
            }}
          />
        </button>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant: Record<OrderStatus, { bg: string; color: string }> = {
    "결제완료": { bg: "var(--point)", color: "var(--ink)" },
    "배송중": { bg: "var(--neutral-blue)", color: "var(--ink)" },
    "배송완료": { bg: "var(--bg-off)", color: "var(--ink-light)" },
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
