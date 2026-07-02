"use client";

import {
  type FilterState,
  DIET_OPTIONS,
  RESTRICTION_OPTIONS,
  FOOD_TYPE_OPTIONS,
} from "./FilterDrawer";

export interface CategoryItem {
  id: string;
  label: string;
  count: number;
}

/** 섹션 구분용 옅은 라인 — 검정 보더 대신 컬리처럼 부드러운 톤 */
const DIVIDER = "border-b border-[rgba(26,10,5,0.1)]";

/**
 * 데스크톱(lg+) 전용 왼쪽 고정 필터 사이드바 — 컬리 스타일(박스 없이 옅은 구분선만).
 * 스크롤해도 화면에 고정(sticky)되며, 카테고리·필터 모두 클릭 즉시 반영된다.
 * 모바일은 기존 FilterDrawer 사용.
 */
export function FilterSidebar({
  categories,
  activeCategory,
  onCategoryChange,
  filters,
  onChange,
}: {
  categories: CategoryItem[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const filterCount =
    (filters.diet !== "전체" ? 1 : 0) +
    filters.restrictions.length +
    filters.foodTypes.length;

  const renderOption = (label: string, selected: boolean, onClick: () => void) => (
    <label
      key={label}
      className="flex items-center gap-2.5 cursor-pointer text-[14px]"
      style={{ color: selected ? "#000" : "#666" }}
      onClick={onClick}
    >
      <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
        {selected && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
      </span>
      {label}
    </label>
  );

  return (
    <aside aria-label="상품 필터" className="hidden w-[190px] shrink-0 lg:block">
      <div className="sticky top-[calc(var(--header-area-h,var(--header-h))+16px)] max-h-[calc(100dvh-var(--header-area-h,var(--header-h))-32px)] overflow-y-auto no-scrollbar">
        <div className={`flex items-center justify-between pb-3.5 ${DIVIDER}`}>
          <span className="text-[15px] font-bold">필터</span>
          {filterCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ diet: "전체", restrictions: [], foodTypes: [] })}
              className="cursor-pointer text-[12px] text-gray-500 underline underline-offset-2 hover:text-black"
            >
              초기화
            </button>
          )}
        </div>

        <div className={`py-5 ${DIVIDER}`}>
          <p className="mb-3 text-[13px] font-bold">카테고리</p>
          <div className="flex flex-col gap-2.5">
            {categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex cursor-pointer items-center justify-between text-left text-[14px] transition-colors ${
                    active ? "font-bold text-black" : "text-[#666] hover:text-black"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[12px] font-normal text-gray-400">{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`py-5 ${DIVIDER}`}>
          <p className="mb-3 text-[13px] font-bold">식이 유형</p>
          <div className="flex flex-col gap-2.5">
            {DIET_OPTIONS.map((opt) =>
              renderOption(opt, filters.diet === opt, () =>
                onChange({ ...filters, diet: opt }),
              ),
            )}
          </div>
        </div>

        <div className={`py-5 ${DIVIDER}`}>
          <p className="mb-3 text-[13px] font-bold">식이 제한</p>
          <div className="flex flex-col gap-2.5">
            {RESTRICTION_OPTIONS.map((opt) =>
              renderOption(opt, filters.restrictions.includes(opt), () =>
                onChange({ ...filters, restrictions: toggleArray(filters.restrictions, opt) }),
              ),
            )}
          </div>
        </div>

        <div className="py-5">
          <p className="mb-3 text-[13px] font-bold">음식 종류</p>
          <div className="flex flex-col gap-2.5">
            {FOOD_TYPE_OPTIONS.map((opt) =>
              renderOption(opt, filters.foodTypes.includes(opt), () =>
                onChange({ ...filters, foodTypes: toggleArray(filters.foodTypes, opt) }),
              ),
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
