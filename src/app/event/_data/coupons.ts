/**
 * 목(mock) 쿠폰 카탈로그 — 1차 외형용.
 * 발급 상태는 CouponContext가 localStorage로 관리하고, 이 파일은 정적 카탈로그만 제공한다.
 * 백엔드 쿠폰 API가 생기면 이 카탈로그와 발급 로직을 데이터 레이어로 교체한다.
 */

export interface Coupon {
  /** 발급/식별 코드. */
  code: string;
  title: string;
  /** 할인 표기 — "15%" 또는 "3,000원". */
  discountLabel: string;
  /** 사용 조건 표기. */
  minOrderLabel?: string;
  /** 적용 범위 표기. */
  scope?: string;
  /** "YYYY.MM.DD" 사용 만료일. */
  expiresAt: string;
}

export const COUPONS: Coupon[] = [
  { code: "WELCOME15", title: "신규가입 환영 15% 할인", discountLabel: "15%", minOrderLabel: "2만원 이상", scope: "스토어 전 상품", expiresAt: "2025.12.31" },
  { code: "WINTER3000", title: "윈터 비건 페스티벌 쿠폰", discountLabel: "3,000원", minOrderLabel: "2만원 이상", scope: "스토어 전 상품", expiresAt: "2024.12.31" },
  { code: "NEWYEAR20", title: "새해 첫 주문 20% 할인", discountLabel: "20%", minOrderLabel: "3만원 이상", scope: "스토어 전 상품", expiresAt: "2025.01.05" },
  { code: "VEGANUARY10", title: "비건 도전 응원 10% 할인", discountLabel: "10%", minOrderLabel: "1만원 이상", scope: "스토어 전 상품", expiresAt: "2025.01.31" },
  { code: "FREESHIP", title: "무료배송 쿠폰", discountLabel: "배송비 무료", scope: "스토어 전 상품", expiresAt: "2025.06.30" },
];

const BY_CODE: Record<string, Coupon> = Object.fromEntries(COUPONS.map((c) => [c.code, c]));

export function getCoupon(code: string): Coupon | undefined {
  return BY_CODE[code];
}

/** 이벤트 페이지 외에 상시 노출하는 기본 발급 쿠폰. */
export const GENERAL_COUPON_CODES = ["WELCOME15", "FREESHIP"];
