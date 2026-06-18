"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import TopControlBar, { type TabItem, type SortOption } from "@/components/store/TopControlBar";
import { ProductCard } from "./ProductCard";
import { FilterDrawer, type FilterState } from "./FilterDrawer";
import { isComingSoon, type StoreProduct, type StoreSortParam } from "@/lib/api/store";

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
  searchQuery?: string;
}

export function StoreClient({ initialProducts, currentSort, searchQuery = "" }: Props) {
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

  // 검색어: 상품명/태그라인 부분일치(대소문자·공백 무시). 백엔드 검색 API 도입 시 이 블록을 교체.
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchBase = normalizedQuery
    ? initialProducts.filter((p) =>
        `${p.name} ${p.tagline}`.toLowerCase().includes(normalizedQuery),
      )
    : initialProducts;

  function buildQuery(sort: string) {
    const params = new URLSearchParams({ sort });
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    return `${pathname}?${params.toString()}`;
  }

  function handleSortChange(value: string) {
    startTransition(() => {
      router.push(buildQuery(value));
    });
  }

  function handleClearSearch() {
    startTransition(() => {
      router.push(`${pathname}?sort=${currentSort}`);
    });
  }

  const filtered = activeTab === "전체"
    ? searchBase
    : searchBase.filter((p) => p.categories.includes(activeTab));

  // 준비중 상품은 항상 목록 하단으로, 판매 상품은 위로. 같은 그룹 내 순서(상품명 A-Z 등 현재 정렬)는 stable sort로 유지.
  const ordered = [...filtered].sort(
    (a, b) => Number(isComingSoon(a.slug)) - Number(isComingSoon(b.slug)),
  );

  const tabs: TabItem[] = CATEGORY_TABS.map((cat) => ({
    id: cat.id,
    label: cat.label,
    count: cat.id === "전체"
      ? searchBase.length
      : searchBase.filter((p) => p.categories.includes(cat.id)).length,
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
        {searchQuery.trim() && (
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[14px]">
            <span className="text-[var(--ink)]">
              <strong>&lsquo;{searchQuery.trim()}&rsquo;</strong> 검색 결과 {searchBase.length}건
            </span>
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-full border border-[var(--ink)] px-3 py-1 text-[12px] transition-colors hover:bg-[var(--ink)] hover:text-white"
            >
              검색 초기화
            </button>
          </div>
        )}
        {ordered.length === 0 ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-[14px] text-gray-400">
              {searchQuery.trim()
                ? `'${searchQuery.trim()}'에 대한 검색 결과가 없습니다.`
                : "상품이 없습니다."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {ordered.map((product) => (
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
