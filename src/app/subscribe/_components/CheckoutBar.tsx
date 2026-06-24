"use client";

import { formatPrice } from "../_data/subscription";

interface CheckoutBarProps {
  totalPrice: number;
  filledSlots: number;
  totalSlots: number;
  onSubmit: () => void;
}

export function CheckoutBar({ totalPrice, filledSlots, totalSlots, onSubmit }: CheckoutBarProps) {
  const disabled = filledSlots === 0;

  return (
    <section
      className="flex shrink-0 flex-col border-t border-black bg-[#fcfaf8] px-6 py-7"
      aria-label="결제"
    >
      <div className="flex flex-row items-center gap-[10px]">
        {/* 좌: 선택 진행도 */}
        <div className="flex-1 min-w-0 flex flex-col gap-[3px]">
          <span className="text-[11px] font-medium text-[#9a928c] tracking-[-0.01em] leading-snug">
            선택한 식단
          </span>
          <span className="text-[18px] font-extrabold text-black tracking-[-0.02em] leading-tight tabular-nums">
            {filledSlots} / {totalSlots}끼
          </span>
        </div>
        {/* 우: 총 금액 */}
        <div className="flex flex-col items-end gap-[3px] shrink-0">
          <span className="text-[11px] font-medium text-[#9a928c] leading-snug">총 구매 금액</span>
          <span className="text-[18px] font-extrabold text-black tracking-[-0.02em] leading-tight tabular-nums">
            {formatPrice(totalPrice)}
          </span>
        </div>
        {/* CTA */}
        <button
          disabled={disabled}
          onClick={() => { if (!disabled) onSubmit(); }}
          className={`shrink-0 px-[22px] py-[11px] text-[14px] tracking-[0.02em] border rounded-[8px] ${
            disabled
              ? "opacity-[0.32] cursor-not-allowed pointer-none"
              : "bg-[#250a00] text-[#dcfd4a] border-[#250a00] hover:bg-[#6e5035], hover:text-white"
          }`}
        >
          구매
        </button>
      </div>
    </section>
  );
}
