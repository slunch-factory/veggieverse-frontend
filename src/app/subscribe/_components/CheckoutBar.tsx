"use client";

import { formatPrice } from "../_data/subscription";

interface CheckoutBarProps {
  totalPrice: number;
  filledSlots: number;
  onSubmit: () => void;
}

export function CheckoutBar({ totalPrice, filledSlots, onSubmit }: CheckoutBarProps) {
  const disabled = filledSlots === 0;

  return (
    <section
      className="flex shrink-0 flex-col gap-3 border-t border-black bg-white px-6 py-4"
      aria-label="결제"
    >
      <div className="flex items-center justify-between text-[13px] text-gray-400">
        <span>{filledSlots}끼 선택</span>
        <span>최대 14끼</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-black">총 금액</span>
        <span className="text-[22px] font-bold tracking-tight text-black leading-none">
          {formatPrice(totalPrice)}
        </span>
      </div>
      <button
        disabled={disabled}
        onClick={() => { if (!disabled) onSubmit(); }}
        className={`w-full h-12 text-[14px] tracking-wide transition-colors rounded-lg ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-300"
            : "bg-black text-white hover:bg-[#8C451D]"
        }`}
      >
        {disabled ? "식단을 먼저 구성해주세요" : "결제하기"}
      </button>
    </section>
  );
}
