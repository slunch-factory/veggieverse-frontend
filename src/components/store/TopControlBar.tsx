"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
}

interface TopControlBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showFilter?: boolean;
  filterCount?: number;
  onFilterClick?: () => void;
  showSort?: boolean;
  sortOptions?: SortOption[];
  currentSort?: string;
  onSortChange?: (value: string) => void;
}

export default function TopControlBar({
  tabs,
  activeTab,
  onTabChange,
  showFilter = false,
  filterCount = 0,
  onFilterClick,
  showSort = false,
  sortOptions = [],
  currentSort,
  onSortChange,
}: TopControlBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortPos, setSortPos] = useState<{ top: number; right: number } | null>(null);

  const currentSortLabel =
    sortOptions.find((o) => o.value === currentSort)?.label ?? "정렬";

  const handleSortToggle = () => {
    if (!sortOpen) {
      const rect = sortBtnRef.current?.getBoundingClientRect();
      if (rect) {
        setSortPos({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      }
    }
    setSortOpen((p) => !p);
  };

  useEffect(() => {
    if (!sortOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortOpen]);

  return (
    <div
      className="fixed left-0 right-0 z-30 flex h-[48px] items-center border-b border-black bg-white"
      style={{ top: "var(--header-area-h, var(--header-h))" }}
    >
      {/* Left spacer (same width as right controls for centering) */}
      <div className="flex shrink-0 items-center gap-2 pl-4 invisible" aria-hidden>
        {showFilter && <span className="p-1"><SlidersHorizontal size={18} /></span>}
        {showSort && (
          <span className="flex items-center gap-1 border border-black px-2.5 py-1 text-[13px]">
            {currentSortLabel}
            <ChevronDown size={14} />
          </span>
        )}
      </div>

      {/* Tabs - center aligned */}
      <div
        ref={scrollRef}
        className="flex flex-1 items-center justify-center gap-0 overflow-x-auto scrollbar-hide"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex h-[48px] shrink-0 items-center justify-center px-4 text-[14px] transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-black font-bold text-black"
                : "text-gray-400"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 text-[12px] text-gray-400">
                ({tab.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Right side controls */}
      <div className="flex shrink-0 items-center gap-2 pr-4">
        {/* Filter button */}
        {showFilter && (
          <button
            onClick={onFilterClick}
            className="relative flex items-center justify-center p-1"
          >
            <SlidersHorizontal size={18} />
            {filterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                {filterCount}
              </span>
            )}
          </button>
        )}

        {/* Sort dropdown */}
        {showSort && sortOptions.length > 0 && (
          <>
            <button
              ref={sortBtnRef}
              type="button"
              onClick={handleSortToggle}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className={`flex items-center gap-1 border border-black px-2.5 py-1 text-[13px] whitespace-nowrap transition-colors ${
                sortOpen ? "bg-black text-white" : "bg-white text-black hover:bg-[var(--bg-off)]"
              }`}
            >
              <span>{currentSortLabel}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {sortOpen && sortPos && (
              <>
                <div
                  className="fixed inset-0 z-[190]"
                  onClick={() => setSortOpen(false)}
                />
                <div
                  role="listbox"
                  className="fixed z-[191] flex flex-col bg-white border border-black min-w-[120px]"
                  style={{ top: sortPos.top, right: sortPos.right }}
                >
                  {sortOptions.map((option) => {
                    const selected = option.value === currentSort;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          onSortChange?.(option.value);
                          setSortOpen(false);
                        }}
                        className={`flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] text-left whitespace-nowrap transition-colors ${
                          selected
                            ? "bg-black text-white"
                            : "text-black hover:bg-[var(--bg-off)]"
                        }`}
                      >
                        <span>{option.label}</span>
                        {selected && <Check size={14} strokeWidth={1.5} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
