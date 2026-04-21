"use client";

import type { ReactNode } from "react";

interface SubscribeShellProps {
  menuColumn: ReactNode;
  plannerTopColumn: ReactNode;
  plannerBottomColumn: ReactNode;
  mobilePlanTabs?: ReactNode;
  mobileWheel?: ReactNode;
}

/** 데스크탑: 좌(메뉴 7) + 우(상단 플래너 + 하단 결제, 3) / 모바일: 세로 스택 */
export function SubscribeShell({
  menuColumn,
  plannerTopColumn,
  plannerBottomColumn,
  mobilePlanTabs,
  mobileWheel,
}: SubscribeShellProps) {
  return (
    <div
      className="subscribe-shell w-full min-h-0 min-w-0 overflow-hidden border-t border-black"
      style={{
        height: "calc(100dvh - var(--header-area-h, var(--header-h, 64px)))",
        maxHeight: "calc(100dvh - var(--header-area-h, var(--header-h, 64px)))",
      }}
    >
      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-[minmax(0,7fr)_minmax(0,3fr)] h-full min-h-0">
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-black bg-[#FAFAFA]">
          {menuColumn}
        </div>
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
          {plannerTopColumn}
          {plannerBottomColumn}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex lg:hidden flex-col h-full min-h-0">
        {mobilePlanTabs && <div className="shrink-0">{mobilePlanTabs}</div>}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
          {plannerTopColumn}
        </div>
        {mobileWheel && <div className="shrink-0">{mobileWheel}</div>}
        <div className="shrink-0 bg-white">{plannerBottomColumn}</div>
      </div>
    </div>
  );
}
