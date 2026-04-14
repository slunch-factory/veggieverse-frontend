"use client";

import { useState } from "react";
import TopControlBar, { type TabItem, type SortOption } from "@/components/store/TopControlBar";
import type { Product } from "../_data/products";
import { ProductCard } from "./ProductCard";
import { FilterDrawer, type FilterState } from "./FilterDrawer";

const TAB_CATEGORY_MAP: Record<string, string> = {
  "소스/오일": "소스와 오일",
};

const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: "기본정렬" },
  { value: "name-asc", label: "상품명순 A-Z" },
  { value: "name-desc", label: "상품명순 Z-A" },
  { value: "price-asc", label: "가격 저가순" },
  { value: "price-desc", label: "가격 고가순" },
  { value: "popular", label: "인기순" },
];

function buildTabs(products: Product[]): TabItem[] {
  const TAB_IDS = ["전체", "밀키트", "베이커리", "소스/오일", "세트", "구독"];
  return TAB_IDS.map((id) => ({
    id,
    label: id,
    count: id === "전체"
      ? products.length
      : products.filter((p) => p.category === (TAB_CATEGORY_MAP[id] ?? id)).length,
  }));
}

export function StoreClient({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("전체");
  const [sort, setSort] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    diet: "전체",
    restrictions: [],
    foodTypes: [],
  });

  const tabs = buildTabs(products);

  const filterCount =
    (filters.diet !== "전체" ? 1 : 0) +
    filters.restrictions.length +
    filters.foodTypes.length;

  const resolvedCategory = TAB_CATEGORY_MAP[activeTab] ?? activeTab;

  const filtered = activeTab === "전체"
    ? products
    : products.filter((p) => p.category === resolvedCategory);

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name, "ko");
      case "name-desc":
        return b.name.localeCompare(a.name, "ko");
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "popular":
        return a.id - b.id;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <TopControlBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showFilter
        filterCount={filterCount}
        onFilterClick={() => setFilterOpen(true)}
        showSort
        sortOptions={SORT_OPTIONS}
        currentSort={sort}
        onSortChange={setSort}
      />

      <div className="mx-auto max-w-[1400px] px-4 py-6 pt-[60px]">
        {sorted.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-[14px] text-gray-400">상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {sorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </div>
  );
}
