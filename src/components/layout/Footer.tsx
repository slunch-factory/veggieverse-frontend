import Link from "next/link";

function HoverLink({ href, children, external, className = "" }: { href: string; children: React.ReactNode; external?: boolean; className?: string }) {
  const style = "transition-all hover:underline hover:underline-offset-4";
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${style} ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${style} ${className}`}>
      {children}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="text-black w-full bg-[#DCFD4A] border-t border-[var(--black)]">
      {/* ═══ MOBILE FOOTER (< 768px) ═══ */}
      <div className="block md:hidden px-5 py-10">
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 mb-10">
          {/* ABOUT */}
          <div>
            <HoverLink href="/about" className="block text-[11px] tracking-widest uppercase mb-3 text-black">
              ABOUT
            </HoverLink>
            <HoverLink href="/about?section=slow-and-lunch" className="block text-[13px] text-black leading-relaxed mb-1">
              Slow and Lunch
            </HoverLink>
            <HoverLink href="/about?section=branch" className="block text-[13px] text-black leading-relaxed mb-1">
              Branch
            </HoverLink>
            <HoverLink href="/about?section=b2b-vtech" className="block text-[13px] text-black leading-relaxed mb-1">
              B2B &amp; V-tech
            </HoverLink>
          </div>

          {/* NEWSLETTER */}
          <div>
            <HoverLink href="/newsletter" className="block text-[11px] tracking-widest uppercase mb-3 text-black">
              NEWSLETTER
            </HoverLink>
            <p className="text-[13px] text-black leading-relaxed">
              슬런치 에디터가 발행하는 아티클
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <p className="text-[11px] tracking-widest uppercase mb-3 text-black">CONTACT</p>
            <HoverLink href="mailto:slunch@slunch.co.kr" external className="block text-[13px] text-black leading-relaxed mb-1">
              일반문의 slunch@slunch.co.kr
            </HoverLink>
            <HoverLink href="mailto:export@slunch.co.kr" external className="block text-[13px] text-black leading-relaxed mb-1">
              B2B export@slunch.co.kr
            </HoverLink>
          </div>

          {/* SOCIAL */}
          <div>
            <p className="text-[11px] tracking-widest uppercase mb-3 text-black">SOCIAL</p>
            <HoverLink href="https://instagram.com/slunch_factory" external className="block text-[13px] text-black leading-relaxed mb-1">
              Instagram
            </HoverLink>
            <HoverLink href="https://youtube.com" external className="block text-[13px] text-black leading-relaxed mb-1">
              Youtube
            </HoverLink>
            <HoverLink href="https://linkedin.com" external className="block text-[13px] text-black leading-relaxed mb-1">
              Linked In
            </HoverLink>
          </div>

          {/* BANK */}
          <div>
            <p className="text-[11px] tracking-widest uppercase mb-3 text-black">BANK</p>
            <p className="text-[14px] text-black font-mono mb-1">우리은행 1005-504-450570</p>
            <p className="text-[13px] text-black leading-relaxed">(주)슬런치팩토리</p>
          </div>

          {/* CS */}
          <div>
            <p className="text-[11px] tracking-widest uppercase mb-3 text-black">CS</p>
            <p className="text-[14px] text-black font-mono mb-1">032-224-6525</p>
            <p className="text-[13px] text-black leading-relaxed">카카오톡 채널 문의</p>
          </div>
        </div>

        {/* Mobile Copyright */}
        <p className="text-[10px] text-black leading-relaxed text-left break-keep">
          (주)슬런치팩토리 &nbsp;|&nbsp; 대표 이현아 &nbsp;|&nbsp; 사업자번호 288-86-02863 &nbsp;|&nbsp; 통신판매업 제2023-경기부천-0868호 &nbsp;|&nbsp; 경기 부천시 소사로160번길 23-8 &nbsp;|&nbsp; &copy; 2025 Slunch Factory. All Rights Reserved.
        </p>
      </div>

      {/* ═══ DESKTOP FOOTER (>= 768px) ═══ */}
      <div className="hidden md:block px-10 py-12">
        <div className="grid grid-cols-5 gap-x-12 mb-12">
          {/* ABOUT */}
          <div>
            <HoverLink href="/about" className="block text-[11px] tracking-[0.15em] uppercase mb-4 text-black">
              ABOUT
            </HoverLink>
            <ul className="space-y-2">
              <li>
                <HoverLink href="/about?section=slow-and-lunch" className="block text-[13px] text-black leading-[1.8]">
                  Slow and Lunch
                </HoverLink>
              </li>
              <li>
                <HoverLink href="/about?section=branch" className="block text-[13px] text-black leading-[1.8]">
                  Branch
                </HoverLink>
              </li>
              <li>
                <HoverLink href="/about?section=b2b-vtech" className="block text-[13px] text-black leading-[1.8]">
                  B2B &amp; V-tech
                </HoverLink>
              </li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <HoverLink href="/newsletter" className="block text-[11px] tracking-[0.15em] uppercase mb-4 text-black">
              NEWSLETTER
            </HoverLink>
            <p className="text-[13px] text-black leading-[1.8]">
              슬런치 에디터가 발행하는 아티클
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase mb-4 text-black">CONTACT</p>
            <ul className="space-y-2">
              <li>
                <HoverLink href="mailto:slunch@slunch.co.kr" external className="block text-[13px] text-black leading-[1.8]">
                  일반문의 slunch@slunch.co.kr
                </HoverLink>
              </li>
              <li>
                <HoverLink href="mailto:export@slunch.co.kr" external className="block text-[13px] text-black leading-[1.8]">
                  B2B export@slunch.co.kr
                </HoverLink>
              </li>
            </ul>
          </div>

          {/* SOCIAL */}
          <div>
            <p className="text-[11px] tracking-[0.15em] uppercase mb-4 text-black">SOCIAL</p>
            <ul className="space-y-2">
              <li>
                <HoverLink href="https://instagram.com/slunch_factory" external className="block text-[13px] text-black leading-[1.8]">
                  Instagram
                </HoverLink>
              </li>
              <li>
                <HoverLink href="https://youtube.com" external className="block text-[13px] text-black leading-[1.8]">
                  Youtube
                </HoverLink>
              </li>
              <li>
                <HoverLink href="https://linkedin.com" external className="block text-[13px] text-black leading-[1.8]">
                  Linked In
                </HoverLink>
              </li>
            </ul>
          </div>

          {/* BANK & CS */}
          <div>
            <div className="mb-6">
              <p className="text-[11px] tracking-[0.15em] uppercase mb-4 text-black">BANK</p>
              <p className="text-[14px] text-black font-mono mb-1 leading-[1.8]">우리은행 1005-504-450570</p>
              <p className="text-[13px] text-black leading-[1.8]">(주)슬런치팩토리</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase mb-4 text-black">CS</p>
              <p className="text-[14px] text-black font-mono mb-1 leading-[1.8]">032-224-6525</p>
              <p className="text-[13px] text-black leading-[1.8]">카카오톡 채널 문의</p>
            </div>
          </div>
        </div>

        {/* Desktop Copyright */}
        <div className="border-t border-black pt-6 flex justify-between items-end text-[11px] text-black">
          <p className="break-keep">
            (주)슬런치팩토리 &nbsp;|&nbsp; 대표 이현아 &nbsp;|&nbsp; 사업자번호 288-86-02863 &nbsp;|&nbsp; 통신판매업 제2023-경기부천-0868호 &nbsp;|&nbsp; 경기 부천시 소사로160번길 23-8
          </p>
          <p className="whitespace-nowrap ml-4">
            &copy; 2025 Slunch Factory. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
