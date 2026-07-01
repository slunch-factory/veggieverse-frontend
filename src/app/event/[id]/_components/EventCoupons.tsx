"use client";

import { CouponCard } from "@/components/ui/CouponCard";
import { getCoupon } from "../../_data/coupons";

/** 이벤트 상세의 쿠폰 발급 섹션. 코드 → 카탈로그 조회 후 발급형 카드로 렌더. */
export function EventCoupons({ codes }: { codes: string[] }) {
  const coupons = codes.map(getCoupon).filter((c) => c !== undefined);
  if (coupons.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-[18px] text-black mb-3">이벤트 쿠폰</h2>
      <div className="flex flex-col gap-3">
        {coupons.map((coupon) => (
          <CouponCard key={coupon.code} coupon={coupon} claimable />
        ))}
      </div>
    </section>
  );
}
