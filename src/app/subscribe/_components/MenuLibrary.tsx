"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
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
  /** 선택된 슬롯의 사람용 라벨(예: "6/25 점심"). null이면 미선택 */
  selectedSlotLabel: string | null;
  onCancelSelectedSlot: () => void;
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
  selectedSlotLabel,
  onCancelSelectedSlot,
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
  const [query, setQuery] = useState("");

  // 필터패널 결과(filteredMeals) 위에 메뉴명·재료명 검색을 추가로 적용한다.
  const q = query.trim().toLowerCase();
  const visibleMeals = useMemo(() => {
    if (!q) return filteredMeals;
    return filteredMeals.filter((meal) => {
      if (meal.displayName.toLowerCase().includes(q)) return true;
      if (meal.name.toLowerCase().includes(q)) return true;
      return (meal.ingredients ?? []).some((ing) => ing.name.toLowerCase().includes(q));
    });
  }, [filteredMeals, q]);

  const isSearching = q.length > 0;

  return (
    <aside className="flex flex-col h-full min-h-0" aria-label="구독 식단">
      {/* 헤더 — 데스크톱 전용 (catalog-header) */}
      <div className="shrink-0 bg-white">
        <div className="hidden lg:flex h-[48px] px-5 items-center justify-center border-b border-black bg-white">
          <h1 className="text-[14px] font-normal tracking-[-0.005em] text-black">구독 식단</h1>
        </div>

        {/* 메뉴 검색 — 이름/재료 */}
        <div className="px-5 py-3 border-b border-black bg-white">
          <div className="relative flex items-center">
            <Search
              size={15}
              className="absolute left-3 pointer-events-none"
              style={{ color: "var(--neutral-stone)" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="메뉴·재료 검색"
              aria-label="메뉴 검색"
              className="w-full h-[38px] pl-9 pr-9 text-[13px] text-black border border-[var(--neutral-stone)] bg-white outline-none focus:border-black transition-colors"
              style={{ borderRadius: "var(--r-btn)" }}
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="검색어 지우기"
                className="absolute right-2 flex items-center justify-center w-6 h-6"
                style={{ color: "var(--neutral-stone)" }}
              >
                <X size={15} />
              </button>
            )}
          </div>
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
        {/* 선택된 슬롯 안내 배너 — 메뉴 카드를 클릭하면 이 슬롯에 담긴다 */}
        {selectedSlotLabel && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-black bg-[#dfff4f] px-4 py-2.5">
            <span className="text-[12px] font-medium leading-snug text-black">
              <b>{selectedSlotLabel}</b> 칸에 담는 중 · 메뉴를 선택하세요
            </span>
            <button
              type="button"
              onClick={onCancelSelectedSlot}
              aria-label="슬롯 선택 취소"
              className="flex items-center gap-1 shrink-0 text-[11px] text-black/70 hover:text-black transition-colors"
            >
              취소
              <X size={13} />
            </button>
          </div>
        )}
        {visibleMeals.length === 0 ? (
          isSearching ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12 px-8 text-center">
              <p className="text-[13px] text-[#9a928c]">
                &lsquo;{query.trim()}&rsquo; 검색 결과가 없습니다
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="border border-black px-4 py-2 text-[12px] tracking-[0.06em] hover:bg-black hover:text-[#dfff4f] transition-colors"
              >
                검색어 지우기
              </button>
            </div>
          ) : (
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
          )
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {visibleMeals.map((meal) => (
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
