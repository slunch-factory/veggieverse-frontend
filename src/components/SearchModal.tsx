"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Search } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_KEYWORDS = ["비건 밀키트", "두부", "샐러드", "비건 베이커리", "오트밀"];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/store?search=${encodeURIComponent(query.trim())}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] mx-4 bg-white border border-black rounded-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
          aria-label="닫기"
        >
          <X size={20} strokeWidth={1} color="#000" />
        </button>

        {/* 헤더 */}
        <h2 className="text-center mb-6 text-lg text-black">
          Search
        </h2>

        {/* 검색 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="검색어를 입력하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 pl-4 pr-12 border border-black rounded-lg text-[14px] outline-none box-border"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
              aria-label="검색"
            >
              <Search size={18} strokeWidth={1} color="#000" />
            </button>
          </div>
        </form>

        {/* 인기 검색어 */}
        <div className="mt-6">
          <p className="text-[13px] text-[#6B6B6B] mb-3">
            Popular Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleSearch(keyword)}
                className="px-3.5 py-2 text-[13px] text-black bg-transparent border border-[#E5E5E5] rounded-[20px] cursor-pointer transition-colors duration-150 ease-in-out hover:border-black"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
