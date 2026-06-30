"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarRange, Repeat } from "lucide-react";
import { type OrderHistoryItem } from "@/lib/api/subscription";
import { useUser } from "@/contexts/UserContext";
import { useSubscriptionHistory } from "@/lib/query/subscription";
import { SubscriptionsSkeleton } from "./_components/SubscriptionsSkeleton";
import {
  CardDivider,
  Eyebrow,
  formatDate,
  type LifecyclePhase,
  LifecycleBadge,
  OrderCardShell,
  ProductPreviewList,
} from "../_components/order-ui";

const STATUS_TABS = ["전체", "준비중", "진행중", "종료됨"] as const;

function deriveStatus(startDate: string, endDate: string): LifecyclePhase {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today < start) return "준비중";
  if (today > end) return "종료됨";
  return "진행중";
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
  const { isLoadingSession } = useUser();
  const [activeTab, setActiveTab] = useState<(typeof STATUS_TABS)[number]>("전체");
  const { data, isLoading, isError } = useSubscriptionHistory();

  const loading = isLoadingSession || isLoading;
  const error = isError;

  const itemsContent = data?.content;
  const filtered = useMemo(() => {
    const list: OrderHistoryItem[] = itemsContent ?? [];
    if (activeTab === "전체") return list;
    return list.filter((o) => deriveStatus(o.startDate, o.endDate) === activeTab);
  }, [itemsContent, activeTab]);

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
        <SubscriptionsSkeleton />
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
  const phase = deriveStatus(item.startDate, item.endDate);
  const progress = deriveProgress(item.startDate, item.endDate);
  const itemCount = item.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <OrderCardShell onClick={() => router.push(`/mypage/subscriptions/${item.orderId}`)}>
      <div className="px-5 pt-4 pb-3">
        <Eyebrow>구독 · {item.orderNumber}</Eyebrow>
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <LifecycleBadge phase={phase} />
        </div>
        <p className="t-h3 mt-2.5" style={{ color: "var(--ink)" }}>
          {formatDate(item.startDate)} – {formatDate(item.endDate)}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <Repeat size={12} color="var(--ink-light)" />
          <span className="t-caption" style={{ color: "var(--ink-light)" }}>
            배송 주기 · {item.deliveryCycle}
          </span>
        </div>

        {phase === "진행중" && (
          <div className="mt-3">
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
      </div>

      <CardDivider />

      <ProductPreviewList products={item.products} />

      <CardDivider />

      <div className="flex items-center justify-between px-5 py-3">
        <span className="t-small" style={{ color: "var(--ink-light)" }}>
          총 {itemCount}끼 · 결제 {formatDate(item.orderDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="t-h3" style={{ color: "var(--ink)" }}>
            {item.finalAmount.toLocaleString()}원
          </span>
          <ArrowRight size={16} color="var(--ink-light)" />
        </span>
      </div>
    </OrderCardShell>
  );
}
