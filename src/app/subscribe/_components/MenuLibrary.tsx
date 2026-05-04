"use client";

import { useState } from "react";
import type {
  AllergyFilter,
  DietType,
  DisplayMenuData,
  NutritionGoal,
  SpicyPreference,
} from "../_data/subscription";
import { FilterPanel } from "./FilterPanel";
import { MealCard } from "./MealCard";
import { MenuDetailModal } from "./MenuDetailModal";

interface MenuLibraryProps {
  dietType: DietType | null;
  nutritionGoals: NutritionGoal[];
  allergyFilters: AllergyFilter[];
  spicyPreference: SpicyPreference | null;
  filteredMeals: DisplayMenuData[];
  draggingMealId: string | null;
  onDietTypeChange: (v: DietType | null) => void;
  onNutritionGoalToggle: (v: NutritionGoal) => void;
  onAllergyFilterToggle: (v: AllergyFilter) => void;
  onSpicyPreferenceChange: (v: SpicyPreference | null) => void;
  onResetFilters: () => void;
  onAddMeal: (m: DisplayMenuData) => void;
  onDragStartMeal: (mealId: string) => void;
  onDragEndMeal: () => void;
}

export function MenuLibrary({
  dietType,
  nutritionGoals,
  allergyFilters,
  spicyPreference,
  filteredMeals,
  draggingMealId,
  onDietTypeChange,
  onNutritionGoalToggle,
  onAllergyFilterToggle,
  onSpicyPreferenceChange,
  onResetFilters,
  onAddMeal,
  onDragStartMeal,
  onDragEndMeal,
}: MenuLibraryProps) {
  const [detailMeal, setDetailMeal] = useState<DisplayMenuData | null>(null);

  return (
    <aside className="flex flex-col h-full min-h-0" aria-label="구독 식단">
      {/* 헤더 — 데스크톱 전용 (catalog-header) */}
      <div className="shrink-0 bg-white">
        <div className="hidden lg:flex h-[48px] px-5 items-center justify-center border-b border-black bg-white">
          <h1 className="text-[14px] font-normal tracking-[-0.005em] text-black">주 14끼 구독 식단</h1>
        </div>

        <FilterPanel
          dietType={dietType}
          nutritionGoals={nutritionGoals}
          allergyFilters={allergyFilters}
          spicyPreference={spicyPreference}
          onDietTypeChange={onDietTypeChange}
          onNutritionGoalToggle={onNutritionGoalToggle}
          onAllergyFilterToggle={onAllergyFilterToggle}
          onSpicyPreferenceChange={onSpicyPreferenceChange}
          onResetFilters={onResetFilters}
        />
      </div>

      {/* 메뉴 그리드 */}
      <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto bg-[#fcfaf8]">
        {filteredMeals.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-12 px-8 text-center">
            <p className="text-[13px] text-[#9a928c]">조건에 맞는 메뉴가 없습니다</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="border border-black px-4 py-2 text-[12px] tracking-[0.06em] hover:bg-black hover:text-[#dfff4f] transition-colors"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                draggingMealId={draggingMealId}
                onAdd={onAddMeal}
                onDetail={setDetailMeal}
                onDragStart={onDragStartMeal}
                onDragEnd={onDragEndMeal}
              />
            ))}
          </div>
        )}
      </div>

      <MenuDetailModal
        meal={detailMeal}
        onClose={() => setDetailMeal(null)}
        onAdd={(meal) => { onAddMeal(meal); setDetailMeal(null); }}
      />
    </aside>
  );
}
