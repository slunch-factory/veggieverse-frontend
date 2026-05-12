import { apiFetch } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

export type StoreSortParam = "nameAsc" | "nameDesc" | "priceAsc" | "popularDesc";

const CDN_PATTERN = /^https?:\/\/cdn\.slunch\.com(\/.*)/;

function resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return "";

  if (process.env.NODE_ENV === "development") {
    const match = imageUrl.match(CDN_PATTERN);
    if (match) return `${API_BASE}${match[1]}`;
  }

  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE}${imageUrl}`;
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
    return list.map((p) => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl) }));
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
  const r = (img: StoreProductImage) => ({ ...img, url: resolveImageUrl(img.url) });
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
    products: item.products.map((p) => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl) })),
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
  data.products = data.products.map((p) => ({ ...p, imageUrl: resolveImageUrl(p.imageUrl) }));
  console.log(
    "%c[getStoreOrderDetail] ✅ 상품 주문 상세 조회 성공",
    "color: #4A7F52; font-weight: bold;",
    data,
  );
  return data;
}
