import type { ExcludeCategory, MenuCategory, MenuData, MenuNutrition } from "@/app/subscribe/_data/subscription";
import { apiFetch } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  ingredients?: { name: string; amountG: number }[];
  nutritionInfo?: Record<string, unknown>;
  imageUrl?: string;
  spirit: {
    healthGoals: string[];
    allergens: string[];
    /** 실제 API 응답은 isSpicy, Swagger 스펙은 spicy — 두 필드 모두 지원 */
    isSpicy?: boolean;
    spicy?: boolean;
  };
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

function mapNutrition(raw: Record<string, unknown> | undefined): MenuNutrition | undefined {
  if (!raw) return undefined;
  const n = raw as Record<string, number>;
  const result: MenuNutrition = {
    kcal: n.calories ?? n.kcal ?? n.calorie,
    protein: n.protein,
    carbs: n.carbohydrate ?? n.carbs ?? n.carb,
    fat: n.fat,
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

  return {
    id: String(p.id),
    name: p.name,
    category,
    cost: p.price,
    price: p.price,
    image: resolveImageUrl(p.imageUrl),
    description: "",
    excludable,
    ingredients: p.ingredients,
    nutrition: mapNutrition(p.nutritionInfo),
    spirit: {
      healthGoals: p.spirit.healthGoals ?? [],
      allergens: p.spirit.allergens ?? [],
      spicy: Boolean(p.spirit.isSpicy ?? p.spirit.spicy),
    },
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
  const url = `${API_BASE}/api/v1/veggieverse/subscription/plan`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ items }),
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
  const url = `${API_BASE}/api/v1/veggieverse/subscription/customedPlan?planId=${encodeURIComponent(planId)}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
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
    return list.map(mapToMenuData);
  } catch (err) {
    console.error("[getMenus] fetch failed:", err);
    return [];
  }
}

export async function getSlotRecommend(): Promise<MenuData[]> {
  const url = `${API_BASE}/api/v1/veggieverse/subscription/products`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
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
