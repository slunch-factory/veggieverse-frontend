"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoreOrderHistory, getStoreOrderDetail } from "@/lib/api/store";
import { useUser } from "@/contexts/UserContext";
import { queryKeys } from "./queryKeys";

/**
 * 스토어 주문 내역 조회.
 * - 로그인 세션이 준비되고 로그인 상태일 때만 활성화(enabled).
 * - getStoreOrderHistory는 에러 시 null을 반환하므로 throw로 변환해 isError로 노출.
 * - staleTime(60s) 동안 재진입 시 캐시 히트(네트워크 없음).
 */
export function useStoreOrderHistory(options?: { page?: number; size?: number }) {
  const { isLoggedIn, isLoadingSession } = useUser();

  return useQuery({
    queryKey: queryKeys.store.orderHistory(options),
    queryFn: async () => {
      const res = await getStoreOrderHistory(options);
      if (!res) throw new Error("주문 내역을 불러오지 못했습니다.");
      return res;
    },
    enabled: !isLoadingSession && isLoggedIn,
  });
}

/**
 * 스토어 주문 상세 조회.
 * orderId가 있고 세션 준비 + 로그인 시에만 활성화.
 * 환불 등 변경 후엔 queryClient.setQueryData(queryKeys.store.orderDetail(orderId), ...)로 캐시 갱신.
 */
export function useStoreOrderDetail(orderId: number | string | undefined) {
  const { isLoggedIn, isLoadingSession } = useUser();

  return useQuery({
    queryKey: queryKeys.store.orderDetail(orderId ?? ""),
    queryFn: async () => {
      const res = await getStoreOrderDetail(orderId!);
      if (!res) throw new Error("주문 상세를 불러오지 못했습니다.");
      return res;
    },
    enabled: !isLoadingSession && isLoggedIn && orderId != null && orderId !== "",
  });
}
