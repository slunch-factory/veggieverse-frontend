"use client";

import { useState } from "react";
import Link from "next/link";
import type { Article } from "../_data/articles";

const CATEGORIES = ["전체", "Health", "Food", "Culture", "Life", "Slunch's Pick"];

export function ArticleGrid({ articles }: { articles: Article[] }) {
  const [activeCategory, setActiveCategory] = useState("전체");

  const filtered = activeCategory === "전체"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <>
      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-[13px] shrink-0 transition-colors ${
              activeCategory === cat
                ? "bg-black text-white"
                : "border border-[#ddd] text-[#666] hover:border-black hover:text-black"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 아티클 그리드 */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-[14px] text-gray-400">아직 작성된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((article) => (
            <Link key={article.id} href={`/newsletter/${article.id}`} className="group">
              <div className="relative w-full overflow-hidden aspect-[4/3] bg-[#E5E5E0] rounded-[4px] mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] tracking-[0.05em] text-[#6B6B6B] mb-2 uppercase">
                {article.category}
              </p>
              <h3 className="group-hover:underline line-clamp-2 text-[16px] leading-[1.3] text-black mb-1.5">
                {article.title}
              </h3>
              <p className="line-clamp-1 text-[13px] leading-[1.5] text-[#6B6B6B] mb-3">
                {article.subtitle}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                <span>{article.author}</span>
                <span>·</span>
                <span>{article.date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
