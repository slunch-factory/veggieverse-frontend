"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { FilterDrawer, type FilterState } from "./FilterDrawer";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown, type SortOption } from "./SortDropdown";
import { Pagination } from "@/components/ui/Pagination";
import { isStockSoldOut, type StoreProduct, type StoreSortParam } from "@/lib/api/store";

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

/** 한 페이지에 노출하는 상품 수 */
const PAGE_SIZE = 18;

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
  const [page, setPage] = useState(1);

  // 검색어: 상품명/태그라인 부분일치(대소문자·공백 무시). 백엔드 검색 API 도입 시 이 블록을 교체.
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchBase = normalizedQuery
    ? initialProducts.filter((p) =>
        `${p.name} ${p.tagline}`.toLowerCase().includes(normalizedQuery),
      )
    : initialProducts;

  // 검색어가 바뀌면(헤더 검색 등 외부 요인) 1페이지로 — 렌더 중 상태 보정 패턴
  const [prevQuery, setPrevQuery] = useState(normalizedQuery);
  if (prevQuery !== normalizedQuery) {
    setPrevQuery(normalizedQuery);
    setPage(1);
  }

  function buildQuery(sort: string) {
    const params = new URLSearchParams({ sort });
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    return `${pathname}?${params.toString()}`;
  }

  function handleSortChange(value: string) {
    setPage(1);
    startTransition(() => {
      router.push(buildQuery(value));
    });
  }

  function handleClearSearch() {
    startTransition(() => {
      router.push(`${pathname}?sort=${currentSort}`);
    });
  }

  function handleTabChange(id: string) {
    setActiveTab(id);
    setPage(1);
  }

  function handleFiltersChange(f: FilterState) {
    setFilters(f);
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(next);
    // 목록 상단으로 즉시 이동 — smooth는 리렌더(문서 높이 변경)와 겹치면 중단될 수 있다.
    window.scrollTo(0, 0);
  }

  const filtered = activeTab === "전체"
    ? searchBase
    : searchBase.filter((p) => p.categories.includes(activeTab));

  // 품절(재고 SOLD_OUT) 상품은 항상 목록 하단으로, 판매 상품은 위로. 같은 그룹 내 순서는 stable sort로 유지.
  const ordered = [...filtered].sort(
    (a, b) => Number(isStockSoldOut(a.stock)) - Number(isStockSoldOut(b.stock)),
  );

  // 페이지네이션 — PAGE_SIZE개씩 잘라서 노출
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = ordered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const categories = CATEGORY_TABS.map((cat) => ({
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
    <div className="min-h-screen bg-[var(--bg-pale)]">
      <div className="mx-auto max-w-[1200px] px-4 pt-10 pb-16">
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

        {/* 데스크톱: 왼쪽 고정 필터 사이드바 + 오른쪽 상품 그리드(3열) — 컬리 스타일 */}
        {/* items-stretch(기본값) 유지 — 사이드바 컬럼이 그리드 높이만큼 늘어나야 내부 sticky가 동작한다 */}
        <div className="flex gap-8">
          <FilterSidebar
            categories={categories}
            activeCategory={activeTab}
            onCategoryChange={handleTabChange}
            filters={filters}
            onChange={handleFiltersChange}
          />

          <div className="min-w-0 flex-1">
            {/* 모바일 전용: 카테고리 칩 */}
            <div className="mb-4 flex gap-2 overflow-x-auto no-scrollbar lg:hidden">
              {categories.map((cat) => {
                const active = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleTabChange(cat.id)}
                    className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-[13px] transition-colors ${
                      active
                        ? "border-black bg-black text-white"
                        : "border-[rgba(26,10,5,0.2)] bg-white text-[#3d3d3d]"
                    }`}
                    style={{ borderRadius: "var(--r-btn)" }}
                  >
                    {cat.label} ({cat.count})
                  </button>
                );
              })}
            </div>

            {/* 목록 상단 바: 총 개수 + (모바일 필터 버튼) + 정렬 */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[13px] text-gray-500">총 {ordered.length}개</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="relative flex items-center gap-1.5 border border-black bg-white px-2.5 py-1 text-[13px] lg:hidden"
                >
                  <SlidersHorizontal size={14} />
                  필터{filterCount > 0 && ` (${filterCount})`}
                </button>

                {/* 정렬 — 데스크톱: 전부 펼쳐서 가로 배치(컬리 스타일), 구분선은 | */}
                <div className="hidden items-center lg:flex">
                  {SORT_OPTIONS.map((opt, i) => {
                    const active = currentSort === opt.value;
                    return (
                      <Fragment key={opt.value}>
                        {i > 0 && (
                          <span aria-hidden className="mx-2.5 text-[11px] text-gray-300">
                            |
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSortChange(opt.value)}
                          className={`cursor-pointer text-[13px] transition-colors ${
                            active ? "font-bold text-black" : "text-gray-400 hover:text-black"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </Fragment>
                    );
                  })}
                </div>

                {/* 모바일: 가로 공간이 없어 드롭다운 유지 */}
                <div className="lg:hidden">
                  <SortDropdown
                    options={SORT_OPTIONS}
                    value={currentSort}
                    onChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {isPending ? (
              /* 정렬 등 전환 중 — 화면을 덮지 않고 카드 자리에 스켈레톤을 채운다 */
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
                {Array.from({ length: Math.max(paged.length, 6) }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : ordered.length === 0 ? (
              <div className="flex min-h-[30vh] items-center justify-center">
                <p className="text-[14px] text-gray-400">
                  {searchQuery.trim()
                    ? `'${searchQuery.trim()}'에 대한 검색 결과가 없습니다.`
                    : "상품이 없습니다."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
                  {paged.map((product, index) => (
                    // 첫 행(최대 3열) 대표 이미지는 LCP 후보 → 앞 3개만 priority preload
                    <ProductCard key={product.productId} product={product} priority={index < 3} />
                  ))}
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <FilterDrawer
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={handleFiltersChange}
      />
    </div>
  );
}
