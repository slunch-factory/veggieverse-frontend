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

const SHELL_HEIGHT = "calc(100dvh - var(--header-area-h, var(--header-h, 64px)))";

export function SubscribeShell({
  menuColumn,
  plannerTopColumn,
  plannerBottomColumn,
  mobileBottomBar,
}: SubscribeShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="subscribe-shell w-full border-t border-black">

      {/* ════════ 데스크톱 (lg+): 2열 그리드 ════════ */}
      <div
        className="hidden lg:grid"
        style={{
          gridTemplateColumns: "1fr 440px",
          height: SHELL_HEIGHT,
        }}
      >
        {/* LEFT: 메뉴 카탈로그 — 자체 스크롤 */}
        <div data-tutorial="menu" className="border-r border-black overflow-y-auto no-scrollbar bg-[#fcfaf8] flex flex-col">
          {menuColumn}
        </div>

        {/* RIGHT: 캘린더 패널 — 내부 스크롤 */}
        <div data-tutorial="schedule" className="flex flex-col bg-[#fcfaf8] overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">{plannerTopColumn}</div>
          <div className="shrink-0">{plannerBottomColumn}</div>
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
          className={`fixed bottom-0 left-0 right-0 z-[100] flex flex-col bg-white border-t border-black shadow-[0_-12px_32px_rgba(26,10,5,0.18)] transition-transform duration-300 ${
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
