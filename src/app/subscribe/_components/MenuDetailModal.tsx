"use client";

import { useEffect } from "react";
import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { EXCLUDE_CATEGORIES } from "../_data/subscription";

interface MenuDetailModalProps {
  meal: DisplayMenuData | null;
  onClose: () => void;
  onAdd: (meal: DisplayMenuData) => void;
}

export function MenuDetailModal({ meal, onClose, onAdd }: MenuDetailModalProps) {
  useEffect(() => {
    if (!meal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [meal, onClose]);

  if (!meal) return null;

  const allergyTags = meal.excludable
    .filter((e) => e !== "spicy")
    .map((e) => EXCLUDE_CATEGORIES[e as ExcludeCategory]?.label)
    .filter(Boolean);

  const isSpicy = meal.excludable.includes("spicy");

  const categoryLabel = meal.category === "protein" ? "고단백" : "저칼로리";

  const nutritionItems = meal.nutrition
    ? [
        { label: "kcal",   value: meal.nutrition.kcal,    unit: "" },
        { label: "단백질", value: meal.nutrition.protein,  unit: "g" },
        { label: "탄수화물", value: meal.nutrition.carbs,  unit: "g" },
        { label: "지방",   value: meal.nutrition.fat,      unit: "g" },
      ].filter((n) => n.value != null)
    : [];

  return (
    <>
      {/* 딤 */}
      <div
        className="fixed inset-0 z-[200] bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* 래퍼 — 데스크톱: 중앙 / 모바일: 하단 */}
      <div
        className="fixed inset-0 z-[201] flex items-center justify-center p-6 lg:p-6 max-lg:p-0 max-lg:items-end"
        onClick={onClose}
      >
        {/* 다이얼로그 */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label={meal.displayName}
          className={[
            /* 공통 */
            "relative w-full bg-white overflow-auto",
            /* 데스크톱 */
            "lg:grid lg:grid-cols-2 lg:max-w-[760px] lg:max-h-[90dvh]",
            "lg:border lg:border-black lg:shadow-[0_16px_48px_rgba(0,0,0,0.18)]",
            /* 모바일 — 바텀시트 */
            "max-lg:flex max-lg:flex-col max-lg:h-[88dvh] max-lg:max-h-[88dvh]",
            "max-lg:border-t max-lg:border-black",
          ].join(" ")}
          style={{ animation: "modalSlideUp 0.28s ease" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-3 right-3 z-10 w-8 h-8 border border-black bg-white flex items-center justify-center text-[18px] leading-none hover:bg-black hover:text-[#dcfd4a] transition-colors"
          >
            ×
          </button>

          {/* 이미지 */}
          <div className="lg:aspect-square max-lg:shrink-0 max-lg:h-[26vh] max-lg:max-h-[240px] overflow-hidden bg-[#EDEAE5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meal.image}
              alt={meal.displayName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 정보 영역 */}
          <div className="flex flex-col lg:p-8 max-lg:p-[18px] lg:gap-[14px] max-lg:gap-[10px] lg:border-l lg:border-black max-lg:border-t max-lg:border-black max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-y-auto">

            {/* 이름 */}
            <h3 className="lg:text-[22px] max-lg:text-[18px] tracking-[-0.01em] leading-[1.3] text-[#3d3d3d] pr-8">
              {meal.displayName}
            </h3>

            {/* 설명 */}
            <p className="lg:text-[13px] max-lg:text-[12px] text-[#6b6b6b] lg:leading-[1.7] max-lg:leading-[1.6]">
              {meal.description || "슬런치 채식 식단"}
            </p>

            {/* 태그 */}
            <div className="flex flex-wrap gap-[6px]">
              <span className="lg:px-[10px] max-lg:px-[8px] py-[3px] border border-black lg:text-[11px] max-lg:text-[10px]">
                {categoryLabel}
              </span>
              {isSpicy && (
                <span className="lg:px-[10px] max-lg:px-[8px] py-[3px] border border-black lg:text-[11px] max-lg:text-[10px]">
                  매운맛
                </span>
              )}
              {allergyTags.map((tag) => (
                <span
                  key={tag}
                  className="lg:px-[10px] max-lg:px-[8px] py-[3px] bg-[#fbf2f2] text-[#e05858] border border-[#e05858] lg:text-[11px] max-lg:text-[10px]"
                >
                  Allergy · {tag}
                </span>
              ))}
            </div>

            {/* 가격 */}
            <div className="lg:text-[22px] max-lg:text-[18px] tracking-[-0.01em] text-[#3d3d3d]">
              {meal.price.toLocaleString()}원
            </div>

            {/* 구분선 */}
            <div className="h-px bg-[#e5e2dc]" />

            {/* 재료 */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <h4 className="lg:text-[10px] max-lg:text-[9px] tracking-[0.14em] uppercase text-[#8c451d] mb-[8px]">
                  Ingredients
                </h4>
                <div className="flex flex-wrap gap-[5px]">
                  {meal.ingredients.map((ing) => (
                    <span
                      key={ing.name}
                      className="inline-flex items-baseline gap-[4px] bg-[#f7f4ef] border border-[#e5e2dc] px-[8px] py-[3px] lg:text-[12px] max-lg:text-[11px] text-[#3d3d3d]"
                    >
                      {ing.name}
                      <span className="text-[#9e9589] lg:text-[10px] max-lg:text-[9px]">{ing.amountG}g</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 영양 정보 */}
            {nutritionItems.length > 0 && (
              <div>
                <h4 className="lg:text-[10px] max-lg:text-[9px] tracking-[0.14em] uppercase text-[#8c451d] mb-[6px]">
                  Nutrition
                </h4>
                <div className="grid grid-cols-4 gap-[6px]">
                  {nutritionItems.map((n) => (
                    <div
                      key={n.label}
                      className="border border-[#e5e2dc] px-[4px] lg:pt-[8px] lg:pb-[6px] max-lg:pt-[6px] max-lg:pb-[4px] text-center"
                    >
                      <strong className="block lg:text-[15px] max-lg:text-[13px] font-normal text-[#3d3d3d] tracking-[-0.005em]">
                        {n.value}{n.unit}
                      </strong>
                      <span className="text-[#6b6b6b] lg:text-[10px] max-lg:text-[9px] tracking-[0.04em]">
                        {n.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="mt-auto grid grid-cols-[1fr_2fr] gap-[8px] pt-[8px]">
              <button
                type="button"
                onClick={onClose}
                className="py-[12px] lg:text-[13px] max-lg:text-[12px] tracking-[0.06em] border border-black hover:bg-[#f7f4ef] transition-colors"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => { onAdd(meal); onClose(); }}
                className="py-[12px] lg:text-[13px] max-lg:text-[12px] tracking-[0.06em] bg-black text-[#dcfd4a] hover:bg-[#8c451d] transition-colors"
              >
                식단에 추가하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @media (min-width: 1024px) {
          [role="dialog"][aria-label] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
