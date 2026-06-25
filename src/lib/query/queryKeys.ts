/**
 * React Query 쿼리 키 중앙 관리.
 * 도메인별로 키를 한 곳에서 정의해 무효화(invalidate)/프리페치 시 오타·불일치를 막는다.
 */
export const queryKeys = {
  store: {
    orderHistory: (options?: { page?: number; size?: number }) =>
      ["store", "orderHistory", options ?? {}] as const,
    orderDetail: (orderId: number | string) =>
      ["store", "orderDetail", String(orderId)] as const,
  },
  subscription: {
    orderHistory: (options?: { page?: number; size?: number }) =>
      ["subscription", "orderHistory", options ?? {}] as const,
    orderDetail: (orderId: number | string) =>
      ["subscription", "orderDetail", String(orderId)] as const,
  },
} as const;
