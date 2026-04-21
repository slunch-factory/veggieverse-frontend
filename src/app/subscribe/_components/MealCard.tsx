"use client";

import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { getAllergens, getAllergyLabel } from "../_data/subscription";

interface MealCardProps {
  meal: DisplayMenuData;
  draggingMealId: string | null;
  onAdd: (meal: DisplayMenuData) => void;
  onDragStart: (mealId: string) => void;
  onDragEnd: () => void;
}

export function MealCard({ meal, draggingMealId, onAdd, onDragStart, onDragEnd }: MealCardProps) {
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
      className={`group cursor-pointer transition-opacity ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden rounded-[4px] bg-[#F5F5F5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meal.image}
          alt={meal.displayName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {meal.isVariation && (
          <div className="absolute left-2 top-2 rounded bg-[#8C451D] px-2 py-0.5 text-[10px] text-white">
            변형
          </div>
        )}
        {allergens.length > 0 && (
          <div className="absolute right-0 bottom-0 rounded-tl bg-white/90 px-1 py-0.5 text-[9px] leading-tight text-gray-900 backdrop-blur-sm">
            Allergy: {getAllergyLabel(meal.excludable as ExcludeCategory[])}
          </div>
        )}
      </div>
      <div className="pt-4">
        <h3 className="mb-1 text-[15px] leading-tight text-black group-hover:underline">
          {meal.displayName}
        </h3>
        {meal.isVariation && meal.badge && (
          <p className="mb-1 text-[11px] text-[#8C451D]">{meal.badge}</p>
        )}
        <p className="mb-3 truncate text-[13px] leading-relaxed text-gray-500">
          {meal.description}
        </p>
        <span className="text-[16px] text-black">{meal.price.toLocaleString()}원</span>
      </div>
    </div>
  );
}
