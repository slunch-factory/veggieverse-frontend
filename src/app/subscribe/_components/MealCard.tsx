"use client";

import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { EXCLUDE_CATEGORIES } from "../_data/subscription";

interface MealCardProps {
  meal: DisplayMenuData;
  draggingMealId: string | null;
  onAdd: (meal: DisplayMenuData) => void;
  onDetail: (meal: DisplayMenuData) => void;
  onDragStart: (mealId: string) => void;
  onDragEnd: () => void;
}

export function MealCard({ meal, draggingMealId, onDetail, onDragStart, onDragEnd }: MealCardProps) {
  const isDragging = draggingMealId === meal.id;
  const allergyLabel = meal.excludable.length > 0
    ? meal.excludable.map((c) => EXCLUDE_CATEGORIES[c as ExcludeCategory]?.label ?? c).join(", ")
    : "";

  return (
    <div
      onClick={() => onDetail(meal)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", meal.id);
        onDragStart(meal.id);
      }}
      onDragEnd={onDragEnd}
      className={`cursor-pointer select-none ${isDragging ? "opacity-40" : ""}`}
    >
      {/* 썸네일 */}
      <div className="relative w-full aspect-[4/3] lg:aspect-square overflow-hidden bg-[#fcfaf8] rounded-[4px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meal.image}
          alt={meal.displayName}
          className="h-full w-full object-cover"
          draggable={false}
        />
        {allergyLabel && (
          <div className="absolute left-0 bottom-0 bg-[#1a0a05] text-white px-[5px] py-[3px] text-[10px] tracking-[0.02em] leading-snug rounded-tr-[4px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
            Allergy: {allergyLabel}
          </div>
        )}
      </div>

      {/* 정보 */}
      <h3 className="mt-3 text-[14px] font-normal leading-snug text-[#1a0a05] truncate">
        {meal.displayName}
      </h3>
      <p className="mt-1 text-[12px] text-[#9a928c] leading-snug truncate">
        {meal.description || "슬런치 채식 식단"}
      </p>
      <p className="mt-2 text-[15px] font-normal text-[#1a0a05]">
        {meal.price.toLocaleString()}원
      </p>
    </div>
  );
}
