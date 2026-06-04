"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import TopControlBar, { type TabItem, type SortOption } from "@/components/store/TopControlBar";
import { ProductCard } from "./ProductCard";
import { FilterDrawer, type FilterState } from "./FilterDrawer";
import type { StoreProduct, StoreSortParam } from "@/lib/api/store";

const SORT_OPTIONS: SortOption[] = [
  { value: "nameAsc",     label: "상품명순 A-Z" },
  { value: "nameDesc",    label: "상품명순 Z-A" },
  { value: "priceAsc",    label: "가격 낮은순" },
  { value: "popularDesc", label: "인기순" },
];

// id = 백엔드 StoreCategory 코드(상품 categories와 매칭), label = 한글 표시
const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: "전체",      label: "전체" },
  { id: "MEAL_KIT",  label: "밀키트" },
  { id: "BAKERY",    label: "베이커리" },
  { id: "SAUCE_OIL", label: "소스/오일" },
  { id: "GIFT",      label: "선물세트" },
  { id: "SIDE_DISH", label: "반찬" },
  { id: "RICE_BALL", label: "주먹밥" },
];

interface Props {
  initialProducts: StoreProduct[];
  currentSort: StoreSortParam;
}

export function StoreClient({ initialProducts, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState("전체");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    diet: "전체",
    restrictions: [],
    foodTypes: [],
  });

  function handleSortChange(value: string) {
    startTransition(() => {
      router.push(`${pathname}?sort=${value}`);
    });
  }

  const filtered = activeTab === "전체"
    ? initialProducts
    : initialProducts.filter((p) => p.categories.includes(activeTab));

  const tabs: TabItem[] = CATEGORY_TABS.map((cat) => ({
    id: cat.id,
    label: cat.label,
    count: cat.id === "전체"
      ? initialProducts.length
      : initialProducts.filter((p) => p.categories.includes(cat.id)).length,
  }));

  const filterCount =
    (filters.diet !== "전체" ? 1 : 0) +
    filters.restrictions.length +
    filters.foodTypes.length;

  return (
    <div className={`min-h-screen bg-[var(--bg-pale)] transition-opacity${isPending ? " opacity-60" : ""}`}>
      <TopControlBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showFilter
        filterCount={filterCount}
        onFilterClick={() => setFilterOpen(true)}
        showSort
        sortOptions={SORT_OPTIONS}
        currentSort={currentSort}
        onSortChange={handleSortChange}
      />

      <div className="mx-auto max-w-[1400px] px-4 py-6 pt-[60px]">
        {filtered.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-[14px] text-gray-400">상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard key={product.productId} product={product} />
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
