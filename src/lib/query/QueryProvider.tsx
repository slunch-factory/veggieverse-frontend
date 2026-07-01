"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

/**
 * React Query 클라이언트 — App Router SSR-safe 패턴.
 * 서버에서는 요청마다 새 인스턴스, 브라우저에서는 싱글톤을 재사용한다.
 * (브라우저에서 매 렌더 새 클라이언트를 만들면 캐시가 날아가므로)
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // staleTime 동안은 같은 키 재요청 시 네트워크 없이 캐시 반환 →
        // 라우트 재진입 시 재페칭 대신 캐시 히트(Task 3 핵심 목표).
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // 서버: 요청 간 캐시 공유 방지를 위해 항상 새 인스턴스.
    return makeQueryClient();
  }
  // 브라우저: 싱글톤 재사용.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* dev 환경에서만 캐시 상태 패널 노출. prod 빌드에선 dead-code 제거됨. */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
