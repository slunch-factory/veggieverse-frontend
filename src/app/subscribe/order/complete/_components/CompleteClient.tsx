"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { PAYMENT_RESULT_KEY, type PaymentResponse } from "@/lib/api/payment";
import {
  clearOrder,
  getOrderSnapshot,
  type OrderData,
} from "@/app/subscribe/_data/order";
import { WEEKDAY_KO, type DisplayMenuData } from "@/app/subscribe/_data/subscription";
import { MealImage } from "@/app/subscribe/_components/MealImage";

function toKoreanDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

function formatShort(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}.${dd} (${WEEKDAY_KO[d.getDay()]})`;
}

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface DayCol {
  date: Date;
  lunch: DisplayMenuData | null;
  dinner: DisplayMenuData | null;
}

interface WeekGroup {
  index: number;
  start: Date;
  end: Date;
  days: DayCol[];
  mealCount: number;
  weekTotal: number;
}

function buildWeeks(startISO: string, endISO: string, mealPlan: Record<string, DisplayMenuData>): WeekGroup[] {
  const start = new Date(startISO);
  const end = new Date(endISO);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  const weekCount = Math.max(1, Math.ceil(totalDays / 7));

  const weeks: WeekGroup[] = [];
  for (let w = 0; w < weekCount; w++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > end) weekEnd.setTime(end.getTime());

    const days: DayCol[] = [];
    let mealCount = 0;
    let weekTotal = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > end) break;
      const k = dateKey(d);
      const lunch = mealPlan[`${k}-0`] ?? null;
      const dinner = mealPlan[`${k}-1`] ?? null;
      if (lunch) {
        mealCount++;
        weekTotal += lunch.price;
      }
      if (dinner) {
        mealCount++;
        weekTotal += dinner.price;
      }
      days.push({ date: d, lunch, dinner });
    }
    weeks.push({ index: w + 1, start: weekStart, end: weekEnd, days, mealCount, weekTotal });
  }
  return weeks;
}

export function CompleteClient() {
  const router = useRouter();
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [orderSnap, setOrderSnap] = useState<OrderData | null>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    const raw = sessionStorage.getItem(PAYMENT_RESULT_KEY);
    if (!raw) {
      router.replace("/");
      return;
    }
    try {
      setResult(JSON.parse(raw) as PaymentResponse);
      setOrderSnap(getOrderSnapshot());
      sessionStorage.removeItem(PAYMENT_RESULT_KEY);
      clearOrder();
    } catch {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weeks = useMemo(() => {
    if (!result || !orderSnap) return [];
    return buildWeeks(result.startDate, result.endDate, orderSnap.mealPlan);
  }, [result, orderSnap]);

  if (!result) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        style={{ background: "var(--bg-pale)" }}
      >
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          결제 정보를 불러오는 중...
        </p>
      </div>
    );
  }

  const discount = result.discountInfo?.discountAmount ?? 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      <div className="mx-auto max-w-[720px] px-5 pt-12 pb-12">
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
              color: "var(--ink)",
            }}
          >
            <Check size={26} strokeWidth={2.2} />
          </div>
          <h1 className="t-h1 mb-2" style={{ color: "var(--ink)" }}>
            결제가 완료되었습니다
          </h1>
          <p className="t-small" style={{ color: "var(--ink-light)" }}>
            주문 번호 {result.orderNumber}
          </p>
          <p className="t-caption mt-1" style={{ color: "var(--neutral-stone)" }}>
            {toKoreanDate(result.orderDate)} 결제
          </p>
        </div>

        {/* 구독 기간 */}
        <SectionCard label="Subscription Period" className="mb-4">
          <div className="px-5 py-4 flex items-baseline justify-between gap-3">
            <span className="t-small" style={{ color: "var(--ink-light)" }}>구독 기간</span>
            <span className="t-small text-right" style={{ color: "var(--ink)" }}>
              {toKoreanDate(result.startDate)} ~ {toKoreanDate(result.endDate)}
            </span>
          </div>
        </SectionCard>

        {/* 식단 일정 */}
        {weeks.length > 0 && (
          <SectionCard label="Meal Schedule" className="mb-4">
            <div className="flex flex-col">
              {weeks.map((week) => (
                <WeekBlock key={week.index} week={week} isLast={week.index === weeks.length} />
              ))}
            </div>
          </SectionCard>
        )}

        {/* fallback — 식단 데이터가 없는 경우 (재방문 등) */}
        {weeks.length === 0 && result.products && result.products.length > 0 && (
          <SectionCard label="Products" className="mb-4">
            <ul>
              {result.products.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{
                    borderBottom:
                      i < result.products.length - 1
                        ? "1px solid var(--neutral-stone)"
                        : undefined,
                  }}
                >
                  {p.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="object-cover shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "var(--r-btn)",
                        background: "var(--bg-off)",
                        border: "1px solid var(--neutral-stone)",
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="t-small truncate" style={{ color: "var(--ink)" }}>{p.name}</p>
                    <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
                      수량 {p.quantity}
                    </p>
                  </div>
                  <span className="t-small shrink-0" style={{ color: "var(--ink)" }}>
                    {p.price.toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {/* 결제 금액 */}
        <SectionCard label="Payment" className="mb-8">
          <div className="px-5 py-4 flex flex-col gap-3 t-small">
            <PriceRow label="상품 금액" value={`${result.originalAmount.toLocaleString()}원`} />
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
                {result.finalAmount.toLocaleString()}원
              </span>
            </div>
          </div>
        </SectionCard>

        {/* CTA */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn btn-dark w-full btn-lg"
        >
          홈으로 돌아가기
        </button>
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

function WeekBlock({ week, isLast }: { week: WeekGroup; isLast: boolean }) {
  return (
    <div
      style={{
        borderBottom: !isLast ? "1px solid var(--neutral-stone)" : undefined,
      }}
    >
      {/* week header */}
      <header
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ background: "var(--bg-pale)" }}
      >
        <div className="flex flex-col gap-1">
          <p
            className="t-caption"
            style={{
              color: "var(--ink-light)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Week {String(week.index).padStart(2, "0")}
          </p>
          <p className="t-h3" style={{ color: "var(--ink)" }}>
            {formatShort(week.start)} — {formatShort(week.end)}
          </p>
        </div>
        <div className="text-right flex flex-col gap-1">
          <span className="t-caption" style={{ color: "var(--ink-light)" }}>
            {week.mealCount}끼
          </span>
          <span className="t-small" style={{ color: "var(--ink)" }}>
            {week.weekTotal.toLocaleString()}원
          </span>
        </div>
      </header>

      {/* schedule grid */}
      <MealGrid days={week.days} />
    </div>
  );
}

function MealGrid({ days }: { days: DayCol[] }) {
  const columns = `48px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div
      className="overflow-x-auto"
      style={{
        background: "var(--ink)",
        gap: 1,
      }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: columns,
          gap: 1,
          background: "var(--ink)",
        }}
      >
        {/* 헤더 행 */}
        <HeaderCell label="" />
        {days.map((d) => {
          const dow = d.date.getDay();
          const tone =
            dow === 0
              ? "var(--alert-red)"
              : dow === 6
              ? "var(--neutral-blue)"
              : "var(--ink)";
          return (
            <div
              key={`h-${d.date.toISOString()}`}
              className="flex flex-col items-center justify-center py-2"
              style={{ background: "var(--bg-pale)", color: tone }}
            >
              <span className="t-caption" style={{ color: "inherit" }}>
                {WEEKDAY_KO[dow]}
              </span>
              <span className="t-small" style={{ color: "inherit" }}>
                {d.date.getDate()}
              </span>
            </div>
          );
        })}

        {/* 점심 행 */}
        <RowLabel label="점심" />
        {days.map((d) => (
          <MealCell key={`l-${d.date.toISOString()}`} meal={d.lunch} />
        ))}

        {/* 저녁 행 */}
        <RowLabel label="저녁" />
        {days.map((d) => (
          <MealCell key={`d-${d.date.toISOString()}`} meal={d.dinner} />
        ))}
      </div>
    </div>
  );
}

function HeaderCell({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ background: "var(--bg-pale)" }}
    >
      <span className="t-caption" style={{ color: "var(--ink-light)" }}>
        {label}
      </span>
    </div>
  );
}

function RowLabel({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ background: "var(--bg-pale)" }}
    >
      <span className="t-caption" style={{ color: "var(--ink-light)" }}>
        {label}
      </span>
    </div>
  );
}

function MealCell({ meal }: { meal: DisplayMenuData | null }) {
  if (!meal) {
    return (
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "var(--bg-off)",
        }}
      />
    );
  }

  return (
    <div
      title={meal.displayName}
      className="relative overflow-hidden"
      style={{
        aspectRatio: "1 / 1",
        background: "var(--bg-off)",
      }}
    >
      <MealImage
        src={meal.image}
        alt={meal.displayName}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
