"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const MYPAGE_TABS = [
  { path: "/mypage", label: "홈" },
  { path: "/mypage/orders", label: "주문 내역" },
  { path: "/mypage/delivery", label: "배송 조회" },
  { path: "/mypage/subscriptions", label: "구독 내역" },
  { path: "/mypage/bookmarks", label: "레시피 북마크" },
  { path: "/mypage/wishlist", label: "관심상품" },
  { path: "/mypage/coupons", label: "쿠폰" },
  { path: "/mypage/reviews", label: "상품 리뷰" },
  { path: "/mypage/info", label: "회원정보" },
];

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) =>
    path === "/mypage" ? pathname === "/mypage" : pathname.startsWith(path);

  useEffect(() => {
    if (!scrollRef.current) return;
    const active = MYPAGE_TABS.find((tab) => isActive(tab.path));
    if (!active) return;
    const el = scrollRef.current.querySelector<HTMLElement>(`[data-path="${active.path}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      {/* 상단 탭바 — TopControlBar 통일 패턴 */}
      <div
        className="fixed left-0 right-0 z-30 flex h-[48px] items-center border-b border-black bg-white"
        style={{ top: "var(--header-area-h, var(--header-h))" }}
      >
        <div
          ref={scrollRef}
          className="flex flex-1 items-center justify-center gap-0 overflow-x-auto scrollbar-hide"
        >
          {MYPAGE_TABS.map((tab) => {
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                data-path={tab.path}
                className={`relative flex h-[48px] shrink-0 items-center justify-center px-4 text-[14px] transition-colors ${
                  active ? "font-bold text-black" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
                {active && (
                  <motion.span
                    layoutId="mypage-tab-underline"
                    className="absolute inset-x-2 bottom-0 h-[2px] bg-black"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 콘텐츠 영역 — fixed 탭바 높이만큼 padding */}
      <main className="mx-auto max-w-[1100px] px-4 pt-[60px] pb-12 md:px-6">
        {children}
      </main>
    </div>
  );
}
