"use client";

import Link from "next/link";

interface TopBannerProps {
  onClose: () => void;
}

export function TopBanner({ onClose }: TopBannerProps) {
  return (
    <div
      className="promo-bar relative w-full flex items-center justify-center px-4 bg-[#1a0a05]"
      style={{ height: "var(--promo-h)" }}
    >
      <div
        className="w-full flex items-center justify-center relative text-[#DCFD4A] text-[12px] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis"
      >
        <Link
          href="/event"
          className="hover:underline text-center text-[12px] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis text-[#DCFD4A]"
        >
          🎁 슬런치가 처음이신 고객님은 지금 가입하고 할인쿠폰 받아가세요!
        </Link>
        <button
          onClick={onClose}
          className="absolute right-2 px-1 hover:opacity-80 flex items-center justify-center text-[#DCFD4A] text-[14px] leading-none min-w-[24px] min-h-[24px]"
          aria-label="배너 닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}
