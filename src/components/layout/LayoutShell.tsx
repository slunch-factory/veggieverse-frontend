"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopBanner } from "./TopBanner";
import { ScrollToTop } from "./ScrollToTop";

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [showTopBanner, setShowTopBanner] = useState(true);

  const shouldShowFooter = true;

  const headerAreaStyle = {
    "--header-area-h": showTopBanner
      ? "calc(var(--promo-h) + var(--header-h))"
      : "var(--header-h)",
  } as React.CSSProperties;

  return (
    <>
      <ScrollToTop />
      <div
        className="min-h-screen min-w-[360px] flex flex-col bg-[#D7D7D7]"
        style={headerAreaStyle}
      >
        {/* Fixed Top Container */}
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-[#D7D7D7]"
        >
          {showTopBanner && (
            <TopBanner onClose={() => setShowTopBanner(false)} />
          )}
          <Header showTopBanner={showTopBanner} />
        </div>

        {/* Page Content */}
        <main
          className="flex-1 flex flex-col z-0 overflow-visible"
          style={{
            paddingTop: showTopBanner
              ? "calc(var(--promo-h) + var(--header-h))"
              : "var(--header-h)",
          }}
        >
          {children}
        </main>

        {shouldShowFooter && <Footer />}
      </div>
    </>
  );
}
