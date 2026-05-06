import type { ExcludeCategory, MenuCategory, MenuData, MenuNutrition } from "@/app/subscribe/_data/subscription";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

const NAME_TO_IMAGE: Record<string, string> = {
  "로스티드 비트 카르파초":    "/images/menus/01_roasted_beet_carpaccio.png",
  "렌틸 볼로네제":             "/images/menus/02_lentil_bolognese.png",
  "해바라기씨 페스토 파스타":  "/images/menus/03_sunflower_seed_pesto_pasta.png",
  "케일 월도프 샐러드":        "/images/menus/04_kale_waldorf_salad.png",
  "지중해식 퀴노아 샐러드":    "/images/menus/05_mediterranean_quinoa_salad.png",
  "아시안 피넛 누들":          "/images/menus/06_asian_peanut_noodles.png",
  "크리스피 두부 스테이크":    "/images/menus/07_crispy_tofu_steak.png",
  "구운 채소 라자냐":          "/images/menus/08_roasted_vegetable_lasagna.png",
  "관자 버터 소테":            "/images/menus/09_scallop_butter_saute.png",
  "미소 글레이즈드 삼치":      "/images/menus/10_miso_glazed_mackerel.png",
  "그릴드 옥토퍼스":           "/images/menus/11_grilled_octopus.png",
  "레몬 허브 농어 구이":       "/images/menus/12_lemon_herb_sea_bass.png",
  "해물 짬뽕 리조또":          "/images/menus/13_seafood_jjambong_risotto.png",
  "피쉬 타코":                 "/images/menus/14_fish_tacos.png",
  "고추장 두부 덮밥":          "/images/menus/15_gochujang_tofu_bowl.png",
  "지중해 후무스 랩":          "/images/menus/16_mediterranean_hummus_wrap.png",
  "마라 두부 볶음":            "/images/menus/17_mala_tofu_stir_fry.png",
  "버섯 잡채":                 "/images/menus/18_mushroom_japchae.png",
  "스파이시 콜리플라워 타코":  "/images/menus/19_spicy_cauliflower_tacos.png",
  "지중해 채소 파스타":        "/images/menus/20_mediterranean_vegetable_pasta.png",
  "칠리 두부 스크램블":        "/images/menus/21_chili_tofu_scramble.png",
  "아보카도 스시 볼":          "/images/menus/22_avocado_sushi_bowl.png",
  "케일 시저 샐러드":          "/images/menus/23_kale_caesar_salad.png",
  "흑임자 두부 샐러드":        "/images/menus/24_black_sesame_tofu_salad.png",
  "카레 두부 라이스":          "/images/menus/25_curry_tofu_rice.png",
  "퓨전 콩나물 비빔면":        "/images/menus/26_fusion_bean_sprout_noodles.png",
  "구운 채소 퀴노아 샐러드":   "/images/menus/27_roasted_vegetable_quinoa_salad.png",
  "반미 샌드위치 비건":        "/images/menus/28_vegan_banh_mi.png",
  "두부 포케 볼":              "/images/menus/29_tofu_poke_bowl.png",
  "지중해 채소 구이 랩":       "/images/menus/30_mediterranean_grilled_veg_wrap.png",
  "연어 아보카도 덮밥":        "/images/menus/31_salmon_avocado_bowl.png",
  "새우 아보카도 롤":          "/images/menus/32_shrimp_avocado_roll.png",
  "참치 샐러드 랩":            "/images/menus/33_tuna_salad_wrap.png",
};

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

function resolveImageUrl(imageUrl: string | undefined, name: string): string {
  if (imageUrl) {
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE}${imageUrl}`;
  }
  return NAME_TO_IMAGE[name] ?? "/images/menus/example.png";
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
    image: resolveImageUrl(p.imageUrl, p.name),
    description: "",
    excludable,
    ingredients: p.ingredients,
    nutrition: mapNutrition(p.nutritionInfo),
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
  userId: number,
  options?: { page?: number; size?: number },
): Promise<OrderHistoryResponse | null> {
  const params = new URLSearchParams({ userId: String(userId) });
  if (options?.page !== undefined) params.set("page", String(options.page));
  if (options?.size !== undefined) params.set("size", String(options.size));
  const url = `${API_BASE}/api/v1/veggieverse/subscription/users/orderHistory?${params.toString()}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[getOrderHistory] HTTP error:", res.status, res.statusText);
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
  userId: number,
): Promise<OrderDetailResponse | null> {
  const params = new URLSearchParams({ userId: String(userId) });
  const url = `${API_BASE}/api/v1/veggieverse/subscription/users/orderHistory/${encodeURIComponent(String(orderId))}?${params.toString()}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[getOrderDetail] HTTP error:", res.status, res.statusText);
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
