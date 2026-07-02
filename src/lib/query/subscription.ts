"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrderHistory,
  getOrderDetail,
  cancelSubscriptionOrder,
  getBillingCards,
} from "@/lib/api/subscription";
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

/**
 * 등록된 결제수단(빌링키/카드) 목록. 세션 준비 + 로그인 시에만 활성화.
 */
export function useBillingCards() {
  const { isLoggedIn, isLoadingSession } = useUser();
  return useQuery({
    queryKey: ["subscription", "billingCards"],
    queryFn: getBillingCards,
    enabled: !isLoadingSession && isLoggedIn,
  });
}

/**
 * 구독 취소 뮤테이션. 성공(ok) 시 해당 상세 + 목록 캐시를 무효화해 상태(취소됨)를 반영한다.
 * cancelSubscriptionOrder는 실패를 throw하지 않고 결과 객체로 반환하므로 호출부가 res.ok로 분기한다.
 */
export function useCancelSubscription(orderId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (opts?: { effective?: "IMMEDIATE" | "END_OF_TERM"; reason?: string }) =>
      cancelSubscriptionOrder(orderId, opts),
    onSuccess: (res) => {
      if (!res.ok) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.orderDetail(orderId) });
      queryClient.invalidateQueries({ queryKey: ["subscription", "orderHistory"] });
    },
  });
}
