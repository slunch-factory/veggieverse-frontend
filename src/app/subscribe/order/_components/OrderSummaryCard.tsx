"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DELIVERY_CYCLE_OPTIONS,
  PACK_COMPOSITION_OPTIONS,
  SUBSCRIPTION_DISCOUNT_RATE,
  WEEKDAY_KO,
  formatPrice,
  type DisplayMenuData,
} from "../../_data/subscription";
import type { OrderData } from "../../_data/order";
import type { CustomPlanResponse } from "@/lib/api/subscription";

interface OrderSummaryCardProps {
  order: OrderData;
  canSubmit: boolean;
  onSubmit: () => void;
  confirmedPlan?: CustomPlanResponse | null;
  submitting?: boolean;
}

const formatShortDate = (d: Date) =>
  `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY_KO[d.getDay()]})`;

export function OrderSummaryCard({
  order,
  canSubmit,
  onSubmit,
  confirmedPlan,
  submitting,
}: OrderSummaryCardProps) {
  const [mealListOpen, setMealListOpen] = useState(true);

  const mealEntries: [string, DisplayMenuData][] = (() => {
    if (confirmedPlan) {
      const entries: [string, DisplayMenuData][] = [];
      for (const { date, lunch, dinner } of confirmedPlan.items) {
        if (lunch !== 0) {
          const meal = order.mealPlan[`${date}-0`];
          if (meal) entries.push([`${date}-0`, meal]);
        }
        if (dinner !== 0) {
          const meal = order.mealPlan[`${date}-1`];
          if (meal) entries.push([`${date}-1`, meal]);
        }
      }
      return entries.sort(([a], [b]) => a.localeCompare(b));
    }
    return Object.entries(order.mealPlan).sort(([a], [b]) => a.localeCompare(b));
  })();
  const itemCount = mealEntries.length;

  const startD = new Date(order.startDateISO);
  const endD = new Date(startD);
  endD.setDate(startD.getDate() + order.duration * 7 - 1);
  const periodLabel = `${formatShortDate(startD)} ~ ${formatShortDate(endD)}`;

  const groupedByDate = (() => {
    const groups = new Map<string, [string, DisplayMenuData][]>();
    for (const [slotId, meal] of mealEntries) {
      const dateKey = slotId.slice(0, 10);
      const list = groups.get(dateKey) ?? [];
      list.push([slotId, meal]);
      groups.set(dateKey, list);
    }
    return Array.from(groups.entries()).map(([dateKey, entries]) => ({ dateKey, entries }));
  })();
  const subtotal = order.totalPrice;
  const discount =
    order.purchaseType === "subscription" ? Math.round(subtotal * SUBSCRIPTION_DISCOUNT_RATE) : 0;
  const finalPrice = subtotal - discount;

  const cycleLabel = DELIVERY_CYCLE_OPTIONS.find((o) => o.value === order.deliveryCycle)?.label;
  const packLabel = PACK_COMPOSITION_OPTIONS.find((o) => o.value === order.packComposition)?.label;

  const primaryLabel = order.purchaseType === "subscription" ? "정기배송 신청하기" : "결제하기";

  return (
    <aside
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      <header
        className="px-5 py-4"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <p className="t-h3" style={{ color: "var(--ink)" }}>주문 요약</p>
      </header>

      {/* Plan / duration */}
      <section
        className="px-5 py-4 flex flex-col gap-2"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        <SummaryRow label="구독 기간" value={`${periodLabel} · ${itemCount}끼`} />
        {order.purchaseType === "subscription" && (
          <>
            {cycleLabel && <SummaryRow label="배송 주기" value={cycleLabel} />}
            {packLabel && <SummaryRow label="상품 구성" value={packLabel} />}
          </>
        )}
      </section>

      {/* Meal list toggle */}
      <section style={{ borderBottom: "1px solid var(--neutral-stone)" }}>
        <button
          type="button"
          onClick={() => setMealListOpen((v) => !v)}
          className="w-full px-5 py-3 flex items-center justify-between bg-transparent cursor-pointer t-small transition-colors"
          style={{ color: "var(--ink)" }}
        >
          <span>식단 구성 상세 ({itemCount}끼)</span>
          {mealListOpen ? (
            <ChevronUp size={16} style={{ color: "var(--ink-light)" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "var(--ink-light)" }} />
          )}
        </button>
        {mealListOpen && (
          <div className="pb-3 max-h-[460px] overflow-y-auto no-scrollbar">
            {groupedByDate.map(({ dateKey, entries }) => (
              <DateGroup key={dateKey} dateKey={dateKey} entries={entries} />
            ))}
          </div>
        )}
      </section>

      {/* Price breakdown */}
      <section className="px-5 py-4 flex flex-col gap-3 t-small">
        <PriceRow label="상품 금액" value={formatPrice(subtotal)} />
        {discount > 0 && (
          <PriceRow
            label="정기배송 할인"
            value={`- ${formatPrice(discount)}`}
            valueColor="var(--alert-red)"
          />
        )}
        <PriceRow label="배송비" value="무료" valueColor="var(--primary)" />

        <div className="my-1" style={{ borderTop: "1px solid var(--ink)" }} />

        <div className="flex items-baseline justify-between">
          <span className="t-body" style={{ color: "var(--ink)" }}>합계</span>
          <span className="t-h3" style={{ color: "var(--ink)" }}>
            {formatPrice(finalPrice)}
          </span>
        </div>
      </section>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="btn btn-dark w-full btn-lg"
        >
          {submitting ? "처리 중..." : `${formatPrice(finalPrice)} ${primaryLabel}`}
        </button>
        {!canSubmit && !submitting && (
          <p className="t-caption mt-3 text-center" style={{ color: "var(--ink-light)" }}>
            필수 정보 입력과 약관 동의 후 진행할 수 있습니다
          </p>
        )}
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
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

function DateGroup({
  dateKey,
  entries,
}: {
  dateKey: string;
  entries: [string, DisplayMenuData][];
}) {
  const d = new Date(dateKey);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const dow = WEEKDAY_KO[d.getDay()];
  const dayTotal = entries.reduce((sum, [, m]) => sum + m.price, 0);

  return (
    <div>
      <header
        className="px-4 py-2 flex items-baseline justify-between"
        style={{
          background: "var(--bg-pale)",
          borderTop: "1px solid var(--neutral-stone)",
          borderBottom: "1px solid var(--neutral-stone)",
        }}
      >
        <div className="flex items-baseline gap-2">
          <span className="t-small" style={{ color: "var(--ink)" }}>
            {mm}.{dd}
          </span>
          <span className="t-caption" style={{ color: "var(--ink-light)" }}>{dow}</span>
          <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>
            · {entries.length}끼
          </span>
        </div>
        <span className="t-caption" style={{ color: "var(--ink-light)" }}>
          {dayTotal.toLocaleString()}원
        </span>
      </header>
      <ul className="px-4">
        {entries.map(([slotId, meal]) => (
          <MealCartItem key={slotId} slotId={slotId} meal={meal} />
        ))}
      </ul>
    </div>
  );
}

function MealCartItem({ slotId, meal }: { slotId: string; meal: DisplayMenuData }) {
  const parts = slotId.split("-");
  const mealTime = parts[3] === "0" ? "점심" : "저녁";

  return (
    <li
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--neutral-stone)" }}
    >
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--r-btn)",
          background: "var(--bg-off)",
          border: "1px solid var(--neutral-stone)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meal.image}
          alt={meal.displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {meal.isVariation && (
          <span
            className="absolute left-1 top-1 t-caption"
            style={{
              background: "var(--ink)",
              color: "var(--point)",
              padding: "1px 5px",
              borderRadius: 3,
              fontSize: 9,
              lineHeight: 1.2,
            }}
          >
            변형
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="inline-flex items-center mb-1 t-caption"
          style={{
            background: "var(--bg-off)",
            color: "var(--ink)",
            padding: "1px 8px",
            borderRadius: "var(--r-pill)",
            fontSize: 10,
          }}
        >
          {mealTime}
        </span>
        <p className="t-small truncate" style={{ color: "var(--ink)" }}>
          {meal.displayName}
        </p>
      </div>
      <span className="t-small shrink-0 self-center" style={{ color: "var(--ink)" }}>
        {meal.price.toLocaleString()}원
      </span>
    </li>
  );
}
