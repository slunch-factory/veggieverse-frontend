"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
 * 마이페이지 주문/구독 내역 공용 UI 프리미티브 (정돈된 에디토리얼).
 * 구독(subscriptions)·주문(orders)의 목록·상세 4개 화면이 카드 프레임·섹션
 * 카드·상품 미리보기·배지·날짜 포맷을 공유한다.
 * ──────────────────────────────────────────────────────────────────────── */

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${formatDate(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

/* ---------- 목록 카드 프레임 ---------- */

export function OrderCardShell({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
        boxShadow: "2px 2px 0 var(--ink)",
      }}
    >
      {children}
    </div>
  );
}

export function CardDivider() {
  return <div style={{ height: 1, background: "var(--neutral-stone)" }} />;
}

/** 카드 상단 작은 라벨 (예: "구독 · ORD-…"). */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="t-caption" style={{ color: "var(--ink-light)", letterSpacing: "0.04em" }}>
      {children}
    </p>
  );
}

/* ---------- 상세 섹션 카드 ---------- */

export function SectionCard({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
        boxShadow: "2px 2px 0 var(--ink)",
        overflow: "hidden",
      }}
    >
      <header
        className="px-5 py-3"
        style={{ borderBottom: "1px solid var(--ink)", background: "var(--bg-pale)" }}
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

export function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="t-caption" style={{ color: "var(--ink-light)" }}>
        {label}
      </span>
      <span className="t-small text-right" style={{ color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

export function PriceRow({
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

/* ---------- 배지 ---------- */

export function StatusPill({
  bg,
  color,
  border,
  dot,
  label,
}: {
  bg: string;
  color: string;
  border: string;
  dot?: string;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 shrink-0"
      style={{
        background: bg,
        color,
        padding: "3px 10px",
        borderRadius: "var(--r-pill)",
        border: `1px solid ${border}`,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      {dot && (
        <span
          style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }}
        />
      )}
      {label}
    </span>
  );
}

export type LifecyclePhase = "준비중" | "진행중" | "종료됨";

const PHASE_DOT: Record<LifecyclePhase, string> = {
  준비중: "var(--neutral-lavender)",
  진행중: "var(--neutral-blue)",
  종료됨: "var(--neutral-stone)",
};

/** 구독 진행 상태 배지 (시작/종료 날짜에서 파생). 아웃라인 스타일. */
export function LifecycleBadge({ phase }: { phase: LifecyclePhase }) {
  return (
    <StatusPill bg="transparent" color="var(--ink)" border="var(--ink)" dot={PHASE_DOT[phase]} label={phase} />
  );
}

export type StoreFulfillmentLabel =
  | "결제완료"
  | "배송중"
  | "배송완료"
  | "환불됨"
  | "취소됨"
  | "기타";

// 백엔드 상태코드 → 스토어 이행 라벨. PENDING은 목록에서 제외되므로 매핑하지 않는다.
const STORE_STATUS_LABEL: Record<string, StoreFulfillmentLabel> = {
  PAID: "결제완료",
  SHIPPING: "배송중",
  COMPLETED: "배송완료",
  REFUNDED: "환불됨",
  CANCELED: "취소됨",
};

export function mapStoreStatus(status: string): StoreFulfillmentLabel {
  return STORE_STATUS_LABEL[status] ?? "기타";
}

const STORE_TONE: Record<StoreFulfillmentLabel, { bg: string; color: string; border: string }> = {
  결제완료: { bg: "var(--point)", color: "var(--ink)", border: "var(--ink)" },
  배송중: { bg: "var(--neutral-blue)", color: "var(--ink)", border: "var(--ink)" },
  배송완료: { bg: "var(--bg-off)", color: "var(--ink-light)", border: "var(--neutral-stone)" },
  환불됨: { bg: "var(--bg-off)", color: "var(--alert-red)", border: "var(--neutral-stone)" },
  취소됨: { bg: "var(--bg-off)", color: "var(--alert-red)", border: "var(--neutral-stone)" },
  기타: { bg: "var(--bg-off)", color: "var(--ink-light)", border: "var(--neutral-stone)" },
};

/** 스토어 주문 이행 상태 배지 (결제완료/배송중/배송완료/환불/취소). */
export function StoreOrderStatusBadge({ status }: { status: string }) {
  const label = mapStoreStatus(status);
  const t = STORE_TONE[label];
  return <StatusPill bg={t.bg} color={t.color} border={t.border} label={label} />;
}

/* ---------- 상품 미리보기 (더보기) ---------- */

export interface PreviewProduct {
  name: string;
  quantity: number;
  imageUrl?: string | null;
}

export function ProductPreviewList({
  products,
  visibleCount = 3,
  showThumbnails = false,
}: {
  products: PreviewProduct[];
  visibleCount?: number;
  showThumbnails?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, products.length - visibleCount);
  const visible = expanded ? products : products.slice(0, visibleCount);
  const gap = showThumbnails ? "gap-3" : "gap-2";

  return (
    <div className={`px-5 py-4 flex flex-col ${gap}`}>
      <ul className={`flex flex-col ${gap}`}>
        {visible.map((item, idx) => (
          <li key={idx} className="flex items-center gap-3">
            {showThumbnails && (
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
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <p
              className={`t-small ${showThumbnails ? "flex-1 min-w-0 truncate" : ""}`}
              style={{ color: "var(--ink)" }}
            >
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
      {hiddenCount > 0 && (
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
