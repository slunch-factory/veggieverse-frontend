"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DELIVERY_CYCLE_OPTIONS,
  PACK_COMPOSITION_OPTIONS,
  PLAN_TYPES,
  SUBSCRIPTION_DISCOUNT_RATE,
  WEEKDAY_KO,
  formatPrice,
  type DisplayMenuData,
  type MenuCategory,
} from "../../_data/subscription";
import type { OrderData } from "../../_data/order";

interface OrderSummaryCardProps {
  order: OrderData;
  canSubmit: boolean;
  onSubmit: () => void;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(
    d.getDate(),
  ).padStart(2, "0")} (${WEEKDAY_KO[d.getDay()]})`;
};

export function OrderSummaryCard({ order, canSubmit, onSubmit }: OrderSummaryCardProps) {
  const [mealListOpen, setMealListOpen] = useState(false);

  const mealEntries = Object.entries(order.mealPlan).sort(([a], [b]) => a.localeCompare(b));
  const itemCount = mealEntries.length;

  /** 날짜별 그룹 — dateKey(YYYY-MM-DD) 기준 */
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

  const categoryCounts = mealEntries.reduce<Record<MenuCategory, number>>(
    (acc, [, meal]) => {
      acc[meal.category] = (acc[meal.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<MenuCategory, number>,
  );
  const planSummary = (Object.keys(categoryCounts) as MenuCategory[])
    .map((cat) => `${PLAN_TYPES.find((p) => p.id === cat)?.name ?? cat} ${categoryCounts[cat]}끼`)
    .join(" · ");

  const primaryLabel = order.purchaseType === "subscription" ? "정기배송 신청하기" : "결제하기";

  return (
    <aside className="bg-white border border-black flex flex-col">
      <header className="px-6 pt-5 pb-4 border-b border-black">
        <h2 className="text-[18px] leading-normal tracking-tight text-black">주문 요약</h2>
      </header>

      {/* Plan / duration */}
      <section className="px-6 py-4 border-b border-black space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-gray-500">구독 기간</span>
          <span className="text-[14px] text-black">
            {order.duration}주 · {itemCount}끼
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] text-gray-500">배송 시작일</span>
          <span className="text-[14px] text-black">{formatDate(order.startDateISO)}</span>
        </div>
        {planSummary && (
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] text-gray-500">식단 구성</span>
            <span className="text-[13px] text-gray-700 text-right">{planSummary}</span>
          </div>
        )}
        {order.purchaseType === "subscription" && (
          <>
            {cycleLabel && (
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-gray-500">배송 주기</span>
                <span className="text-[13px] text-black">{cycleLabel}</span>
              </div>
            )}
            {packLabel && (
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-gray-500">상품 구성</span>
                <span className="text-[13px] text-gray-700 text-right">{packLabel}</span>
              </div>
            )}
          </>
        )}
      </section>

      {/* Meal list toggle */}
      <section className="border-b border-black">
        <button
          type="button"
          onClick={() => setMealListOpen((v) => !v)}
          className="w-full px-6 py-3 flex items-center justify-between bg-transparent cursor-pointer text-[13px] text-black hover:bg-gray-50"
        >
          <span>식단 구성 상세 ({itemCount}끼)</span>
          {mealListOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        {mealListOpen && (
          <div className="pb-4 max-h-[460px] overflow-y-auto no-scrollbar">
            {groupedByDate.map(({ dateKey, entries }) => (
              <DateGroup key={dateKey} dateKey={dateKey} entries={entries} />
            ))}
          </div>
        )}
      </section>

      {/* Price breakdown */}
      <section className="px-6 py-4 border-b border-black space-y-1.5">
        <PriceRow label="상품 금액" value={formatPrice(subtotal)} />
        {discount > 0 && (
          <PriceRow
            label="정기배송 할인"
            value={`- ${formatPrice(discount)}`}
            valueClassName="text-[#E57373]"
          />
        )}
        <PriceRow label="배송비" value="무료" valueClassName="text-gray-500" />
        <div className="pt-3 mt-1 border-t border-gray-200 flex items-baseline justify-between">
          <span className="text-[14px] text-black">총 결제 금액</span>
          <span className="text-[22px] leading-tight tracking-tight text-[#8C451D]">
            {formatPrice(finalPrice)}
          </span>
        </div>
      </section>

      {/* CTA */}
      <div className="p-4">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={`w-full h-12 text-[14px] transition-all ${
            canSubmit
              ? "bg-black text-white hover:bg-gray-900 cursor-pointer"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          {formatPrice(finalPrice)} {primaryLabel}
        </button>
        {!canSubmit && (
          <p className="mt-2 text-[11px] text-gray-500 text-center">
            필수 정보 입력과 약관 동의 후 진행할 수 있습니다.
          </p>
        )}
      </div>
    </aside>
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
  const isSun = d.getDay() === 0;
  const isSat = d.getDay() === 6;
  const dateTone = isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-gray-800";
  const dayTotal = entries.reduce((sum, [, m]) => sum + m.price, 0);

  return (
    <div>
      <header className="sticky top-0 z-10 bg-gray-50 px-4 py-2 border-y border-gray-200 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className={`text-[14px] leading-none tracking-tight ${dateTone}`}>
            {mm}.{dd}
          </span>
          <span className={`text-[11px] ${dateTone}`}>{dow}</span>
          <span className="text-[10px] text-gray-400">· {entries.length}끼</span>
        </div>
        <span className="text-[11px] text-gray-500">{dayTotal.toLocaleString()}원</span>
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
  // slotId format: YYYY-MM-DD-{0|1}
  const parts = slotId.split("-");
  const mealTime = parts[3] === "0" ? "점심" : "저녁";

  return (
    <li className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="relative w-[64px] h-[64px] shrink-0 overflow-hidden bg-[#F5F5F5] rounded">
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
          <span className="absolute left-1 top-1 bg-[#8C451D] text-white text-[9px] leading-none px-1 py-0.5 rounded">
            변형
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-700">
            {mealTime}
          </span>
        </div>
        <p className="text-[13px] text-black leading-tight truncate">{meal.displayName}</p>
      </div>
      <span className="text-[13px] text-black shrink-0 self-center">
        {meal.price.toLocaleString()}원
      </span>
    </li>
  );
}

function PriceRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className={`text-[14px] text-black ${valueClassName ?? ""}`}>{value}</span>
    </div>
  );
}
