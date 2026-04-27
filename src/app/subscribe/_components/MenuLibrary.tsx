"use client";

import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { ExcludeFilterRow } from "./ExcludeFilterRow";
import { MealCard } from "./MealCard";

interface MenuLibraryProps {
  selectedExcludes: ExcludeCategory[];
  filteredMeals: DisplayMenuData[];
  draggingMealId: string | null;
  onToggleExclude: (c: ExcludeCategory) => void;
  onResetExcludes: () => void;
  onAddMeal: (m: DisplayMenuData) => void;
  onDragStartMeal: (mealId: string) => void;
  onDragEndMeal: () => void;
}

export function MenuLibrary({
  selectedExcludes,
  filteredMeals,
  draggingMealId,
  onToggleExclude,
  onResetExcludes,
  onAddMeal,
  onDragStartMeal,
  onDragEndMeal,
}: MenuLibraryProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col" aria-label="구독 식단">
      <div className="shrink-0 border-b border-black bg-white">
        <div className="px-6 pt-5 pb-4">
          <h2 className="text-[18px] leading-normal tracking-tight text-black">구독 식단</h2>
        </div>
        <ExcludeFilterRow
          selectedExcludes={selectedExcludes}
          onToggle={onToggleExclude}
          onReset={onResetExcludes}
        />
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-20 lg:pb-0">
        {filteredMeals.length === 0 ? (
          <div className="flex h-full items-center justify-center p-5 text-[14px] text-gray-400">
            조건에 맞는 메뉴가 없습니다
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  draggingMealId={draggingMealId}
                  onAdd={onAddMeal}
                  onDragStart={onDragStartMeal}
                  onDragEnd={onDragEndMeal}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
