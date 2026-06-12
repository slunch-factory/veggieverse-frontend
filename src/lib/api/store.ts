import { apiFetch } from "@/lib/api/client";
import { supabaseRenderUrl } from "@/lib/supabaseImage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

export type StoreSortParam = "nameAsc" | "nameDesc" | "priceAsc" | "popularDesc";

/** 카테고리 코드 → 한글 라벨 (백엔드 StoreCategory enum과 1:1). 미정의 코드는 그대로 표시 */
export const STORE_CATEGORY_LABELS: Record<string, string> = {
  MEAL_KIT: "밀키트",
  BAKERY: "베이커리",
  SAUCE_OIL: "소스/오일",
  GIFT: "선물세트",
  SIDE_DISH: "반찬",
  RICE_BALL: "주먹밥",
};
export function categoryLabel(code: string): string {
  return STORE_CATEGORY_LABELS[code] ?? code;
}

/** 정식 판매 중인 상품 slug. 이 목록에 없는 상품은 스토어에서 "준비중"으로 비활성화 표시한다. */
export const AVAILABLE_PRODUCT_SLUGS = new Set<string>([
  "kimchi-can",            // 비건 김치캔
  "kimchi-pancake",        // 비건 김치전 밀키트
  "peach-tart",            // 비건 복숭아 타르트
  "peach-tart-slice",      // 비건 복숭아타르트 조각
  "blueberry-tart",        // 비건 블루베리 타르트
  "blueberry-tart-slice",  // 비건 블루베리타르트 조각
  "peanut-butter-choco-bar", // 비건 피넛버터 초코바
]);

/** 해당 slug가 아직 판매 준비중(비활성화) 상태인지 여부 */
export function isComingSoon(slug: string): boolean {
  return !AVAILABLE_PRODUCT_SLUGS.has(slug);
}

const CDN_PATTERN = /^https?:\/\/cdn\.slunch\.com(\/.*)/;

/** 절대 URL로 정규화한 뒤, Supabase 스토리지 이미지면 표시 크기에 맞춰 다운스케일한다.
 *  width: 변환 가로 px(표시 크기의 2배 권장). Supabase 외 URL은 그대로 통과. */
function resolveImageUrl(imageUrl: string, width?: number): string {
  if (!imageUrl) return "";

  let resolved: string;
  if (process.env.NODE_ENV === "development") {
    const match = imageUrl.match(CDN_PATTERN);
    if (match) resolved = `${API_BASE}${match[1]}`;
    else resolved = imageUrl.startsWith("http") ? imageUrl : `${API_BASE}${imageUrl}`;
  } else {
    resolved = imageUrl.startsWith("http") ? imageUrl : `${API_BASE}${imageUrl}`;
  }

  return supabaseRenderUrl(resolved, { width });
}

/* ------------------------------------------------------------------ */
/*  Store Product (목록)                                               */
/* ------------------------------------------------------------------ */

export interface StoreProduct {
  productId: number;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  discountRate: number;
  discountedPrice: number;
  categories: string[];
  imageUrl: string;
  labels: {
    isNew: boolean;
    isBest: boolean;
  };
}

export async function getStoreProducts(sort: StoreSortParam = "nameAsc"): Promise<StoreProduct[]> {
  const url = `${API_BASE}/api/v1/veggieverse/store/products?sort=${sort}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[getStoreProducts] HTTP error:", res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    const list: StoreProduct[] = Array.isArray(data) ? data : [];
    // 목록 카드는 한 화면에 여러 장 — 표시폭 ~250px 기준 2배(500)로 다운스케일
    return list.map((p) => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl, 500) }));
  } catch (err) {
    console.error("[getStoreProducts] fetch failed:", err);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Store Product Detail (상세)                                        */
/* ------------------------------------------------------------------ */

export interface StoreProductImage {
  url: string;
  altText: string;
  sortOrder: number;
}

export interface StoreProductDetail {
  productId: number;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  discountRate: number;
  discountedPrice: number;
  categories: string[];
  labels: {
    isNew: boolean;
    isBest: boolean;
  };
  images: {
    main: StoreProductImage;
    details: StoreProductImage[];
    subs: StoreProductImage[];
  };
}

export async function getProductBySlug(slug: string): Promise<StoreProductDetail | null> {
  const url = `${API_BASE}/api/v1/veggieverse/store/products/${slug}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data: StoreProductDetail = await res.json();
    return resolveDetailImages(data);
  } catch (err) {
    console.error("[getProductBySlug] fetch failed:", err);
    return null;
  }
}

function resolveDetailImages(product: StoreProductDetail): StoreProductDetail {
  // 상세 페이지 메인/본문 이미지는 크게 표시 — 폭 ~900px로 다운스케일(비율 유지)
  const r = (img: StoreProductImage) => ({ ...img, url: resolveImageUrl(img.url, 900) });
  return {
    ...product,
    images: {
      main: r(product.images.main),
      details: product.images.details.map(r),
      subs: product.images.subs.map(r),
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Store Order History (상품 주문 내역)                                */
/* ------------------------------------------------------------------ */

export type StoreOrderStatus = "COMPLETED" | "PENDING" | "CANCELED" | string;

export interface StoreOrderHistoryProduct {
  name: string;
  quantity: number;
  imageUrl: string;
}

export interface StoreOrderHistoryItem {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  finalAmount: number;
  products: StoreOrderHistoryProduct[];
  status: StoreOrderStatus;
}

export interface StoreOrderHistoryResponse {
  content: StoreOrderHistoryItem[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export async function getStoreOrderHistory(
  options?: { page?: number; size?: number },
): Promise<StoreOrderHistoryResponse | null> {
  const params = new URLSearchParams();
  if (options?.page !== undefined) params.set("page", String(options.page));
  if (options?.size !== undefined) params.set("size", String(options.size));
  const query = params.toString();
  const path = `/api/v1/veggieverse/store/users/orderHistory${query ? `?${query}` : ""}`;
  const res = await apiFetch(path, { cache: "no-store", auth: "required" });
  if (!res.ok) {
    if (res.status !== 401) {
      console.error("[getStoreOrderHistory] HTTP error:", res.status, res.statusText);
    }
    return null;
  }
  const data: StoreOrderHistoryResponse = await res.json();
  // 이미지 URL CDN 변환 적용
  data.content = data.content.map((item) => ({
    ...item,
    products: item.products.map((p) => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl, 200) })),
  }));
  console.log(
    "%c[getStoreOrderHistory] ✅ 상품 주문 내역 조회 성공",
    "color: #4A7F52; font-weight: bold;",
    data,
  );
  return data;
}

export interface StoreOrderDetailProduct {
  productId: number;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  imageUrl: string;
  discountLabel: string;
}

export interface StoreOrderDetailDeliveryAddress {
  zipCode: string;
  street: string;
  detail: string;
}

export interface StoreOrderDetailDiscountInfo {
  discountAmount: number;
  couponCode: string;
  couponName: string;
  eventName: string;
}

export interface StoreOrderDetailResponse {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  originalAmount: number;
  finalAmount: number;
  shippingFee: number;
  deliveryAddress: StoreOrderDetailDeliveryAddress;
  discountInfo: StoreOrderDetailDiscountInfo;
  products: StoreOrderDetailProduct[];
  status: StoreOrderStatus;
}

export async function getStoreOrderDetail(
  orderId: number | string,
): Promise<StoreOrderDetailResponse | null> {
  const path = `/api/v1/veggieverse/store/users/orderHistory/${encodeURIComponent(String(orderId))}`;
  const res = await apiFetch(path, { cache: "no-store", auth: "required" });
  if (!res.ok) {
    if (res.status !== 401) {
      console.error("[getStoreOrderDetail] HTTP error:", res.status, res.statusText);
    }
    return null;
  }
  const data: StoreOrderDetailResponse = await res.json();
  data.products = data.products.map((p) => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl, 200) }));
  console.log(
    "%c[getStoreOrderDetail] ✅ 상품 주문 상세 조회 성공",
    "color: #4A7F52; font-weight: bold;",
    data,
  );
  return data;
}
