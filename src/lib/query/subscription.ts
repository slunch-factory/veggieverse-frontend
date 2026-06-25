"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderHistory, getOrderDetail } from "@/lib/api/subscription";
import { useUser } from "@/contexts/UserContext";
import { queryKeys } from "./queryKeys";

/**
 * 구독 주문 내역 목록.
 * 세션 준비 + 로그인 시에만 활성화. null 응답은 throw로 변환해 isError로 노출.
 */
export function useSubscriptionHistory(options?: { page?: number; size?: number }) {
  const { isLoggedIn, isLoadingSession } = useUser();

  return useQuery({
    queryKey: queryKeys.subscription.orderHistory(options),
    queryFn: async () => {
      const res = await getOrderHistory(options);
      if (!res) throw new Error("구독 내역을 불러오지 못했습니다.");
      return res;
    },
    enabled: !isLoadingSession && isLoggedIn,
  });
}

/**
 * 구독 주문 상세.
 * orderId가 있고 세션 준비 + 로그인 시에만 활성화.
 */
export function useSubscriptionDetail(orderId: number | string | undefined) {
  const { isLoggedIn, isLoadingSession } = useUser();

  return useQuery({
    queryKey: queryKeys.subscription.orderDetail(orderId ?? ""),
    queryFn: async () => {
      const res = await getOrderDetail(orderId!);
      if (!res) throw new Error("구독 상세를 불러오지 못했습니다.");
      return res;
    },
    enabled: !isLoadingSession && isLoggedIn && orderId != null && orderId !== "",
  });
}
