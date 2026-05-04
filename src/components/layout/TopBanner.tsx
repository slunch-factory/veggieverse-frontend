"use client";

import Link from "next/link";

interface TopBannerProps {
  onClose: () => void;
}

const MESSAGE = "🎁 슬런치가 처음이신 고객님은 지금 가입하고 할인쿠폰 받아가세요!";

export function TopBanner({ onClose }: TopBannerProps) {
  return (
    <div
      className="promo-bar relative w-full overflow-hidden flex items-center"
      style={{ height: "var(--promo-h)", backgroundColor: "#250a00" }}
    >
      {/* Marquee track — two copies for seamless loop */}
      <div className="marquee-track flex whitespace-nowrap">
        {[0, 1, 2, 3].map((i) => (
          <Link
            key={i}
            href="/event"
            className="text-[#DCFD4A] text-[12px] leading-[1.2] whitespace-nowrap"
            style={{ paddingRight: "6rem" }}
            tabIndex={i === 0 ? 0 : -1}
            aria-hidden={i !== 0 ? "true" : undefined}
          >
            {MESSAGE}
          </Link>
        ))}
      </div>

      {/* Close button — sits on top with matching bg to mask scrolling text */}
      <button
        onClick={onClose}
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center text-[#DCFD4A] text-[14px] leading-none hover:opacity-80 px-3"
        style={{ backgroundColor: "#250a00" }}
        aria-label="배너 닫기"
      >
        ×
      </button>

      <style>{`
        .marquee-track {
          animation: marquee-left 20s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-25%); }
        }
      `}</style>
    </div>
  );
}
