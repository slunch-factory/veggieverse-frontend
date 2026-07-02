"use client";

import { Search, X } from "lucide-react";
import type {
  AllergyFilter,
  DietType,
  NutritionGoal,
  SpicyPreference,
} from "../_data/subscription";
import {
  ALLERGY_FILTER_OPTIONS,
  DIET_TYPE_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  SPICY_PREFERENCE_OPTIONS,
} from "../_data/subscription";

interface FilterSidebarProps {
  /** 메뉴·재료 검색어 — 필터 영역 안의 검색창과 연결 */
  query: string;
  onQueryChange: (v: string) => void;
  dietType: DietType | null;
  nutritionGoals: NutritionGoal[];
  allergyFilters: AllergyFilter[];
  spicyPreference: SpicyPreference | null;
  onDietTypeChange: (v: DietType | null) => void;
  onNutritionGoalToggle: (v: NutritionGoal) => void;
  onAllergyFilterToggle: (v: AllergyFilter) => void;
  onSpicyPreferenceChange: (v: SpicyPreference | null) => void;
  onResetFilters: () => void;
}

/** 섹션 구분용 옅은 라인 — 스토어 필터 사이드바와 동일 톤 */
const DIVIDER = "border-b border-[rgba(26,10,5,0.1)]";

function OptionRow({
  label,
  active,
  isExclude,
  onClick,
}: {
  label: string;
  active: boolean;
  isExclude?: boolean;
  onClick: () => void;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 cursor-pointer text-[14px] ${
        active && isExclude ? "line-through decoration-[1px]" : ""
      }`}
      style={{ color: active ? (isExclude ? "#a0a0a0" : "#000") : "#666" }}
      onClick={onClick}
    >
      <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
        {active && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
      </span>
      {label}
    </label>
  );
}

/**
 * 데스크톱(lg+) 전용 구독 식단 왼쪽 필터 사이드바 — 스토어와 동일한
 * 컬리 스타일(박스 없이 옅은 구분선만), 클릭 즉시 반영.
 * 모바일 바텀시트는 기존 가로 드롭다운(FilterPanel)을 그대로 사용한다.
 */
export function FilterSidebar({
  query,
  onQueryChange,
  dietType,
  nutritionGoals,
  allergyFilters,
  spicyPreference,
  onDietTypeChange,
  onNutritionGoalToggle,
  onAllergyFilterToggle,
  onSpicyPreferenceChange,
  onResetFilters,
}: FilterSidebarProps) {
  const hasActive =
    dietType !== null ||
    nutritionGoals.length > 0 ||
    allergyFilters.length > 0 ||
    spicyPreference !== null;

  return (
    <div className="no-scrollbar flex flex-col px-4 pt-4 lg:sticky lg:top-[calc(var(--header-area-h,var(--header-h))+16px)] lg:max-h-[calc(100dvh-var(--header-area-h,var(--header-h))-32px)] lg:overflow-y-auto">
      <div className="flex items-center justify-between pb-3">
        <span className="text-[15px] font-bold">필터</span>
        {hasActive && (
          <button
            type="button"
            onClick={onResetFilters}
            className="cursor-pointer text-[12px] text-gray-500 underline underline-offset-2 transition-colors hover:text-black"
          >
            초기화
          </button>
        )}
      </div>

      {/* 메뉴 검색 — 이름/재료 */}
      <div className={`pb-4 ${DIVIDER}`}>
        <div className="relative flex items-center">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5"
            style={{ color: "var(--neutral-stone)" }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="메뉴·재료 검색"
            aria-label="메뉴 검색"
            className="h-[32px] w-full border border-[rgba(26,10,5,0.18)] bg-white pl-7 pr-7 text-[12px] text-black outline-none transition-colors focus:border-black"
            style={{ borderRadius: "var(--r-btn)" }}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="검색어 지우기"
              className="absolute right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center"
              style={{ color: "var(--neutral-stone)" }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className={`py-5 ${DIVIDER}`}>
        <p className="mb-3 text-[13px] font-bold">식이 유형</p>
        <div className="flex flex-col gap-2.5">
          {DIET_TYPE_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              active={dietType === opt.value}
              onClick={() => onDietTypeChange(dietType === opt.value ? null : opt.value)}
            />
          ))}
        </div>
      </div>

      <div className={`py-5 ${DIVIDER}`}>
        <p className="mb-3 text-[13px] font-bold">영양 목표</p>
        <div className="flex flex-col gap-2.5">
          {NUTRITION_GOAL_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              active={nutritionGoals.includes(opt.value)}
              onClick={() => onNutritionGoalToggle(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className={`py-5 ${DIVIDER}`}>
        <p className="mb-3 text-[13px] font-bold">알러지 제외</p>
        <div className="flex flex-col gap-2.5">
          {ALLERGY_FILTER_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              active={allergyFilters.includes(opt.value)}
              isExclude
              onClick={() => onAllergyFilterToggle(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="py-5">
        <p className="mb-3 text-[13px] font-bold">매운맛</p>
        <div className="flex flex-col gap-2.5">
          {SPICY_PREFERENCE_OPTIONS.map((opt) => (
            <OptionRow
              key={opt.value}
              label={opt.label}
              active={spicyPreference === opt.value}
              isExclude={opt.value === "exclude"}
              onClick={() =>
                onSpicyPreferenceChange(spicyPreference === opt.value ? null : opt.value)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
