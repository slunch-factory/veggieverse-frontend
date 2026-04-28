"use client";

import { formatPrice } from "../_data/subscription";

interface MobileCheckoutBarProps {
  totalPrice: number;
  filledSlots: number;
  onSubmit: () => void;
  onOpenMenu: () => void;
}

export function MobileCheckoutBar({
  totalPrice,
  filledSlots,
  onSubmit,
  onOpenMenu,
}: MobileCheckoutBarProps) {
  const disabled = filledSlots === 0;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-black">
      <div className="flex-1 min-w-0">
        <span className="text-[12px] text-gray-400">{filledSlots}끼 · </span>
        <span className="text-[16px] font-bold tracking-tight">
          {formatPrice(totalPrice)}
        </span>
      </div>
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="메뉴 추가"
        className="w-10 h-10 border border-black flex items-center justify-center text-[20px] leading-none shrink-0 hover:bg-black hover:text-white transition-colors"
      >
        +
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) onSubmit();
        }}
        className={`h-10 px-5 text-[13px] shrink-0 transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-black text-white hover:bg-[#8C451D]"
        }`}
      >
        결제하기
      </button>
    </div>
  );
}
