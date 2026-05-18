import Link from "next/link";

function HoverLink({
  href,
  children,
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const base = `transition-opacity hover:opacity-60 ${className}`;
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={base}>
      {children}
    </Link>
  );
}

const DOT = <span className="opacity-30 select-none">·</span>;

export function Footer() {
  return (
    <footer
      className="w-full site-footer"
      style={{
        background: "#DCFD4A",
        borderTop: "1px solid rgba(37,10,0,0.25)",
        color: "var(--ink)",
      }}
    >
      <div className="page-container py-5 md:py-6 flex flex-col gap-3">

        {/* ── 상단 행: 브랜드 · 메인 링크 · 소셜/CS ── */}
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6 pb-3"
          style={{ borderBottom: "1px solid rgba(37,10,0,0.18)" }}
        >
          {/* 브랜드 */}
          <HoverLink href="/" className="text-[13px] tracking-[0.2em] uppercase shrink-0">
            SLUNCH
          </HoverLink>

          {/* 주요 링크 */}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
            <HoverLink href="/about">About</HoverLink>
            {DOT}
            <HoverLink href="/subscribe">구독</HoverLink>
            {DOT}
            <HoverLink href="/store">스토어</HoverLink>
            {DOT}
            <HoverLink href="/newsletter">뉴스레터</HoverLink>
            {DOT}
            <HoverLink href="/spirit">스피릿</HoverLink>
            {DOT}
            <HoverLink href="mailto:slunch@slunch.co.kr" external>
              일반문의
            </HoverLink>
            {DOT}
            <HoverLink href="mailto:export@slunch.co.kr" external>
              B2B
            </HoverLink>
          </nav>

          {/* 소셜 + CS */}
          <div className="flex items-center gap-4 text-[12px] shrink-0">
            <HoverLink href="https://instagram.com/slunch_factory" external>
              Instagram
            </HoverLink>
            <HoverLink href="https://youtube.com" external>
              Youtube
            </HoverLink>
            <HoverLink href="https://linkedin.com" external>
              LinkedIn
            </HoverLink>
            <span className="opacity-25 select-none">|</span>
            <span className="font-mono text-[12px]">032-224-6525</span>
          </div>
        </div>

        {/* ── 법적 페이지 링크 ── */}
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          <HoverLink href="/terms" className="font-medium">이용약관</HoverLink>
          {DOT}
          <HoverLink href="/privacy" className="font-medium">개인정보 처리방침</HoverLink>
          {DOT}
          <HoverLink href="/refund-policy" className="font-medium">환불·취소 정책</HoverLink>
        </nav>

        {/* ── 하단 행: 법인 정보 · 계좌 · Copyright ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 text-[10px]"
             style={{ color: "rgba(37,10,0,0.55)" }}>
          <p className="break-keep leading-relaxed">
            (주)슬런치팩토리 {DOT} 대표 이현아 {DOT} 사업자번호 288-86-02863 {DOT} 통신판매업 제2023-경기부천-0868호 {DOT} 경기 부천시 소사로160번길 23-8 {DOT} 우리은행 1005-504-450570
          </p>
          <p className="whitespace-nowrap shrink-0 md:ml-4">
            &copy; 2025 Slunch Factory. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
