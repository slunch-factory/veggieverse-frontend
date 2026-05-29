"use client";

// 이벤트 기능 임시 숨김 — 배너 클릭 시 /event 이동 차단(Link → span). 복구 시 Link 재도입.
interface TopBannerProps {
  onClose: () => void;
}

const MESSAGE = "🎁 슬런치가 처음이신 고객님은 지금 가입하고 할인쿠폰 받아가세요!";

export function TopBanner({ onClose }: TopBannerProps) {
  return (
    <div
      className="promo-bar relative w-full overflow-hidden"
      style={{ height: "var(--promo-h)", backgroundColor: "#250a00" }}
    >
      {/* absolute로 flex 흐름 밖에 배치 → width: max-content가 정확히 적용되어 translateX(-50%)가 정확한 half 너비를 가리킴 */}
      <div
        className="marquee-track"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          width: "max-content",
        }}
      >
        {[0, 1].map((half) => (
          <div
            key={half}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
            aria-hidden={half === 1 ? "true" : undefined}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <span
                key={i}
                className="text-[#DCFD4A] text-[12px] leading-[1.2] whitespace-nowrap select-none"
                style={{ paddingRight: "6rem" }}
              >
                {MESSAGE}
              </span>
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
