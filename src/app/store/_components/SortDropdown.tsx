"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

/** 상품 목록 상단의 정렬 드롭다운. (구 TopControlBar의 정렬 UI 분리) */
export function SortDropdown({
  options,
  value,
  onChange,
}: {
  options: SortOption[];
  value?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = options.find((o) => o.value === value)?.label ?? "정렬";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-w-[120px] cursor-pointer items-center justify-between gap-1 border border-black bg-white px-2.5 py-1 text-[13px] whitespace-nowrap text-black"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className="absolute right-0 top-full z-[191] mt-1.5 flex w-full min-w-max flex-col border border-black bg-white"
          >
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-3 px-2.5 py-2.5 text-left text-[13px] whitespace-nowrap transition-colors ${
                    selected ? "bg-black text-white" : "text-black hover:bg-[var(--bg-off)]"
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
    </div>
  );
}
