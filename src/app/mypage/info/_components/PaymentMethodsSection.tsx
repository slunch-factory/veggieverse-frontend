"use client";

import { CreditCard } from "lucide-react";
import { useBillingCards } from "@/lib/query/subscription";
import type { BillingCard } from "@/lib/api/subscription";

/**
 * 회원정보 내 "결제수단" 섹션 — 구독 정기결제용으로 등록된 카드(빌링키)를 확인한다.
 * 조회 API(GET /subscription/billing/keys)가 아직 없으면 status:"not_ready"로 내려와 준비중 안내.
 * (FormSection이 info/page 로컬 컴포넌트라 동일 스타일을 여기서 자체 구성)
 */
export function PaymentMethodsSection() {
  const { data, isLoading } = useBillingCards();
  const cards = data?.cards ?? [];

  return (
    <section
      style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
    >
      <header
        className="px-5 py-4 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--neutral-stone)", color: "var(--ink)" }}
      >
        <CreditCard size={16} strokeWidth={1.5} />
        <h2 className="t-h3" style={{ color: "var(--ink)" }}>결제수단</h2>
      </header>

      <div className="px-5 py-5">
        {isLoading ? (
          <p className="t-small" style={{ color: "var(--neutral-stone)" }}>불러오는 중…</p>
        ) : cards.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {cards.map((card) => (
              <CardRow key={card.billingKeyId} card={card} />
            ))}
          </ul>
        ) : (
          <p className="t-small" style={{ color: "var(--ink-light)", lineHeight: 1.6 }}>
            {data?.status === "not_ready"
              ? "결제수단 조회 기능이 곧 제공될 예정이에요."
              : "등록된 결제수단이 없습니다. 구독 정기결제를 시작하면 카드가 등록됩니다."}
          </p>
        )}
      </div>
    </section>
  );
}

function CardRow({ card }: { card: BillingCard }) {
  const active = !card.status || card.status.toUpperCase() === "ACTIVE";
  return (
    <li
      className="flex items-center gap-3 px-4 py-3"
      style={{ border: "1px solid var(--bg-off)", borderRadius: "var(--r-btn)", background: "var(--bg-pale)" }}
    >
      <CreditCard size={18} strokeWidth={1.5} style={{ color: "var(--ink-light)", flexShrink: 0 }} />
      <span className="t-small" style={{ color: "var(--ink)" }}>
        {card.cardCompany || "등록 카드"}
        {card.cardLast4 && (
          <span style={{ color: "var(--ink-light)" }}> ···· {card.cardLast4}</span>
        )}
      </span>
      {!active && (
        <span
          className="ml-auto shrink-0 rounded-[var(--r-pill)] px-2 py-0.5 text-[11px]"
          style={{ background: "var(--bg-off)", color: "var(--neutral-stone)" }}
        >
          비활성
        </span>
      )}
    </li>
  );
}
