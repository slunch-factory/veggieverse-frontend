"use client";

import { useState, type ReactNode } from "react";

interface SubscribeShellProps {
  menuColumn: ReactNode;
  plannerTopColumn: ReactNode;
  plannerBottomColumn: ReactNode;
  /** 모바일 바텀바 — onOpenMenu 콜백 주입용 render prop */
  mobileBottomBar?: (onOpenMenu: () => void) => ReactNode;
  mobilePlanTabs?: ReactNode;
  mobileWheel?: ReactNode;
}

const SHELL_HEIGHT = "calc(100dvh - var(--header-area-h, var(--header-h, 64px)))";
const STICKY_TOP = "var(--header-area-h, var(--header-h, 64px))";

export function SubscribeShell({
  menuColumn,
  plannerTopColumn,
  plannerBottomColumn,
  mobileBottomBar,
  mobilePlanTabs,
}: SubscribeShellProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="subscribe-shell w-full border-t border-black">

      {/* ════════════════════════════════════════════
          와이드 데스크톱 (xl+)
          위: 플래너 + 결제 (자연 높이) / 아래: 메뉴 라이브러리 (min-height 뷰포트)
          ════════════════════════════════════════════ */}
      <div className="hidden xl:block">
        <div className="border-b border-black bg-white">
          {plannerTopColumn}
          {plannerBottomColumn}
        </div>
        <div className="bg-white" style={{ minHeight: SHELL_HEIGHT }}>
          {menuColumn}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          미디엄 데스크톱 (lg ~ xl)
          좌: 메뉴 라이브러리 (자연 높이, 페이지 스크롤)
          우: 플래너 + 결제 (480px, sticky)
          ════════════════════════════════════════════ */}
      <div className="hidden lg:flex xl:hidden">
        {/* 메뉴 — 좌측, 자연 높이 */}
        <div className="flex-1 min-w-0 border-r border-black bg-white">
          {menuColumn}
        </div>
        {/* 플래너 — 우측, sticky */}
        <div
          className="shrink-0 flex flex-col bg-white overflow-hidden"
          style={{
            width: 480,
            position: "sticky",
            top: STICKY_TOP,
            height: SHELL_HEIGHT,
            alignSelf: "flex-start",
          }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">{plannerTopColumn}</div>
          <div className="shrink-0">{plannerBottomColumn}</div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          모바일 (< lg)
          플래너 전체 화면 + 바텀바 + 바텀시트(메뉴)
          ════════════════════════════════════════════ */}
      <div className="flex lg:hidden flex-col" style={{ height: SHELL_HEIGHT }}>
        {mobilePlanTabs && <div className="shrink-0">{mobilePlanTabs}</div>}

        {/* 달력/플래너 */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white">
          {plannerTopColumn}
        </div>

        {/* 모바일 바텀바 */}
        {mobileBottomBar && (
          <div className="shrink-0 bg-white">
            {mobileBottomBar(() => setSheetOpen(true))}
          </div>
        )}

        {/* 딤 처리 */}
        <div
          aria-hidden="true"
          className={`fixed inset-0 z-[99] bg-black/45 transition-opacity duration-300 ${
            sheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSheetOpen(false)}
        />

        {/* 바텀시트 — 메뉴 라이브러리 */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="메뉴 고르기"
          aria-hidden={!sheetOpen}
          className={`fixed bottom-0 left-0 right-0 z-[100] flex flex-col bg-white border-t border-black shadow-2xl transition-transform duration-300 ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ height: "88dvh" }}
        >
          {/* 시트 헤더 */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-black">
            <span className="text-[15px] tracking-tight">메뉴 고르기</span>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="닫기"
              className="w-8 h-8 border border-black flex items-center justify-center text-[16px] leading-none hover:bg-black hover:text-white transition-colors"
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
