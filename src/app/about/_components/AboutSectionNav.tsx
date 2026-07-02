"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "story", label: "Story" },
  { id: "make", label: "Make" },
  { id: "craft", label: "Craft" },
  { id: "stores", label: "Stores" },
  { id: "b2b", label: "B2B" },
];

/**
 * /about 싱글스크롤용 sticky 앵커 내비.
 * 스크롤 위치에 따라 현재 섹션을 하이라이트(scrollspy)하고, 클릭 시 해당 섹션으로 부드럽게 이동.
 * 섹션 오프셋(scroll-margin-top)은 각 <section>에 지정되어 있어 헤더에 가리지 않는다.
 */
export function AboutSectionNav() {
  const [active, setActive] = useState<string>(NAV_ITEMS[0].id);

  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      // 헤더+내비 높이만큼 위쪽 마진을 둬 "지금 보는 섹션"을 정확히 잡는다.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div
      className="sticky z-40 bg-[var(--cream)] border-b border-black"
      style={{ top: "var(--header-area-h)" }}
    >
      <div className="max-w-[1200px] mx-auto flex items-center h-12">
        {NAV_ITEMS.map((item, index) => {
          const isActive = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className="flex-1 h-full flex items-center justify-center text-[13px] md:text-[14px] transition-all duration-200 ease-in-out"
              style={{
                color: isActive ? "#000" : "var(--warm-gray)",
                background: isActive ? "rgba(0,0,0,0.04)" : "transparent",
                borderRight: index < NAV_ITEMS.length - 1 ? "1px solid #000" : "none",
              }}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
