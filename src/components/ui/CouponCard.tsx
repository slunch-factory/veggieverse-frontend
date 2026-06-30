"use client";

import { Check } from "lucide-react";
import { useCoupons } from "@/contexts/CouponContext";
import { useToast } from "@/components/ui/Toast";
import type { Coupon } from "@/app/event/_data/coupons";

/**
 * 티켓 모양 쿠폰 카드.
 * - claimable: 발급 버튼 노출(이벤트 페이지). 발급 시 토스트 + 발급완료 상태.
 * - 그 외(마이페이지): 보유 쿠폰 표시 전용.
 */
export function CouponCard({
  coupon,
  claimable = false,
}: {
  coupon: Coupon;
  claimable?: boolean;
}) {
  const { isClaimed, claim } = useCoupons();
  const toast = useToast();
  const claimed = isClaimed(coupon.code);

  const handleClaim = () => {
    const ok = claim(coupon.code);
    if (ok) toast.success("쿠폰을 발급받았어요.", { emoji: "🎟️", detail: `${coupon.title} · 마이페이지 > 쿠폰에서 확인` });
    else toast.info("이미 발급받은 쿠폰이에요.");
  };

  return (
    <div
      className="flex items-stretch overflow-hidden"
      style={{
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
        background: "var(--bg-white)",
        opacity: claimed && claimable ? 0.7 : 1,
      }}
    >
      {/* 할인 영역 */}
      <div
        className="flex flex-col items-center justify-center px-4 py-5 flex-shrink-0"
        style={{
          width: 104,
          background: "var(--bg-off)",
          borderRight: "1px dashed var(--neutral-stone)",
        }}
      >
        <span className="t-h3" style={{ color: "var(--ink)", lineHeight: 1.1, textAlign: "center" }}>
          {coupon.discountLabel}
        </span>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 items-center justify-between gap-3 px-4 py-4 min-w-0">
        <div className="min-w-0">
          <p className="t-small" style={{ color: "var(--ink)" }}>{coupon.title}</p>
          <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
            {[coupon.scope, coupon.minOrderLabel].filter(Boolean).join(" · ")}
          </p>
          <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
            ~{coupon.expiresAt}까지
          </p>
        </div>

        {claimable ? (
          claimed ? (
            <span
              className="inline-flex items-center gap-1 flex-shrink-0 t-caption"
              style={{ color: "var(--neutral-stone)" }}
            >
              <Check size={14} /> 발급완료
            </span>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              className="btn btn-dark btn-sm flex-shrink-0"
            >
              쿠폰 받기
            </button>
          )
        ) : (
          <span className="t-caption flex-shrink-0" style={{ color: "var(--point, var(--ink))" }}>
            보유 중
          </span>
        )}
      </div>
    </div>
  );
}
