"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** 서버 스냅샷 — SSR/최초 렌더에서는 모션 허용(false)으로 가정해 하이드레이션 불일치를 피한다. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * OS의 "동작 줄이기"(`prefers-reduced-motion: reduce`) 설정을 구독하는 공통 훅.
 *
 * framer-motion에 의존하지 않으므로 Lottie · Three.js · 순수 JS 애니메이션 등
 * 어디서든 동일한 기준으로 모션을 끌 수 있다. framer-motion 컴포넌트는 자체
 * `useReducedMotion`으로 transform/opacity를 자동 축소하지만, 모션 재생 여부 자체를
 * 분기해야 하는 곳(예: Lottie `autoplay`, Modal 전환 duration)에서는 이 훅을 쓴다.
 *
 * `useSyncExternalStore`로 matchMedia를 구독해 SSR-안전하며, 설정 변경에 즉시 반응한다.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
