"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
].join(",");

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el === document.activeElement,
  );
}

/**
 * 레이어(모달/다이얼로그)에 키보드 포커스를 가두고, 닫힐 때 직전 포커스로 복귀시킨다.
 *
 * - `active`가 true가 되면: 열기 직전 `document.activeElement`(트리거)를 저장하고,
 *   `initialFocusRef` 또는 컨테이너 내 첫 포커스 가능 요소(없으면 컨테이너 자체)로 포커스 이동.
 * - Tab / Shift+Tab을 컨테이너 안에서 순환시켜 배경으로 새어나가지 않게 한다.
 * - `active`가 false가 되거나 언마운트되면: 저장한 트리거로 포커스를 되돌린다.
 *
 * 단일 프리미티브에서만 호출되므로, 모든 모달이 동일한 트랩·복귀 동작을 공유한다.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  initialFocusRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 초기 포커스 이동 — 다음 프레임에서 잡아 패널이 완전히 마운트된 뒤 포커스한다.
    const raf = requestAnimationFrame(() => {
      const target =
        initialFocusRef?.current ?? getFocusable(container)[0] ?? container;
      if (target === container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        e.preventDefault();
        if (!container.hasAttribute("tabindex")) {
          container.setAttribute("tabindex", "-1");
        }
        container.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          e.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        e.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKeyDown, true);
      // 포커스 복귀 — 트리거가 아직 DOM에 살아있고 포커스 가능할 때만.
      if (
        previouslyFocused &&
        typeof previouslyFocused.focus === "function" &&
        document.contains(previouslyFocused)
      ) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, containerRef, initialFocusRef]);
}
