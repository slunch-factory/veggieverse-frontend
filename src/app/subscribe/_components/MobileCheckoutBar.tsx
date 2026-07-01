"use client";

import { formatPrice } from "../_data/subscription";

interface MobileCheckoutBarProps {
  totalPrice: number;
  filledSlots: number;
  totalSlots: number;
  onSubmit: () => void;
  onOpenMenu: () => void;
}

export function MobileCheckoutBar({
  totalPrice,
  filledSlots,
  totalSlots,
  onSubmit,
  onOpenMenu,
}: MobileCheckoutBarProps) {
  const disabled = filledSlots === 0;

  return (
    <div className="flex flex-col border-t border-black bg-[#fcfaf8] px-[14px] py-3 gap-[10px]">
      <div className="flex flex-row items-center gap-[6px] min-height-[48px]">
        {/* 좌: 끼 수 + 금액 */}
        <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
          <span className="text-[10px] font-medium text-[#9a928c] tracking-[-0.01em]">
            식단 {filledSlots}/{totalSlots}끼 선택
          </span>
          <span className="text-[17px] font-extrabold text-black tracking-[-0.02em] leading-tight tabular-nums">
            {formatPrice(totalPrice)}
          </span>
        </div>
        {/* + 메뉴 추가 버튼 */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="메뉴 추가"
          className="w-10 h-10 shrink-0 border border-black rounded-full flex items-center justify-center text-[17px] leading-none font-light bg-[#fcfaf8] text-[#3d3d3d] hover:bg-black hover:text-[#dfff4f] transition-colors"
        >
          +
        </button>
        {/* 결제 CTA */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => { if (!disabled) onSubmit(); }}
          className={`shrink-0 min-h-[40px] px-[18px] text-[14px] tracking-[0.02em] border transition-colors ${
            disabled
              ? "bg-[#bdbdbd] text-[#9a928c] border-[#ccc5c0] cursor-not-allowed"
              : "bg-black text-[#dfff4f] border-black hover:bg-[#1a0a05]"
          }`}
        >
          구매
        </button>
      </div>
    </div>
  );
}
