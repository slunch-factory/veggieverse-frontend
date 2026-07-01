import { PlannerSkeleton } from "./_components/PlannerSkeleton";

/**
 * 구독 플래너 라우트 로딩 폴백.
 * page.tsx가 서버에서 `await getMenus()`를 기다리는 동안 Suspense 폴백으로 표시된다.
 * (없으면 네비게이션 시 메뉴 fetch가 끝날 때까지 이전 화면이 멈춰 보임)
 */
export default function Loading() {
  return <PlannerSkeleton />;
}
