"use client";

import { useEffect } from "react";
import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { EXCLUDE_CATEGORIES } from "../_data/subscription";

interface MenuDetailModalProps {
  meal: DisplayMenuData | null;
  onClose: () => void;
  onAdd: (meal: DisplayMenuData) => void;
}

const DUMMY_NUTRITION = { kcal: 520, protein: 18, carbs: 24, fat: 17 };

export function MenuDetailModal({ meal, onClose, onAdd }: MenuDetailModalProps) {
  useEffect(() => {
    if (!meal) return;
    // overflow:hidden으로 스크롤바가 사라지면 뷰포트 너비가 scrollbarWidth만큼 늘어남
    // CSS 변수로 body와 fixed 요소 모두 동일하게 보상
    const sw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--scrollbar-w", `${sw}px`);
    document.documentElement.classList.add("mm-open");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("mm-open");
      document.documentElement.style.removeProperty("--scrollbar-w");
      document.removeEventListener("keydown", onKey);
    };
  }, [meal, onClose]);

  if (!meal) return null;

  const allergyTags = meal.excludable
    .filter((e) => e !== "spicy")
    .map((e) => EXCLUDE_CATEGORIES[e as ExcludeCategory]?.label)
    .filter(Boolean);

  const isSpicy = meal.excludable.includes("spicy");
  const categoryLabel = meal.category === "protein" ? "고단백" : "저칼로리";

  const nut = meal.nutrition ?? DUMMY_NUTRITION;
  const nutritionItems = [
    { label: "kcal",    value: nut.kcal,    unit: "" },
    { label: "단백질",  value: nut.protein,  unit: "g" },
    { label: "탄수화물", value: nut.carbs,   unit: "g" },
    { label: "지방",    value: nut.fat,      unit: "g" },
  ];

  const ingredients = meal.ingredients?.slice(0, 4) ?? [];

  return (
    <>
      {/* 딤 */}
      <div
        className="fixed inset-0 z-[200] bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* 포지셔닝 래퍼 — 데스크톱: 화면 중앙 / 모바일: 하단 */}
      <div
        className="fixed inset-0 z-[201] flex items-center justify-center p-6 max-lg:p-0 max-lg:items-end"
        onClick={onClose}
      >
        {/* 다이얼로그 */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mm-name"
          data-menu-modal="true"
          className={[
            "w-full bg-[#fcfaf8] overflow-hidden",
            "lg:grid lg:max-w-[820px] lg:max-h-[90dvh]",
            "lg:border lg:border-black lg:shadow-[0_16px_48px_rgba(26,10,5,0.18)]",
            "max-lg:flex max-lg:flex-col max-lg:h-[88dvh]",
            "max-lg:border-t max-lg:border-black",
            "max-lg:shadow-[0_-12px_32px_rgba(26,10,5,0.18)]",
          ].join(" ")}
          style={{ gridTemplateColumns: "1fr 1.1fr" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* LEFT: 이미지 */}
          <div className="lg:aspect-square max-lg:shrink-0 max-lg:h-[26vh] max-lg:max-h-[240px] overflow-hidden bg-[#e8e4de]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={meal.image} alt={meal.displayName} className="w-full h-full object-cover" />
          </div>

          {/* RIGHT: 바디 */}
          <div className="flex flex-col lg:px-6 lg:py-5 max-lg:p-[18px] lg:gap-[10px] max-lg:gap-[10px] lg:border-l lg:border-black max-lg:border-t max-lg:border-black max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-y-auto">

            {/* + / × 원형 버튼 — 오른쪽 정렬 */}
            <div className="flex flex-row items-center justify-end gap-[10px] shrink-0">
              <button
                type="button"
                onClick={() => { onAdd(meal); onClose(); }}
                aria-label="식단에 추가하기"
                title="식단에 추가"
                className="w-9 h-9 max-lg:w-10 max-lg:h-10 shrink-0 border border-black rounded-full bg-[#fcfaf8] text-[#3d3d3d] flex items-center justify-center text-[18px] leading-none font-light hover:bg-black hover:text-[#dfff4f] transition-colors"
              >
                +
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="w-9 h-9 max-lg:w-10 max-lg:h-10 shrink-0 border border-black rounded-full bg-[#fcfaf8] text-[#3d3d3d] flex items-center justify-center text-[18px] leading-none font-light hover:bg-black hover:text-[#dfff4f] transition-colors"
              >
                ×
              </button>
            </div>

            {/* 메뉴 이름 */}
            <h3 id="mm-name" className="lg:text-[22px] max-lg:text-[18px] tracking-[-0.01em] leading-[1.3] text-[#1a0a05]">
              {meal.displayName}
            </h3>

            {/* 설명 */}
            <p className="lg:text-[13px] max-lg:text-[12px] text-[#9a928c] lg:leading-[1.7] max-lg:leading-[1.6]">
              {meal.description || "슬런치 채식 식단"}
            </p>

            {/* 메타 태그 */}
            <div className="flex flex-wrap gap-[6px]">
              <span className="px-[10px] max-lg:px-[8px] py-[3px] border border-black lg:text-[11px] max-lg:text-[10px] text-[#3d3d3d]">
                {categoryLabel}
              </span>
              {isSpicy && (
                <span className="px-[10px] max-lg:px-[8px] py-[3px] border border-black lg:text-[11px] max-lg:text-[10px] text-[#3d3d3d]">
                  매운맛
                </span>
              )}
              {allergyTags.map((tag) => (
                <span key={tag} className="px-[10px] max-lg:px-[8px] py-[3px] bg-[#fbf2f2] text-[#e05858] border border-[#e05858] lg:text-[11px] max-lg:text-[10px]">
                  Allergy · {tag}
                </span>
              ))}
            </div>

            {/* 가격 */}
            <div className="lg:text-[22px] max-lg:text-[18px] tracking-[-0.01em] text-[#1a0a05] tabular-nums">
              {meal.price.toLocaleString()}원
            </div>

            {/* 구분선 */}
            <div className="h-px bg-[#e5e2dc]" />

            {/* 재료 (최대 4개) */}
            {ingredients.length > 0 && (
              <div className="shrink-0">
                <h4 className="lg:text-[10px] max-lg:text-[9px] tracking-[0.14em] uppercase text-[#8c451d] mb-[6px]">
                  Ingredients
                </h4>
                <ul className="list-none p-0 m-0 lg:text-[13px] max-lg:text-[12px] text-[#3d3d3d] leading-[1.8]">
                  {ingredients.map((ing) => (
                    <li key={ing.name} className="flex justify-between py-[2px]">
                      <span>{ing.name}</span>
                      <span className="text-[#9a928c]">{ing.amountG}g</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 영양 정보 */}
            <div className="shrink-0">
              <h4 className="lg:text-[10px] max-lg:text-[9px] tracking-[0.14em] uppercase text-[#8c451d] mb-[6px]">
                Nutrition
              </h4>
              <div className="grid grid-cols-4 gap-[6px]">
                {nutritionItems.map((n) => (
                  <div key={n.label} className="border border-[#e5e2dc] px-[4px] lg:pt-[8px] lg:pb-[6px] max-lg:pt-[6px] max-lg:pb-[4px] text-center">
                    <strong className="block lg:text-[15px] max-lg:text-[13px] font-normal text-[#3d3d3d] tracking-[-0.005em]">
                      {n.value}{n.unit}
                    </strong>
                    <span className="text-[#9a928c] lg:text-[10px] max-lg:text-[9px] tracking-[0.04em]">
                      {n.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mmSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (max-width: 1023px) {
          [data-menu-modal="true"] { animation: mmSlideUp 0.28s ease; }
        }
      `}</style>
    </>
  );
}
