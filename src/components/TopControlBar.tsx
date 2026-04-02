"use client";

import { useRef } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

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

  return (
    <div
      className="fixed left-0 right-0 z-30 flex h-[48px] items-center border-b border-black bg-white"
      style={{ top: "var(--header-area-h, var(--header-h))" }}
    >
      {/* Left spacer (same width as right controls for centering) */}
      <div className="flex shrink-0 items-center gap-2 pl-4 invisible">
        {showFilter && <span className="p-1"><SlidersHorizontal size={18} /></span>}
        {showSort && <span className="pr-5 text-[13px]">정렬</span>}
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
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => onSortChange?.(e.target.value)}
              className="appearance-none bg-transparent pr-5 text-[13px] text-gray-600 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
