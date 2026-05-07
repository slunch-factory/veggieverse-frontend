"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getOrderDetail,
  type OrderDetailProduct,
  type OrderDetailResponse,
} from "@/lib/api/subscription";
import { FIXED_USER_ID } from "@/lib/api/payment";
import { WEEKDAY_KO } from "@/app/subscribe/_data/subscription";

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

const CYCLE_LABEL: Record<string, string> = {
  WEEKLY: "주 1회",
  BIWEEKLY: "격주",
  MONTHLY: "월 1회",
  BIMONTHLY: "2개월 1회",
};

interface DayCol {
  date: Date;
  slots: (OrderDetailProduct | null)[];
}

interface ScheduleWeek {
  index: number;
  start: Date;
  end: Date;
  days: DayCol[];
  slotsPerDay: number;
}

/** 평면 products → 주차별 day×slot 그리드. 슬롯 정보가 없으므로 day-then-slot 순서로 sequential 배치. */
function buildSchedule(
  startISO: string,
  endISO: string,
  products: OrderDetailProduct[],
): ScheduleWeek[] {
  const start = new Date(startISO);
  const end = new Date(endISO);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const numDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  // quantity 만큼 펼침
  const expanded: OrderDetailProduct[] = [];
  for (const p of products) {
    for (let i = 0; i < p.quantity; i++) expanded.push(p);
  }

  const slotsPerDay = expanded.length > 0 ? Math.max(1, Math.ceil(expanded.length / numDays)) : 1;
  const weekCount = Math.ceil(numDays / 7);

  const weeks: ScheduleWeek[] = [];
  let mealIdx = 0;
  for (let w = 0; w < weekCount; w++) {
    const weekStart = new Date(start);
    weekStart.setDate(start.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    if (weekEnd > end) weekEnd.setTime(end.getTime());

    const days: DayCol[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > end) break;
      const slots: (OrderDetailProduct | null)[] = [];
      for (let s = 0; s < slotsPerDay; s++) {
        slots.push(expanded[mealIdx] ?? null);
        mealIdx++;
      }
      days.push({ date: d, slots });
    }
    weeks.push({ index: w + 1, start: weekStart, end: weekEnd, days, slotsPerDay });
  }
  return weeks;
}

function slotLabel(slotsPerDay: number, slotIdx: number): string {
  if (slotsPerDay === 1) return "식사";
  if (slotsPerDay === 2) return slotIdx === 0 ? "점심" : "저녁";
  if (slotsPerDay === 3) return ["아침", "점심", "저녁"][slotIdx] ?? `${slotIdx + 1}끼`;
  return `${slotIdx + 1}끼`;
}

export function SubscriptionDetailClient() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const [data, setData] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    getOrderDetail(orderId, FIXED_USER_ID).then((res) => {
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
  }, [orderId]);

  const weeks = useMemo(
    () =>
      data ? buildSchedule(data.startDate, data.endDate, data.products) : [],
    [data],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          구독 상세를 불러오는 중...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="t-small" style={{ color: "var(--alert-red)" }}>
          구독 상세를 불러오지 못했습니다.
        </p>
        <Link href="/mypage/subscriptions" className="btn btn-ghost btn-sm">
          구독 내역으로 돌아가기
        </Link>
      </div>
    );
  }

  const totalMealCount = data.products.reduce((sum, p) => sum + p.quantity, 0);
  const cycleLabel = CYCLE_LABEL[data.deliveryCycle] ?? data.deliveryCycle;
  const discount = data.discountInfo?.discountAmount ?? 0;
  const couponName = data.discountInfo?.couponName;

  return (
    <div className="mx-auto max-w-[720px]">
      {/* 백 링크 */}
      <button
        type="button"
        onClick={() => router.push("/mypage/subscriptions")}
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
        구독 내역
      </button>

      {/* 주문 헤더 */}
      <header className="mb-8">
        <h1 className="t-h2 mb-2" style={{ color: "var(--ink)" }}>구독 상세</h1>
        <p className="t-small" style={{ color: "var(--ink-light)" }}>
          {data.orderNumber}
        </p>
        <p className="t-caption mt-0.5" style={{ color: "var(--neutral-stone)" }}>
          {formatDateTime(data.orderDate)} 결제
        </p>
      </header>

      {/* 구독 기간 */}
      <SectionCard label="Subscription Period" className="mb-4">
        <div className="px-5 py-4 flex flex-col gap-2">
          <SummaryRow label="구독 기간" value={`${formatDate(data.startDate)} ~ ${formatDate(data.endDate)}`} />
          <SummaryRow label="배송 주기" value={cycleLabel} />
          <SummaryRow label="총 끼수" value={`${totalMealCount}끼`} />
        </div>
      </SectionCard>

      {/* 식단 일정 */}
      {weeks.length > 0 && (
        <SectionCard label="Meal Schedule" className="mb-4">
          <div className="flex flex-col">
            {weeks.map((week) => (
              <WeekBlock
                key={week.index}
                week={week}
                isLast={week.index === weeks.length}
                showWeekHeader={weeks.length > 1}
              />
            ))}
          </div>
        </SectionCard>
      )}

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
              label={couponName ? `할인 (${couponName})` : "할인"}
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

/* ─── 식단 일정 그리드 ─── */

function WeekBlock({
  week,
  isLast,
  showWeekHeader,
}: {
  week: ScheduleWeek;
  isLast: boolean;
  showWeekHeader: boolean;
}) {
  const mealCount = week.days.reduce(
    (sum, d) => sum + d.slots.filter((s) => s !== null).length,
    0,
  );
  return (
    <div
      style={{
        borderBottom: !isLast ? "1px solid var(--neutral-stone)" : undefined,
      }}
    >
      {showWeekHeader && (
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
              {formatDate(week.start.toISOString())} — {formatDate(week.end.toISOString())}
            </p>
          </div>
          <div className="text-right">
            <span className="t-caption" style={{ color: "var(--ink-light)" }}>
              {mealCount}끼
            </span>
          </div>
        </header>
      )}
      <MealGrid days={week.days} slotsPerDay={week.slotsPerDay} />
    </div>
  );
}

function MealGrid({ days, slotsPerDay }: { days: DayCol[]; slotsPerDay: number }) {
  const columns = `48px repeat(${days.length}, minmax(0, 1fr))`;

  return (
    <div className="overflow-x-auto" style={{ background: "var(--ink)" }}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: columns,
          gap: 1,
          background: "var(--ink)",
        }}
      >
        {/* 헤더 행: 빈 셀 + 요일/일자 */}
        <HeaderCell />
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

        {/* 슬롯별 행 */}
        {Array.from({ length: slotsPerDay }).map((_, slotIdx) => (
          <SlotRow
            key={slotIdx}
            label={slotLabel(slotsPerDay, slotIdx)}
            cells={days.map((d) => d.slots[slotIdx] ?? null)}
            keyPrefix={`s${slotIdx}`}
          />
        ))}
      </div>
    </div>
  );
}

function SlotRow({
  label,
  cells,
  keyPrefix,
}: {
  label: string;
  cells: (OrderDetailProduct | null)[];
  keyPrefix: string;
}) {
  return (
    <>
      <div
        className="flex items-center justify-center"
        style={{ background: "var(--bg-pale)" }}
      >
        <span className="t-caption" style={{ color: "var(--ink-light)" }}>
          {label}
        </span>
      </div>
      {cells.map((meal, i) => (
        <MealCell key={`${keyPrefix}-${i}`} meal={meal} />
      ))}
    </>
  );
}

function HeaderCell() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ background: "var(--bg-pale)" }}
    />
  );
}

function MealCell({ meal }: { meal: OrderDetailProduct | null }) {
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
      title={meal.name}
      className="relative overflow-hidden"
      style={{
        aspectRatio: "1 / 1",
        background: "var(--bg-off)",
      }}
    >
      {meal.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-1 text-center">
          <span className="t-caption" style={{ color: "var(--ink-light)", lineHeight: 1.2 }}>
            {meal.name}
          </span>
        </div>
      )}
    </div>
  );
}
