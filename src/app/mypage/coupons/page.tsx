"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { useCoupons } from "@/contexts/CouponContext";
import { CouponCard } from "@/components/ui/CouponCard";
import { COUPONS, GENERAL_COUPON_CODES, getCoupon } from "@/app/event/_data/coupons";

export default function MyCouponsPage() {
  const { claimedCodes, isClaimed } = useCoupons();

  // 보유 쿠폰 — 카탈로그에 존재하는 발급분만.
  const owned = claimedCodes.map(getCoupon).filter((c) => c !== undefined);

  // 받을 수 있는 쿠폰 — 상시 발급 쿠폰 중 아직 미발급.
  // (undefined 제거를 먼저 해 타입을 Coupon[]로 좁힌 뒤 미발급 필터)
  const available = GENERAL_COUPON_CODES.map(getCoupon)
    .filter((c) => c !== undefined)
    .filter((c) => !isClaimed(c.code));

  return (
    <div className="mx-auto max-w-[800px] flex flex-col gap-8">
      {/* 보유 쿠폰 */}
      <section>
        <h2 className="t-h3 mb-3" style={{ color: "var(--ink)" }}>
          보유 쿠폰 {owned.length}
        </h2>
        {owned.length > 0 ? (
          <div className="flex flex-col gap-3">
            {owned.map((coupon) => (
              <CouponCard key={coupon.code} coupon={coupon} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ border: "1px dashed var(--neutral-stone)", borderRadius: "var(--r-btn)" }}>
            <Ticket size={36} color="var(--neutral-stone)" className="inline-block mb-3" />
            <p className="t-small mb-3" style={{ color: "var(--ink-light)" }}>보유한 쿠폰이 없습니다.</p>
            <Link
              href="/event"
              className="t-small"
              style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              이벤트에서 쿠폰 받기
            </Link>
          </div>
        )}
      </section>

      {/* 받을 수 있는 쿠폰 */}
      {available.length > 0 && (
        <section>
          <h2 className="t-h3 mb-3" style={{ color: "var(--ink)" }}>
            받을 수 있는 쿠폰
          </h2>
          <div className="flex flex-col gap-3">
            {available.map((coupon) => (
              <CouponCard key={coupon.code} coupon={coupon} claimable />
            ))}
          </div>
        </section>
      )}

      <p className="t-caption" style={{ color: "var(--neutral-stone)" }}>
        * 전체 쿠폰 {COUPONS.length}종 · 발급/사용은 백엔드 연동 전 외형 단계입니다.
      </p>
    </div>
  );
}
