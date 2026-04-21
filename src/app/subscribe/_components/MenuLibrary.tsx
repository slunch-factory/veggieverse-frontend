"use client";

import type { DisplayMenuData, ExcludeCategory, MenuCategory, PlanType } from "../_data/subscription";
import { PLAN_TYPES } from "../_data/subscription";
import { PlanTabs } from "./PlanTabs";
import { ExcludeFilterRow } from "./ExcludeFilterRow";
import { MealCard } from "./MealCard";

interface MenuLibraryProps {
  selectedPlanType: MenuCategory | null;
  selectedPlan: PlanType | null;
  selectedExcludes: ExcludeCategory[];
  planMeals: { primary: DisplayMenuData[]; others: DisplayMenuData[] };
  filteredMeals: DisplayMenuData[];
  draggingMealId: string | null;
  onPlanTypeSelect: (id: MenuCategory) => void;
  onToggleExclude: (c: ExcludeCategory) => void;
  onResetExcludes: () => void;
  onAddMeal: (m: DisplayMenuData) => void;
  onDragStartMeal: (mealId: string) => void;
  onDragEndMeal: () => void;
}

export function MenuLibrary({
  selectedPlanType,
  selectedPlan,
  selectedExcludes,
  planMeals,
  filteredMeals,
  draggingMealId,
  onPlanTypeSelect,
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
        <PlanTabs
          plans={PLAN_TYPES}
          selectedPlanType={selectedPlanType}
          onSelect={onPlanTypeSelect}
        />
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
        ) : selectedPlan ? (
          <>
            <section
              className="border-b border-black px-5 pb-6 pt-5"
              style={{ background: selectedPlan.color }}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <div>
                  <p
                    className="mb-1 text-[11px] uppercase tracking-[0.2em]"
                    style={{ color: selectedPlan.accent }}
                  >
                    {selectedPlan.subtitle}
                  </p>
                  <h3 className="text-[18px] text-black">{selectedPlan.name}</h3>
                </div>
                <span className="shrink-0 text-[11px] text-gray-500">
                  {planMeals.primary.length}개 식단 · 자동 구성
                </span>
              </div>
              <p className="mb-5 text-[12px] leading-relaxed text-gray-700">
                {selectedPlan.description}
              </p>
              {planMeals.primary.length > 0 ? (
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                  {planMeals.primary.map((meal) => (
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
              ) : (
                <p className="text-[12px] text-gray-500">제외 재료 필터에 맞는 식단이 없습니다.</p>
              )}
            </section>
            {planMeals.others.length > 0 && (
              <section className="px-5 pb-5 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <h4 className="text-[13px] text-gray-500">그 외 식단</h4>
                  <span className="text-[11px] text-gray-400">다른 플랜 메뉴도 개별 추가 가능</span>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                  {planMeals.others.map((meal) => (
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
              </section>
            )}
          </>
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
