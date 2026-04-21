"use client";

import { RotateCcw } from "lucide-react";
import { EXCLUDE_CATEGORIES, type ExcludeCategory } from "../_data/subscription";

interface ExcludeFilterRowProps {
  selectedExcludes: ExcludeCategory[];
  onToggle: (category: ExcludeCategory) => void;
  onReset: () => void;
}

export function ExcludeFilterRow({ selectedExcludes, onToggle, onReset }: ExcludeFilterRowProps) {
  const categories = Object.keys(EXCLUDE_CATEGORIES) as ExcludeCategory[];
  const resetDisabled = selectedExcludes.length === 0;

  return (
    <div className="relative flex items-center justify-center gap-5 md:gap-8 py-3 border-t border-black overflow-x-auto no-scrollbar">
      {categories.map((category) => {
        const excluded = selectedExcludes.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            aria-pressed={!excluded}
            className={`shrink-0 text-[13px] leading-normal bg-transparent cursor-pointer transition-colors whitespace-nowrap ${
              excluded ? "text-gray-400 line-through" : "text-gray-700 hover:text-[#8C451D]"
            }`}
          >
            {EXCLUDE_CATEGORIES[category].label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onReset}
        disabled={resetDisabled}
        aria-label="초기화"
        title="초기화"
        className={`absolute right-4 md:right-6 top-1/2 -translate-y-1/2 inline-flex items-center justify-center bg-transparent cursor-pointer transition-colors ${
          resetDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-black"
        }`}
      >
        <RotateCcw className="w-4 h-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}
