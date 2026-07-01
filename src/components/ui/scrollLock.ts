/**
 * 배경 스크롤 잠금 — 중첩 카운팅.
 *
 * 여러 모달이 동시에 열려도(모달 위 모달) 마지막 하나가 닫힐 때만 잠금을 해제한다.
 * 기존 `html.mm-open` CSS 규칙(globals.css)을 그대로 재사용하므로, 스크롤바 사라짐에 따른
 * 레이아웃 시프트 보상(`--scrollbar-w`)까지 한 곳에서 일관되게 처리된다.
 *
 * 모듈 스코프 카운터라 SSR에서는 호출되지 않는다(클라이언트 effect에서만 사용).
 */
let lockCount = 0;

/** 잠금을 1 증가시키고, 해제 함수를 돌려준다. 해제 함수는 1회만 동작한다. */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (lockCount === 0) {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty(
      "--scrollbar-w",
      `${scrollbarWidth}px`,
    );
    document.documentElement.classList.add("mm-open");
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.classList.remove("mm-open");
      document.documentElement.style.removeProperty("--scrollbar-w");
    }
  };
}
