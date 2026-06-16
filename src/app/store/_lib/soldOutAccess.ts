/**
 * "Sold Out"(판매 준비중) 상품의 상세페이지를 고객에게는 막고, 내부 확인용으로만 열어두기 위한
 * 가벼운 코드 게이트.
 *
 * ⚠️ 클라이언트 측 단순 게이트(코드 하드코딩)이므로 진짜 보안은 아니다 — JS를 읽으면 우회 가능.
 *    "일반 고객이 우연히/검색으로 들어오는 것"을 막는 용도. 민감하면 백엔드 인증으로 가야 함.
 *
 * 한 번 코드를 맞히면 localStorage에 기록해 같은 브라우저에서는 다시 묻지 않는다.
 */
export const SOLD_OUT_CODE = "3425";

const STORAGE_KEY = "vv-soldout-access";

/** 이 브라우저가 이미 코드를 통과했는지 (클라이언트 전용) */
export function hasSoldOutAccess(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/** 코드 통과를 기록 */
export function grantSoldOutAccess(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* localStorage 비활성 환경 — 이번 세션 한정으로만 통과(아래 호출부에서 상태로 처리) */
  }
}
