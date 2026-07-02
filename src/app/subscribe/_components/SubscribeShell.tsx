"use client";

import { useState, type ReactNode } from "react";

interface SubscribeShellProps {
  menuColumn: ReactNode;
  plannerTopColumn: ReactNode;
  plannerBottomColumn: ReactNode;
  mobileBottomBar?: (onOpenMenu: () => void) => ReactNode;
  mobilePlanTabs?: ReactNode;
  mobileWheel?: ReactNode;
}

// 상단 안내 배너가 있으면 그 높이(--subscribe-banner-h)만큼 빼서 배너+shell이 정확히 뷰포트를 채우게 한다.
const SHELL_HEIGHT =
  "calc(100dvh - var(--header-area-h, var(--header-h, 64px)) - var(--subscribe-banner-h, 0px))";

export function SubscribeShell({
  menuColumn,
  plannerTopColumn,
  plannerBottomColumn,
  mobileBottomBar,
}: SubscribeShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="subscribe-shell w-full bg-[var(--bg-pale)]">

      {/* ════════ 데스크톱 (lg+): 메뉴는 페이지 스크롤로 흐르고(스토어와 동일),
           스케줄은 오른쪽에 sticky로 떠서 따라오는 창(플로팅 패널) ════════ */}
      <div className="hidden lg:block">
        <div
          className="mx-auto grid w-full max-w-[1200px] items-start gap-6 px-4"
          style={{ gridTemplateColumns: "1fr 372px" }}
        >
          {/* LEFT: 메뉴 카탈로그 — 문서 흐름대로 전체 렌더 → 푸터는 목록 끝까지 스크롤해야 보인다 */}
          <div data-tutorial="menu" className="min-w-0">
            {menuColumn}
          </div>

          {/* RIGHT: 구독 스케줄 — 스크롤을 따라오는 패널 (플랫: 그림자 대신 라인) */}
          <div
            data-tutorial="schedule"
            className="sticky mt-4 mb-8 flex flex-col overflow-hidden rounded-2xl border border-[rgba(26,10,5,0.14)] bg-white"
            style={{
              top: "calc(var(--header-area-h, var(--header-h, 64px)) + 16px)",
              height: "calc(100dvh - var(--header-area-h, var(--header-h, 64px)) - 32px)",
            }}
          >
            <div className="flex-1 min-h-0 overflow-hidden">{plannerTopColumn}</div>
            <div className="shrink-0">{plannerBottomColumn}</div>
          </div>
        </div>
      </div>

      {/* ════════ 모바일 (<lg): 캘린더 + 바텀시트 ════════ */}
      <div className="flex lg:hidden flex-col" style={{ height: SHELL_HEIGHT }}>
        {/* 캘린더 */}
        <div className="flex-1 min-h-0 overflow-hidden bg-[#fcfaf8]">
          {plannerTopColumn}
        </div>

        {/* 모바일 바텀바 */}
        {mobileBottomBar && (
          <div className="shrink-0">
            {mobileBottomBar(() => setSheetOpen(true))}
          </div>
        )}

        {/* 딤 처리 */}
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[99] bg-[rgba(26,10,5,0.45)] transition-opacity duration-300 ${
            sheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSheetOpen(false)}
        />

        {/* 바텀시트 — 메뉴 카탈로그 */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="구독 식단"
          aria-hidden={!sheetOpen}
          className={`fixed bottom-0 left-0 right-0 z-[100] flex flex-col bg-white border-t border-black transition-transform duration-300 ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ height: "88dvh" }}
        >
          {/* 시트 헤더 */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-black bg-white">
            <span className="text-[14px] tracking-[-0.005em] text-black">구독 식단</span>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="닫기"
              className="w-8 h-8 border border-black rounded-full flex items-center justify-center text-[16px] leading-none font-light hover:bg-black hover:text-[#dfff4f] transition-colors"
            >
              ×
            </button>
          </div>
          {/* 메뉴 라이브러리 본체 */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {menuColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
