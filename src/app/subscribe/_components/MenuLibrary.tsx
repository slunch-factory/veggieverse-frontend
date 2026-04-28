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
    <aside className="flex flex-col flex-1 min-h-0 lg:block" aria-label="구독 식단">
      {/* 헤더 — 데스크톱 전용 (모바일은 바텀시트 헤더 사용) */}
      <div className="shrink-0 bg-white">
        <div className="hidden lg:flex items-end justify-between px-6 pt-5 pb-4 border-black">
          <div>
            <h2 className="text-[20px] leading-tight tracking-tight text-black">메뉴 고르기</h2>
            <p className="mt-1 text-[12px] text-gray-400">
              클릭하거나 드래그해서 식단에 추가하세요
            </p>
          </div>
          <span className="text-[12px] text-gray-400 pb-0.5">
            {filteredMeals.length}개 메뉴
          </span>
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
        />
      </div>

      {/* 메뉴 그리드 — 데스크톱: 자연 높이(페이지 스크롤), 모바일: 내부 스크롤 */}
      <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto lg:overflow-y-visible pb-20 lg:pb-0 bg-white">
        {filteredMeals.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
            <p className="text-[14px] text-gray-400">조건에 맞는 메뉴가 없습니다</p>
            <button
              type="button"
              onClick={onResetFilters}
              className="border border-black px-4 py-2 text-[12px] tracking-wide hover:bg-black hover:text-white transition-colors"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-[#e5e2dc] overflow-hidden">
            {filteredMeals.map((meal) => (
              <div key={meal.id} className="border-r border-b border-[#e5e2dc]">
                <MealCard
                  meal={meal}
                  draggingMealId={draggingMealId}
                  onAdd={onAddMeal}
                  onDetail={setDetailMeal}
                  onDragStart={onDragStartMeal}
                  onDragEnd={onDragEndMeal}
                />
              </div>
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
