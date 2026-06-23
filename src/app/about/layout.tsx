/**
 * /about 레이아웃 — 싱글스크롤 페이지가 자체 풀폭 레이아웃과 섹션 내비를 가지므로
 * 여기서는 별도 래퍼/탭을 두지 않고 children만 통과시킨다.
 */
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
