"use client";

import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { getAllergens, getAllergyLabel } from "../_data/subscription";

interface MealCardProps {
  meal: DisplayMenuData;
  draggingMealId: string | null;
  onAdd: (meal: DisplayMenuData) => void;
  onDetail: (meal: DisplayMenuData) => void;
  onDragStart: (mealId: string) => void;
  onDragEnd: () => void;
}

export function MealCard({ meal, draggingMealId, onAdd, onDetail, onDragStart, onDragEnd }: MealCardProps) {
  const allergens = getAllergens(meal.excludable as ExcludeCategory[]);
  const isDragging = draggingMealId === meal.id;

  return (
    <div
      onClick={() => onAdd(meal)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", meal.id);
        onDragStart(meal.id);
      }}
      onDragEnd={onDragEnd}
      className={`group cursor-pointer select-none px-3 pt-4 pb-5 ${isDragging ? "opacity-40" : ""}`}
    >
      {/* 썸네일 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EDEAE5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meal.image}
          alt={meal.displayName}
          className="h-full w-full object-cover"
        />
        {allergens.length > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/55 px-1.5 py-0.5 text-[10px] tracking-wide text-white leading-none">
            Allegy · {getAllergyLabel(meal.excludable as ExcludeCategory[])}
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="mt-3">
        <h3 className="text-[13px] leading-snug text-stone-900 truncate">
          {meal.displayName}
        </h3>
        <p className="mt-0.5 text-[11px] text-[#9E9589] truncate">
          {meal.description || "슬런치 채식 식단"}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[13px] text-stone-900">
            {meal.price.toLocaleString()}원
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDetail(meal); }}
            className="w-[20px] h-[20px] shrink-0 flex items-center justify-center text-[12px] leading-none border border-stone-800 text-stone-700 hover:text-[#dcfd4a] hover:bg-black hover:border-black transition-colors"
            aria-label={`${meal.displayName} 상세보기`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
