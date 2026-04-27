"use client";

import { formatPrice } from "../_data/subscription";

interface CheckoutBarProps {
  totalPrice: number;
  filledSlots: number;
  onSubmit: () => void;
}

export function CheckoutBar({ totalPrice, filledSlots, onSubmit }: CheckoutBarProps) {
  const disabled = filledSlots === 0;
  const label = disabled ? "식단을 먼저 구성해주세요" : "결제하기";

  return (
    <section
      className="flex shrink-0 items-center gap-3 border-t border-gray-200 bg-white px-4 py-3"
      aria-label="결제"
    >
      <p className="flex-1 text-[20px] leading-tight tracking-tight">
        {formatPrice(totalPrice)}
      </p>
      <button
        disabled={disabled}
        onClick={() => { if (!disabled) onSubmit(); }}
        className={`h-10 shrink-0 px-4 text-[13px] transition-all ${
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-300"
            : "bg-black text-white hover:bg-gray-900"
        }`}
      >
        {label}
      </button>
    </section>
  );
}
