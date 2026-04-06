"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import TopControlBar, { TabItem, SortOption } from "@/components/store/TopControlBar";
import { Badge } from "@/components/ui/Badge";
import { getProductThumbnailImages } from "@/utils/productImages";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  soldOut?: boolean;
  isNew?: boolean;
  description?: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: "볶음김치", price: 12000, category: "밀키트", description: "깊고 진한 맛이 살아있는 볶음김치" },
  { id: 2, name: "김치볶음밥", price: 12000, originalPrice: 15000, category: "밀키트", description: "감칠맛 끝판왕, 한 그릇에 담은 김치볶음밥" },
  { id: 3, name: "시금치 뇨끼", price: 18000, originalPrice: 24000, category: "밀키트", description: "채소와 두부로 빚은 달콤짭짤 뇨끼" },
  { id: 4, name: "블루베리 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "슬런치 팩토리 프리미엄 블루베리 타르트" },
  { id: 5, name: "복숭아 타르트", price: 32000, originalPrice: 35000, category: "베이커리", description: "달콤한 복숭아를 올린 비건 디저트" },
  { id: 6, name: "잠봉뵈르", price: 8000, originalPrice: 12000, category: "밀키트", soldOut: true, description: "슬런치 팩토리의 베스트 셀러" },
  { id: 7, name: "자두 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "상큼한 자두를 올린 프리미엄 비건 타르트" },
  { id: 8, name: "피넛버터 초콜릿 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "고소한 피넛버터와 진한 초콜릿의 완벽한 조합" },
  { id: 9, name: "김치칼국수", price: 15000, category: "밀키트", description: "칼칼하고 진한 야채육수의 맛" },
  { id: 10, name: "김치전", price: 18000, category: "밀키트", description: "바삭하게 구운 비건 김치전" },
  { id: 11, name: "단호박 초코 케익", price: 35000, category: "베이커리", description: "부드러운 단호박과 진한 초콜릿의 조화" },
  { id: 14, name: "페퍼로니 피자", price: 22000, category: "밀키트", soldOut: true, description: "비건 페퍼로니와 신선한 채소를 올린 비건 피자" },
  { id: 16, name: "샐러드 드레싱 5종 테스터", price: 8800, category: "소스와 오일", description: "다양한 소스 맛보고 취향 찾아요" },
  { id: 17, name: "오리엔탈 드레싱", price: 7600, category: "소스와 오일", isNew: true, description: "고소하고 산뜻한 채소 친화적 드레싱" },
  { id: 18, name: "분짜 드레싱", price: 7600, category: "소스와 오일", isNew: true, description: "베트남 감성 그대로, 상큼한 피시프리 소스" },
  { id: 19, name: "랜치 드레싱 소스", price: 9600, category: "소스와 오일", isNew: true, description: "크리미하고 진한 맛, 샐러드의 완성" },
  { id: 20, name: "발사믹 드레싱", price: 7600, category: "소스와 오일", isNew: true, description: "깊고 달콤한 산미로 어떤 샐러드든 한 단계 업" },
  { id: 21, name: "바질 페스토 드레싱", price: 9600, category: "소스와 오일", isNew: true, description: "이탈리아 허브향 가득, 파스타에도 샐러드에도" },
  { id: 22, name: "매생이 크림 펜네", price: 5200, category: "밀키트", isNew: true, description: "바다향 매생이와 고소한 크림소스의 만남" },
  { id: 23, name: "매생이 트러플 리조또", price: 6000, category: "밀키트", isNew: true, description: "트러플 향으로 한 그릇을 특별하게" },
  { id: 24, name: "매생이 페스토", price: 8800, category: "소스와 오일", isNew: true, description: "제철 매생이로 만든 초록빛 건강 페스토" },
  { id: 25, name: "감태버터", price: 9600, category: "소스와 오일", isNew: true, description: "바다내음 감태로 만든 건강한 버터 스프레드" },
  { id: 26, name: "주먹밥 5종 10봉 세트", price: 21500, category: "세트", description: "인기 주먹밥 5종, 총 10봉 세트" },
  { id: 27, name: "김치 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "알싸하고 진한 김치맛이 밥알 하나하나에" },
  { id: 28, name: "간장버터 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "고소한 대두버터가 황금빛 밥알에 녹아들어" },
  { id: 29, name: "참치마요 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "크리미한 참치마요, 깔끔한 매운 끝맛" },
  { id: 30, name: "버섯 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "향긋하게 볶은 버섯이 밥 속 깊이" },
  { id: 31, name: "불고기 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "달콤 짭짤 불고기 맛에 스모키한 여운까지" },
];

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TAB_CATEGORY_MAP: Record<string, string> = {
  "소스/오일": "소스와 오일",
};

const TAB_IDS = ["전체", "밀키트", "베이커리", "소스/오일", "세트", "구독"];

const getTabCount = (tabId: string): number => {
  if (tabId === "전체") return PRODUCTS.length;
  const category = TAB_CATEGORY_MAP[tabId] ?? tabId;
  return PRODUCTS.filter((p) => p.category === category).length;
};

const TABS: TabItem[] = TAB_IDS.map((id) => ({
  id,
  label: id,
  count: getTabCount(id),
}));

const SORT_OPTIONS: SortOption[] = [
  { value: "default", label: "기본정렬" },
  { value: "name-asc", label: "상품명순 A-Z" },
  { value: "name-desc", label: "상품명순 Z-A" },
  { value: "price-asc", label: "가격 저가순" },
  { value: "price-desc", label: "가격 고가순" },
  { value: "popular", label: "인기순" },
];

/* ------------------------------------------------------------------ */
/*  Filter Drawer                                                      */
/* ------------------------------------------------------------------ */

interface FilterState {
  diet: string;
  restrictions: string[];
  foodTypes: string[];
}

const DIET_OPTIONS = ["전체", "비건", "락토", "오보", "페스코"];
const RESTRICTION_OPTIONS = ["글루텐프리", "넛프리", "소이프리"];
const FOOD_TYPE_OPTIONS = ["한식", "양식", "일식", "중식", "디저트"];

function FilterDrawer({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (f: FilterState) => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer - 우측 슬라이드 패널 (헤더+탭바 아래) */}
      <div
        className="absolute right-0 bottom-0 flex w-[320px] max-w-full flex-col bg-white border-l border-black animate-slideInRight"
        style={{ top: "calc(var(--header-area-h, var(--header-h)) + 48px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black px-5 py-4">
          <span className="text-[16px]">Filter</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X size={20} strokeWidth={1} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* 식단 (Radio) */}
          <div className="border-b border-black py-5 px-5">
            <div className="flex flex-col gap-3">
              {DIET_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 cursor-pointer text-[14px]"
                  style={{ color: local.diet === opt ? "#000" : "#666" }}
                  onClick={() => setLocal((p) => ({ ...p, diet: opt }))}
                >
                  <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
                    {local.diet === opt && (
                      <span className="w-[10px] h-[10px] rounded-full bg-black" />
                    )}
                  </span>
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* 추가제한 (Checkbox) */}
          <div className="border-b border-black py-5 px-5">
            <div className="flex flex-col gap-3">
              {RESTRICTION_OPTIONS.map((opt) => {
                const checked = local.restrictions.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 cursor-pointer text-[14px]"
                    style={{ color: checked ? "#000" : "#666" }}
                    onClick={() =>
                      setLocal((p) => ({
                        ...p,
                        restrictions: checked
                          ? p.restrictions.filter((r) => r !== opt)
                          : [...p.restrictions, opt],
                      }))
                    }
                  >
                    <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
                      {checked && (
                        <span className="w-[10px] h-[10px] rounded-full bg-black" />
                      )}
                    </span>
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 음식종류 (Checkbox) */}
          <div className="py-5 px-5">
            <div className="flex flex-col gap-3">
              {FOOD_TYPE_OPTIONS.map((opt) => {
                const checked = local.foodTypes.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-2.5 cursor-pointer text-[14px]"
                    style={{ color: checked ? "#000" : "#666" }}
                    onClick={() =>
                      setLocal((p) => ({
                        ...p,
                        foodTypes: checked
                          ? p.foodTypes.filter((t) => t !== opt)
                          : [...p.foodTypes, opt],
                      }))
                    }
                  >
                    <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
                      {checked && (
                        <span className="w-[10px] h-[10px] rounded-full bg-black" />
                      )}
                    </span>
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-black px-5 py-4">
          <button
            className="flex-1 border border-black py-3 text-[14px] cursor-pointer"
            onClick={() =>
              setLocal({ diet: "전체", restrictions: [], foodTypes: [] })
            }
          >
            초기화
          </button>
          <button
            className="flex-1 bg-black text-white py-3 text-[14px] cursor-pointer border-none"
            onClick={() => {
              onApply(local);
              onClose();
            }}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ProductCard                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const rawImages = getProductThumbnailImages(product.id);
  const images = rawImages.length >= 3 ? rawImages.slice(0, 5) : rawImages.length > 0 ? [rawImages[0]] : [];
  const useSlider = images.length >= 3;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  useEffect(() => {
    setLoadedImages([]);
    setCurrentImageIndex(0);
  }, [product.id]);

  const goTo = (idx: number) => {
    const next = ((idx % images.length) + images.length) % images.length;
    setCurrentImageIndex(next);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!useSlider) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragStartX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!useSlider || dragStartX === null) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const delta = e.clientX - dragStartX;
    if (delta > 40) goTo(currentImageIndex - 1);
    else if (delta < -40) goTo(currentImageIndex + 1);
    setDragStartX(null);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (useSlider) {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const badgeVariant = product.soldOut
    ? "SOLD_OUT" as const
    : product.isNew
      ? "NEW" as const
      : null;

  const discountRate =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      className={`menu-card cursor-pointer ${product.soldOut ? "soldout" : ""}`}
      onClick={() => router.push(`/store/product/${product.id}`)}
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-square bg-[#F5F5F5] rounded-[4px] overflow-hidden">
        {images.length > 0 ? (
          <div
            className="relative w-full h-full overflow-hidden"
            style={{ touchAction: "pan-y" }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {useSlider ? (
              <div
                className="flex h-full"
                style={{
                  width: `${images.length * 100}%`,
                  transform: `translateX(-${currentImageIndex * (100 / images.length)}%)`,
                  transition: dragStartX === null ? "transform 0.3s ease-out" : "none",
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className="relative bg-[#F5F5F5]"
                    style={{ flex: "0 0 auto", width: `${100 / images.length}%`, height: "100%" }}
                    onClick={handleImageClick}
                  >
                    {Math.abs(idx - currentImageIndex) <= 1 && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onLoad={() => {
                          if (!loadedImages.includes(img)) setLoadedImages((prev) => [...prev, img]);
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={images[0]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onLoad={() => {
                  if (!loadedImages.includes(images[0])) setLoadedImages((prev) => [...prev, images[0]]);
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5] text-[13px] text-[var(--gray-lighter)]">
            IMG
          </div>
        )}

        {/* 뱃지 */}
        {badgeVariant && (
          <div className="absolute top-2 left-2 z-20">
            <Badge variant={badgeVariant} />
          </div>
        )}

        {/* 이미지 인디케이터 */}
        {useSlider && !product.soldOut && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                className="border-none cursor-pointer transition-all duration-300"
                style={{
                  width: idx === currentImageIndex ? "8px" : "4px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: idx === currentImageIndex ? "var(--white-pure)" : "rgba(255,255,255,0.5)",
                }}
                aria-label={`이미지 ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* SOLD OUT 오버레이 */}
        {product.soldOut && (
          <div className="absolute inset-0 bg-black/50 z-[15]" />
        )}
      </div>

      {/* 상품 정보 */}
      <div className="menu-card-content pt-4">
        <h3 className="menu-card-title text-[15px] leading-[1.3] mb-2" style={{ color: product.soldOut ? "var(--gray)" : "#000" }}>
          {product.name}
        </h3>
        {product.description && (
          <p className="text-[13px] text-[#6B6B6B] leading-[1.5] mb-3 overflow-hidden text-ellipsis whitespace-nowrap">
            {product.description}
          </p>
        )}
        <div>
          {product.originalPrice && product.originalPrice > product.price ? (
            <>
              <p className="text-[13px] text-[var(--gray-light)] line-through m-0 mb-1">
                {product.originalPrice.toLocaleString()}원
              </p>
              <div className="flex items-center gap-2">
                {discountRate && discountRate > 0 && (
                  <span className="text-[16px]" style={{ color: "#87b5e1" }}>{discountRate}%</span>
                )}
                <span className="text-[16px]" style={{ color: product.soldOut ? "var(--gray)" : "var(--black)" }}>
                  {product.price.toLocaleString()}원
                </span>
              </div>
            </>
          ) : (
            <span className="text-[16px]" style={{ color: product.soldOut ? "var(--gray)" : "var(--black)" }}>
              {product.price.toLocaleString()}원
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  StorePage                                                          */
/* ------------------------------------------------------------------ */

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [sort, setSort] = useState("default");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    diet: "전체",
    restrictions: [],
    foodTypes: [],
  });

  const filterCount =
    (filters.diet !== "전체" ? 1 : 0) +
    filters.restrictions.length +
    filters.foodTypes.length;

  /* Map tab id to category */
  const resolvedCategory = TAB_CATEGORY_MAP[activeTab] ?? activeTab;

  /* Filter */
  const filtered = activeTab === "전체"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === resolvedCategory);

  /* Sort */
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
      {/* Top Control Bar */}
      <TopControlBar
        tabs={TABS}
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

      {/* Product Grid */}
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

      {/* Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        filters={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </div>
  );
}
