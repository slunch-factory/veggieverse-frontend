"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Recipe } from "../_data/recipes";

export function HeroCarousel({ recipes }: { recipes: Recipe[] }) {
  const [current, setCurrent] = useState(0);
  const total = recipes.length;

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (total === 0) return null;

  const recipe = recipes[current];

  return (
    <section className="relative w-full bg-[var(--cream)]" style={{ height: "min(60vh, 500px)" }}>
      {/* 좌측: 큰 이미지 (약 50%) */}
      <Link href={`/recipe/${recipe.id}`} className="absolute inset-y-0 left-0 w-full md:w-[55%] block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover transition-opacity duration-500"
          key={recipe.id}
        />
      </Link>

      {/* 우측: 레시피 정보 (데스크톱) */}
      <div className="hidden md:flex absolute inset-y-0 right-0 w-[45%] flex-col justify-end p-12 lg:p-16">
        <Link href={`/recipe/${recipe.id}`} className="group">
          <span className="text-[11px] text-[#999] uppercase tracking-[0.1em] block mb-3">
            @{recipe.author}
          </span>
          <h2 className="text-[32px] lg:text-[40px] text-black leading-[1.2] mb-4 group-hover:underline underline-offset-4">
            {recipe.title}
          </h2>
          <p className="text-[15px] text-[#6B6B6B] leading-[1.6] max-w-[400px]">
            {recipe.description}
          </p>
        </Link>
      </div>

      {/* 모바일: 이미지 위 오버레이 텍스트 */}
      <div className="md:hidden absolute bottom-20 left-6 right-6 z-10">
        <Link href={`/recipe/${recipe.id}`}>
          <h2 className="text-[24px] text-white leading-[1.3] mb-2 drop-shadow-lg">{recipe.title}</h2>
          <p className="text-[14px] text-white/80 drop-shadow-lg">@{recipe.author}</p>
        </Link>
      </div>
      <div className="md:hidden absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* 하단 우측: 인디케이터 + 네비 버튼 */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3 z-10">
        <span className="text-[13px] text-[#999]">
          {current + 1} / {total}
        </span>
        <button
          onClick={prev}
          className="w-9 h-9 flex items-center justify-center border border-black bg-white hover:bg-black hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="w-9 h-9 flex items-center justify-center border border-black bg-black text-white hover:bg-gray-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
