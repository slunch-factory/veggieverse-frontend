"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RecipeCategory } from "../_data/recipes";
import { EditorialRecipeCard, ViewAllCard } from "./RecipeCard";

export function RecipeSection({ category, index }: { category: RecipeCategory; index: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
  };

  const bgColor = index % 2 === 0 ? "#FAFAF8" : "#fdfbf7";
  const displayRecipes = category.recipes.slice(0, 10);

  return (
    <section id={`recipe-section-${category.id}`} className="w-full py-12 md:py-14" style={{ background: bgColor }}>
      <div className="flex flex-row gap-8 items-start" style={{ paddingLeft: "max(16px, calc((100vw - 1440px) / 2 + 40px))" }}>
        {/* 좌측 고정 텍스트 (데스크톱) */}
        <div className="hidden lg:block w-[200px] shrink-0 sticky" style={{ top: "calc(var(--header-area-h, 100px) + 24px)" }}>
          <span className="text-[11px] text-[#999] uppercase tracking-[0.1em] block mb-2">{category.subtitle}</span>
          <Link href={`/recipe/category/${category.id}`} className="block mb-3 group">
            <h2 className="text-[24px] text-black leading-[1.3] inline group-hover:border-b group-hover:border-black">{category.title}</h2>
          </Link>
          <p className="text-[13px] text-[#6B6B6B] leading-[1.6] mb-14">
            슬런치가 엄선한 레시피를 만나보세요.
          </p>
        </div>

        {/* 우측 가로 스크롤 */}
        <div className="flex-1 min-w-0 -mr-4 md:-mr-8 lg:-mr-16" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {/* 모바일 헤더 */}
          <div className="lg:hidden mb-4">
            <span className="text-[11px] text-[#999] uppercase tracking-[0.1em]">{category.subtitle}</span>
            <Link href={`/recipe/category/${category.id}`} className="block mt-1 group">
              <h2 className="text-[20px] text-black inline group-hover:border-b group-hover:border-black">{category.title}</h2>
            </Link>
          </div>

          <div className="relative">
            {/* 스크롤 버튼 */}
            {isHovered && canScrollLeft && (
              <button onClick={() => scroll("left")} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-[70%] w-11 h-11 rounded-full border border-[#E0E0E0] bg-white/95 items-center justify-center z-10 shadow-md hover:bg-black hover:border-black hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {isHovered && canScrollRight && (
              <button onClick={() => scroll("right")} className="hidden md:flex absolute lg:right-[52px] md:right-[20px] right-[4px] top-1/2 -translate-y-[70%] w-11 h-11 rounded-full border border-[#E0E0E0] bg-white/95 items-center justify-center z-10 shadow-md hover:bg-black hover:border-black hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-1 pr-4 md:pr-8 lg:pr-16 scroll-smooth" style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
              {displayRecipes.map((recipe) => (
                <div key={recipe.id} className="shrink-0" style={{ scrollSnapAlign: "start" }}>
                  <EditorialRecipeCard recipe={recipe} />
                </div>
              ))}
              <div className="shrink-0" style={{ scrollSnapAlign: "start" }}>
                <ViewAllCard categoryId={category.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
