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
      {/* Marquee track — 절반씩 두 벌 복사, -50% 애니메이션으로 루프 공백 제거 */}
      <div className="marquee-track flex whitespace-nowrap" style={{ width: "max-content" }}>
        {[0, 1].map((half) => (
          <div key={half} className="flex whitespace-nowrap flex-shrink-0" aria-hidden={half === 1 ? "true" : undefined}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Link
                key={i}
                href="/event"
                className="text-[#DCFD4A] text-[12px] leading-[1.2] whitespace-nowrap"
                style={{ paddingRight: "6rem" }}
                tabIndex={half === 0 && i === 0 ? 0 : -1}
              >
                {MESSAGE}
              </Link>
            ))}
          </div>
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
          animation: marquee-left 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
