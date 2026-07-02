"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** 상품 목록 하단 페이지네이션 — 컬리 스타일(‹ 1 2 3 ›). 페이지가 1개면 렌더하지 않는다. */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지" className="mt-12 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className="flex h-9 w-9 cursor-pointer items-center justify-center text-black transition-opacity disabled:cursor-default disabled:opacity-25"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-9 w-9 cursor-pointer text-[14px] transition-colors ${
            n === page
              ? "bg-black font-bold text-white"
              : "text-gray-400 hover:text-black"
          }`}
          style={{ borderRadius: "var(--r-btn)" }}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className="flex h-9 w-9 cursor-pointer items-center justify-center text-black transition-opacity disabled:cursor-default disabled:opacity-25"
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </button>
    </nav>
  );
}
