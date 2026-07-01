import type { MenuData, MenuIngredient, MenuInfoRow, MenuSellingPoint } from "./subscription";
import adminProducts from "./admin-product-details.json";

/**
 * 구독 상세 정적 미러.
 *
 * consumer products API(GET /subscription/products)는 id·name·price·imageUrl·spirit만 내려주고
 * tagline/description/소구포인트/영양/조리팁/식품정보 등 "상세 내용"은 내려주지 않는다.
 * 그 내용은 admin-frontend(data/subscribe-products.json)에서 작성·보관된다.
 *
 * 여기서는 admin JSON을 번들해 두고, 메뉴를 "이름"으로 매칭하여 상세 필드를 채운다.
 * (id는 consumer 60~90대 / admin 1~33으로 다르므로 이름이 안정적인 키 — 현재 33/33 일치)
 *
 * ⚠️ 정적 미러이므로 admin에서 내용을 수정하면 이 JSON을 다시 복사해야 최신화된다.
 *    근본 해법은 백엔드 products API가 상세 필드를 함께 내려주는 것.
 */

interface AdminSellingPoint {
  title: string;
  desc: string;
}

interface AdminProductDetail {
  name: string;
  diet?: string;
  tagline?: string;
  description?: string;
  ingredients?: string;
  selling_points?: AdminSellingPoint[];
  nutrients?: { kcal?: number; protein?: number; carbs?: number; fat?: number; sodium?: number };
  cooking_tip?: string;
  info_제품명?: string;
  info_식품유형?: string;
  info_품목보고번호?: string;
  info_내용량?: string;
  info_유통기한?: string;
  info_제조원?: string;
  info_소분원?: string;
  info_판매원?: string;
  info_원료명?: string;
  info_알레르기?: string;
  info_참고사항?: string;
}

const ADMIN_DETAILS = adminProducts as AdminProductDetail[];

/** 공백 제거 정규화 — 미세한 띄어쓰기 차이로 인한 매칭 실패 방지. */
function normalizeName(name: string): string {
  return name.replace(/\s+/g, "").trim();
}

const DETAIL_BY_NAME = new Map<string, AdminProductDetail>(
  ADMIN_DETAILS.map((p) => [normalizeName(p.name), p]),
);

/** "비트 300g, 발사믹 글레이즈 30ml, 올리브오일" → [{name, amountText, amountG}] */
function parseIngredients(raw?: string): MenuIngredient[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((item) => {
      const m = item.match(/^(.+?)\s+([\d.]+)\s*(g|kg|ml|l|리터|mg|oz|개)?$/);
      if (!m) return { name: item, amountG: 0 };
      const num = Number(m[2]);
      const unit = m[3] ?? "";
      return {
        name: m[1].trim(),
        amountG: Number.isFinite(num) ? num : 0,
        amountText: `${m[2]}${unit}`,
      };
    });
}

const INFO_ROWS: { key: keyof AdminProductDetail; label: string }[] = [
  { key: "info_제품명", label: "제품명" },
  { key: "info_식품유형", label: "식품유형" },
  { key: "info_품목보고번호", label: "품목보고번호" },
  { key: "info_내용량", label: "내용량" },
  { key: "info_유통기한", label: "유통기한" },
  { key: "info_제조원", label: "제조원" },
  { key: "info_소분원", label: "소분원" },
  { key: "info_판매원", label: "판매원" },
  { key: "info_원료명", label: "원료명" },
  { key: "info_알레르기", label: "알레르기" },
  { key: "info_참고사항", label: "참고사항" },
];

function buildProductInfo(d: AdminProductDetail): MenuInfoRow[] {
  return INFO_ROWS.map(({ key, label }) => ({ label, value: (d[key] as string) ?? "" })).filter(
    (row) => row.value.trim() !== "",
  );
}

/**
 * 메뉴에 admin 상세 내용을 병합. 이미지·가격·카테고리·spirit 등 consumer 권위 필드는 유지하고,
 * 텍스트 상세(태그라인/설명/소구포인트/영양/원재료/조리팁/식품정보/식단)만 admin 값으로 채운다.
 */
export function enrichMenuWithDetail(menu: MenuData): MenuData {
  const d = DETAIL_BY_NAME.get(normalizeName(menu.name));
  if (!d) return menu;

  const sellingPoints: MenuSellingPoint[] | undefined = d.selling_points?.length
    ? d.selling_points.map((s) => ({ title: s.title, desc: s.desc }))
    : menu.sellingPoints;

  const ingredients = parseIngredients(d.ingredients);
  const productInfo = buildProductInfo(d);

  return {
    ...menu,
    diet: d.diet ?? menu.diet,
    tagline: d.tagline ?? menu.tagline,
    description: d.description ?? menu.description,
    sellingPoints,
    ingredients: ingredients.length ? ingredients : menu.ingredients,
    nutrition: d.nutrients ?? menu.nutrition,
    cookingTip: d.cooking_tip ?? menu.cookingTip,
    productInfo: productInfo.length ? productInfo : menu.productInfo,
  };
}

export function enrichMenusWithDetail(menus: MenuData[]): MenuData[] {
  return menus.map(enrichMenuWithDetail);
}
