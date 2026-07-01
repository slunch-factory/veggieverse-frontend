import type { ExcludeCategory, MenuCategory, MenuData, MenuNutrition } from "@/app/subscribe/_data/subscription";
import { apiFetch } from "@/lib/api/client";
import { type OrderStatusCode, isAwaitingPayment } from "@/lib/api/order-status";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

export interface SubscriptionProductImage {
  url: string;
  altText?: string;
  sortOrder?: number;
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  ingredients?: { name: string; amountG: number }[];
  nutritionInfo?: Record<string, unknown>;
  /** 단일 대표 이미지 (현행 백엔드 응답) */
  imageUrl?: string;
  /** 이미지 배열 (백엔드가 여러 장 내려줄 때 대비 — 있으면 imageUrl 보다 우선) */
  images?: SubscriptionProductImage[];
  spirit: {
    healthGoals: string[];
    allergens: string[];
    /** 실제 API 응답은 isSpicy, Swagger 스펙은 spicy — 두 필드 모두 지원 */
    isSpicy?: boolean;
    spicy?: boolean;
  };
  // ── 어드민 카드 전체 섹션 대비 (백엔드 확장 시 자동 렌더) — 필드명은 DTO 확정 시 조정 ──
  /** 상세 설명 */
  description?: string;
  /** 한 줄 소개 */
  tagline?: string;
  /** 식단 타입 (비건 등) */
  dietaryType?: string;
  /** 소구 포인트 */
  sellingPoints?: { title: string; desc: string }[];
  /** 조리 팁 */
  cookingTip?: string;
  /** 식품 정보 라벨 표 */
  productInfo?: { label: string; value: string }[];
}

export interface PlanItem {
  date: string;
  lunch: number;
  dinner: number;
}

export interface CustomPlanResponse {
  planId: string;
  items: PlanItem[];
}

const ALLERGEN_MAP: Record<string, ExcludeCategory> = {
  tree_nuts: "nuts",
  peanuts:   "nuts",
  dairy:     "dairy",
  shellfish: "shellfish",
  fish:      "fish",
  chicken:   "chicken",
  egg:       "egg",
  gluten:    "gluten",
};

function resolveImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
}

/**
 * 제품의 이미지들을 정규화된 URL 배열로 변환한다.
 * `images` 배열이 있으면 sortOrder 순으로 사용하고, 없으면 단일 `imageUrl`로 폴백한다.
 * → 백엔드가 단일/배열 어느 쪽을 주든 소비자 컴포넌트는 항상 배열을 받는다.
 */
function resolveImageList(p: ProductItem): string[] {
  if (p.images?.length) {
    return [...p.images]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((img) => resolveImageUrl(img.url))
      .filter(Boolean);
  }
  const single = resolveImageUrl(p.imageUrl);
  return single ? [single] : [];
}

function mapNutrition(raw: Record<string, unknown> | undefined): MenuNutrition | undefined {
  if (!raw) return undefined;
  const n = raw as Record<string, number>;
  const result: MenuNutrition = {
    kcal: n.calories ?? n.kcal ?? n.calorie,
    protein: n.protein,
    carbs: n.carbohydrate ?? n.carbs ?? n.carb,
    fat: n.fat,
    sodium: n.sodium ?? n.natrium,
  };
  const hasAny = Object.values(result).some((v) => v != null);
  return hasAny ? result : undefined;
}

export function mapToMenuData(p: ProductItem): MenuData {
  const excludable: ExcludeCategory[] = [
    ...new Set(
      p.spirit.allergens
        .map((a) => ALLERGEN_MAP[a])
        .filter((a): a is ExcludeCategory => Boolean(a)),
    ),
  ];
  // 실제 API는 isSpicy, Swagger 스펙은 spicy — 둘 다 체크
  if (p.spirit.isSpicy ?? p.spirit.spicy) excludable.push("spicy");

  const category: MenuCategory = p.spirit.healthGoals.includes("high_protein")
    ? "protein"
    : "slim";

  const images = resolveImageList(p);

  return {
    id: String(p.id),
    name: p.name,
    category,
    cost: p.price,
    price: p.price,
    image: images[0] ?? "",
    images,
    description: p.description ?? "",
    excludable,
    ingredients: p.ingredients,
    nutrition: mapNutrition(p.nutritionInfo),
    spirit: {
      healthGoals: p.spirit.healthGoals ?? [],
      allergens: p.spirit.allergens ?? [],
      spicy: Boolean(p.spirit.isSpicy ?? p.spirit.spicy),
    },
    // 어드민 카드 전체 섹션 — 백엔드가 내려주면 상세 모달에 자동 렌더
    tagline: p.tagline,
    diet: p.dietaryType,
    sellingPoints: p.sellingPoints,
    cookingTip: p.cookingTip,
    productInfo: p.productInfo,
  };
}

export interface OrderHistoryProduct {
  name: string;
  quantity: number;
}

export interface OrderHistoryItem {
  orderId: number;
  orderNumber: string;
  startDate: string;
  endDate: string;
  products: OrderHistoryProduct[];
  deliveryCycle: string;
  orderDate: string;
  finalAmount: number;
  /** 결제 상태 (PENDING/PAID/...). 백엔드가 내려주며 결제대기/완료 구분에 사용. */
  status: OrderStatusCode;
}

export interface OrderHistoryResponse {
  content: OrderHistoryItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function getOrderHistory(
  options?: { page?: number; size?: number },
): Promise<OrderHistoryResponse | null> {
  // 백엔드는 JWT `sub` 클레임으로 사용자를 식별 — userId 파라미터는 더 이상 보내지 않음
  const params = new URLSearchParams();
  if (options?.page !== undefined) params.set("page", String(options.page));
  if (options?.size !== undefined) params.set("size", String(options.size));
  const query = params.toString();
  const path = `/api/v1/veggieverse/subscription/users/orderHistory${query ? `?${query}` : ""}`;
  try {
    const res = await apiFetch(path, { cache: "no-store", auth: "required" });
    if (!res.ok) {
      if (res.status !== 401) {
        console.error("[getOrderHistory] HTTP error:", res.status, res.statusText);
      }
      return null;
    }
    const data: OrderHistoryResponse = await res.json();
    // PENDING(결제대기)은 결제 미완료 주문 — 1차 런칭에서는 노출하지 않는다.
    // 재결제 플로우 없이 DB TTL로 정리되며, 결제완료된 주문만 마이페이지에 표시한다.
    data.content = data.content.filter((item) => !isAwaitingPayment(item.status));
    console.log(
      "%c[getOrderHistory] ✅ 주문 내역 조회 성공",
      "color: #4A7F52; font-weight: bold;",
      data,
    );
    return data;
  } catch (err) {
    console.error("[getOrderHistory] fetch failed:", err);
    return null;
  }
}

export interface OrderDetailDeliveryAddress {
  zipCode: string;
  street: string;
  detail: string;
}

export interface OrderDetailProduct {
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface OrderDetailResponse {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  startDate: string;
  endDate: string;
  deliveryCycle: string;
  deliveryAddress: OrderDetailDeliveryAddress;
  originalAmount: number;
  shippingFee: number;
  discountInfo: {
    discountAmount: number | null;
    couponCode: string | null;
    couponName: string | null;
  };
  finalAmount: number;
  products: OrderDetailProduct[];
  /** 결제 상태 (PENDING/PAID/...). */
  status: OrderStatusCode;
}

export async function getOrderDetail(
  orderId: number | string,
): Promise<OrderDetailResponse | null> {
  // 백엔드는 JWT `sub` 클레임으로 사용자를 식별 — userId 파라미터는 더 이상 보내지 않음
  const path = `/api/v1/veggieverse/subscription/users/orderHistory/${encodeURIComponent(String(orderId))}`;
  try {
    const res = await apiFetch(path, { cache: "no-store", auth: "required" });
    if (!res.ok) {
      if (res.status !== 401) {
        console.error("[getOrderDetail] HTTP error:", res.status, res.statusText);
      }
      return null;
    }
    const data: OrderDetailResponse = await res.json();
    console.log(
      "%c[getOrderDetail] ✅ 주문 상세 조회 성공",
      "color: #4A7F52; font-weight: bold;",
      data,
    );
    return data;
  } catch (err) {
    console.error("[getOrderDetail] fetch failed:", err);
    return null;
  }
}

export async function postPlan(items: PlanItem[]): Promise<CustomPlanResponse | null> {
  // 브라우저 호출 — 프록시(apiFetch) 경유. 직접 fetch는 HTTPS↔HTTP 혼합콘텐츠/CORS로 차단됨.
  try {
    const res = await apiFetch("/api/v1/veggieverse/subscription/plan", {
      method: "POST",
      body: { items },
      auth: "auto",
    });
    if (!res.ok) {
      console.error("[postPlan] HTTP error:", res.status, res.statusText);
      return null;
    }
    return await res.json() as CustomPlanResponse;
  } catch (err) {
    console.error("[postPlan] fetch failed:", err);
    return null;
  }
}

export async function getCustomedPlan(planId: string): Promise<CustomPlanResponse | null> {
  const path = `/api/v1/veggieverse/subscription/customedPlan?planId=${encodeURIComponent(planId)}`;
  try {
    const res = await apiFetch(path, { auth: "auto" });
    if (!res.ok) {
      console.error("[getCustomedPlan] HTTP error:", res.status, res.statusText);
      return null;
    }
    const data: CustomPlanResponse = await res.json();
    console.log(
      "%c[getCustomedPlan] ✅ 확정 플랜 조회 성공",
      "color: #4A7F52; font-weight: bold;",
      data,
    );
    return data;
  } catch (err) {
    console.error("[getCustomedPlan] fetch failed:", err);
    return null;
  }
}

export async function getMenus(): Promise<MenuData[]> {
  const url = `${API_BASE}/api/v1/veggieverse/subscription/products`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Accept-Language": "ko-KR",
      },
    });
    if (!res.ok) {
      console.error("[getMenus] HTTP error:", res.status, res.statusText);
      return [];
    }
    const data: ProductItem[] = await res.json();
    const list = Array.isArray(data) ? data : [];
    const menus = list.map(mapToMenuData);
    // admin 상세 내용(태그라인/설명/소구포인트/영양/원재료/조리팁/식품정보)을 이름으로 병합.
    // 동적 import로 admin JSON을 서버 청크에만 두어 클라이언트 번들을 가볍게 유지.
    const { enrichMenusWithDetail } = await import("@/app/subscribe/_data/productDetails");
    return enrichMenusWithDetail(menus);
  } catch (err) {
    console.error("[getMenus] fetch failed:", err);
    return [];
  }
}

export async function getSlotRecommend(): Promise<MenuData[]> {
  // 브라우저 호출(DayRow) — 프록시 경유.
  try {
    const res = await apiFetch("/api/v1/veggieverse/subscription/products", {
      auth: "auto",
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data: ProductItem[] = await res.json();
    const list = Array.isArray(data) ? data : [];
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(mapToMenuData);
  } catch {
    return [];
  }
}

/** 구독 재료 마스터(공개) — 메인 떠다니는 재료 이미지 등에 사용. */
export interface SubscriptionIngredient {
  id: number;
  code: string;
  nameKo: string;
  nameEn: string;
  imageUrl: string;
}

/**
 * 선택 가능한 활성 구독 재료 목록 조회 (공개, code 오름차순).
 * 공개 엔드포인트이므로 auth "none"으로 프록시 경유(브라우저 mixed-content 회피).
 * 실패 시 빈 배열 — 소비자(메인)는 로컬 폴백을 갖는다.
 */
export async function getSubscriptionIngredients(): Promise<SubscriptionIngredient[]> {
  try {
    const res = await apiFetch("/api/v1/veggieverse/subscription/ingredients", {
      auth: "none",
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return (data as SubscriptionIngredient[]).map((i) => ({
      ...i,
      imageUrl: resolveImageUrl(i.imageUrl),
    }));
  } catch (err) {
    console.error("[getSubscriptionIngredients] fetch failed:", err);
    return [];
  }
}
