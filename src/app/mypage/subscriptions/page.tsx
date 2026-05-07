"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, ChevronDown, Repeat } from "lucide-react";
import {
  getOrderHistory,
  type OrderHistoryItem,
  type OrderHistoryProduct,
} from "@/lib/api/subscription";
import { FIXED_USER_ID } from "@/lib/api/payment";

type SubscriptionStatus = "준비중" | "진행중" | "종료됨";

const STATUS_TABS = ["전체", "준비중", "진행중", "종료됨"] as const;

function deriveStatus(startDate: string, endDate: string): SubscriptionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today < start) return "준비중";
  if (today > end) return "종료됨";
  return "진행중";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function deriveProgress(startDate: string, endDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  const total = Math.max(1, daysBetween(start, end));
  const elapsed = Math.max(0, Math.min(total, daysBetween(start, today)));
  return {
    total,
    elapsed,
    remaining: Math.max(0, daysBetween(today, end)),
    pct: Math.round((elapsed / total) * 100),
  };
}

export default function MySubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("전체");
  const [items, setItems] = useState<OrderHistoryItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    getOrderHistory(FIXED_USER_ID).then((res) => {
      if (cancelled) return;
      if (!res) {
        setError(true);
        setLoading(false);
        return;
      }
      setItems(res.content);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (activeTab === "전체") return items;
    return items.filter((o) => deriveStatus(o.startDate, o.endDate) === activeTab);
  }, [items, activeTab]);

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`tag${activeTab === tab ? " is-selected" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            구독 내역을 불러오는 중...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <CalendarRange size={40} color="var(--neutral-stone)" className="inline-block mb-3" />
          <p className="t-small" style={{ color: "var(--alert-red)" }}>
            구독 내역을 불러오지 못했습니다.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarRange size={40} color="var(--neutral-stone)" className="inline-block mb-3" />
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            {activeTab === "전체" ? "구독 내역이 없습니다." : "해당 상태의 구독이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((sub) => (
            <SubscriptionCard key={sub.orderId} item={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({ item }: { item: OrderHistoryItem }) {
  const router = useRouter();
  const status = deriveStatus(item.startDate, item.endDate);
  const progress = deriveProgress(item.startDate, item.endDate);
  const itemCount = item.products.reduce((sum, p) => sum + p.quantity, 0);

  const handleClick = () => router.push(`/mypage/subscriptions/${item.orderId}`);

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
        className="flex items-start justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <div className="min-w-0">
          <p
            className="t-caption"
            style={{ color: "var(--ink-light)", letterSpacing: "0.04em" }}
          >
            구독 #{item.orderNumber}
          </p>
          <p className="t-h3 mt-1" style={{ color: "var(--ink)" }}>
            {formatDate(item.startDate)} – {formatDate(item.endDate)}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Repeat size={12} color="var(--ink-light)" />
            <span className="t-caption" style={{ color: "var(--ink-light)" }}>
              배송 주기 · {item.deliveryCycle}
            </span>
          </div>
        </div>
        <SubscriptionStatusBadge status={status} />
      </header>

      {status === "진행중" && (
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="t-caption" style={{ color: "var(--ink-light)" }}>
              {progress.elapsed}일 / {progress.total}일 경과
            </span>
            <span className="t-caption" style={{ color: "var(--ink)" }}>
              D-{progress.remaining}
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "var(--bg-off)",
              borderRadius: "var(--r-pill)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress.pct}%`,
                height: "100%",
                background: "var(--ink)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      <ProductList products={item.products} />

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--neutral-stone)" }}
      >
        <span className="t-small" style={{ color: "var(--ink-light)" }}>
          총 {itemCount}끼 · 결제 {formatDate(item.orderDate)}
        </span>
        <span className="t-h3" style={{ color: "var(--ink)" }}>
          {item.finalAmount.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}

const VISIBLE_COUNT = 3;

function ProductList({ products }: { products: OrderHistoryProduct[] }) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, products.length - VISIBLE_COUNT);
  const visible = expanded ? products : products.slice(0, VISIBLE_COUNT);
  const hasMore = hiddenCount > 0;

  return (
    <div className="px-5 py-4 flex flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {visible.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <p className="t-small" style={{ color: "var(--ink)" }}>
              {item.name}
              {item.quantity > 1 && (
                <span className="ml-1.5" style={{ color: "var(--ink-light)" }}>
                  ×{item.quantity}
                </span>
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

function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const variant: Record<SubscriptionStatus, { bg: string; color: string }> = {
    "준비중": { bg: "var(--point)", color: "var(--ink)" },
    "진행중": { bg: "var(--neutral-blue)", color: "var(--ink)" },
    "종료됨": { bg: "var(--bg-off)", color: "var(--ink-light)" },
  };
  const v = variant[status];
  return (
    <span
      className="inline-flex items-center shrink-0"
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
