"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import {
  computeDeliverySchedule,
  formatDeliveryDate,
  type DeliverySchedule,
} from "@/lib/delivery";

/**
 * "지금 주문하면 O월 O일 도착 예정" 배송 안내.
 * 현재 시각(로컬=KST) 기준 계산이라 SSR/CSR 시각 차 hydration 불일치를 피하려고
 * 마운트 후에만 렌더한다. 정책 근거: memory delivery-cutoff-policy.
 *
 * variant:
 *  - "box"(기본): 배경 있는 안내 박스 — 결제/장바구니 등
 *  - "inline": 배경 없는 한 줄 — 상품 상세 등
 */
export function DeliveryEstimate({
  variant = "box",
  className = "",
}: {
  variant?: "box" | "inline";
  className?: string;
}) {
  const [schedule, setSchedule] = useState<DeliverySchedule | null>(null);

  useEffect(() => {
    // 마운트 시 1회 현재 시각으로 계산 (SSR/CSR 시각 차 hydration 불일치 방지)
    setSchedule(computeDeliverySchedule(new Date()));
  }, []);

  if (!schedule) return null;

  const arrival = formatDeliveryDate(schedule.delivery);
  const ship = formatDeliveryDate(schedule.ship);

  const body = (
    <>
      <Truck size={17} strokeWidth={2.2} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} aria-hidden />
      <span className="flex-1">
        <span style={{ color: "var(--ink)" }}>지금 주문하면 </span>
        <b style={{ color: "var(--primary-dark)" }}>{arrival} 도착</b>
        <span style={{ color: "var(--ink)" }}> 예정</span>
        <span style={{ color: "var(--ink-light)" }}> · {ship} 출고</span>
        <span className="mt-1 block text-[11px]" style={{ color: "var(--ink-light)" }}>
          평일 16시 이전 결제 시 당일 출고 기준 · 주말·공휴일 제외
        </span>
      </span>
    </>
  );

  if (variant === "inline") {
    return (
      <div className={`flex items-start gap-2 text-[13px] font-medium leading-[1.5] ${className}`}>
        {body}
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-[var(--r-btn)] px-4 py-3 text-[13px] font-medium leading-[1.5] ${className}`}
      style={{ background: "var(--primary-50)", border: "1px solid var(--primary-light)" }}
    >
      {body}
    </div>
  );
}
