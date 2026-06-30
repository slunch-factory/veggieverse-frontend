/**
 * 백엔드 공통 주문 상태 코드.
 * 구독(`subscription`)·스토어(`store`) 주문의 `OrderSummaryResponse.status` /
 * `OrderDetailResponse.status`가 공유하는 enum이다. (백엔드 OrderStatus와 1:1)
 */
export type OrderStatusCode =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "COMPLETED";

/**
 * 결제 미완료(결제대기) 상태인지.
 * 1차 런칭에서는 PENDING 주문을 마이페이지 목록에 노출하지 않는다.
 * (재결제 플로우 없이 DB TTL로 정리 — 결제완료 시 PAID 이상으로 전환된 주문만 표시)
 */
export function isAwaitingPayment(status: string | null | undefined): boolean {
  return status === "PENDING";
}
