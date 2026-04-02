"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABOUT_TABS = [
  { id: "story", label: "Story", href: "/about/story" },
  { id: "branch", label: "Branch", href: "/about/branch" },
  { id: "b2b", label: "B2B", href: "/about/b2b" },
];

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      {/* Tab Navigation - Sticky */}
      <div
        className="sticky z-40 bg-[var(--cream)] border-b border-black"
        style={{ top: "var(--header-h)" }}
      >
        <div className="max-w-[1440px] mx-auto flex items-center h-12">
          {ABOUT_TABS.map((tab, index) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex-1 h-full flex items-center justify-center text-[14px] transition-all duration-200 ease-in-out"
                style={{
                  color: isActive ? "#000" : "var(--warm-gray)",
                  background: isActive ? "rgba(0,0,0,0.03)" : "transparent",
                  borderRight: index < ABOUT_TABS.length - 1 ? "1px solid #000" : "none",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto">
        {children}
      </div>
    </div>
  );
}
