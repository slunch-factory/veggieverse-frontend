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
