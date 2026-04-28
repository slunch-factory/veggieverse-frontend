export type DurationType = 1 | 2;
export type ExcludeCategory = "dairy" | "shellfish" | "fish" | "nuts" | "chicken" | "egg" | "gluten" | "spicy";
export type MenuCategory = "slim" | "protein";
export type DietType = "vegan" | "pesco" | "pollo";
export type NutritionGoal = "plant-based" | "low-carb" | "low-calorie" | "high-protein" | "low-sodium";
export type AllergyFilter = "nuts" | "peanut" | "dairy" | "none";
export type SpicyPreference = "include" | "exclude";
export type PurchaseType = "once" | "subscription";
export type DeliveryCycle = "1month" | "2month";
export type PackComposition = "14day" | "14day+random7" | "14day+random14" | "14day+random21";

export interface MenuIngredient {
  name: string;
  amountG: number;
}

export interface MenuNutrition {
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MenuData {
  id: string;
  name: string;
  category: MenuCategory;
  cost: number;
  price: number;
  image: string;
  description: string;
  excludable: ExcludeCategory[];
  ingredients?: MenuIngredient[];
  nutrition?: MenuNutrition;
}

export interface DisplayMenuData extends MenuData {
  displayName: string;
  isVariation: boolean;
  originalName?: string;
  badge?: string;
}

export interface DayPlan {
  date: Date;
  dateKey: string;
  dateLabel: { dayName: string; dayNum: number; isHoliday: boolean };
  slots: { slotId: string; index: 0 | 1; mealTime: "점심" | "저녁" }[];
}

export interface PlanType {
  id: MenuCategory;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
  accent: string;
  filterTags: string[];
}

export const DIET_TYPE_OPTIONS: { value: DietType; label: string }[] = [
  { value: "vegan", label: "비건" },
  { value: "pesco", label: "페스코" },
  { value: "pollo", label: "폴로" },
];

export const NUTRITION_GOAL_OPTIONS: { value: NutritionGoal; label: string }[] = [
  { value: "plant-based", label: "플랜트 베이스드" },
  { value: "low-carb", label: "저탄수화물" },
  { value: "low-calorie", label: "저칼로리" },
  { value: "high-protein", label: "고단백" },
  { value: "low-sodium", label: "저나트륨" },
];

export const ALLERGY_FILTER_OPTIONS: { value: AllergyFilter; label: string }[] = [
  { value: "nuts", label: "견과류" },
  { value: "peanut", label: "땅콩" },
  { value: "dairy", label: "유제품" },
  { value: "none", label: "해당 없음" },
];

export const SPICY_PREFERENCE_OPTIONS: { value: SpicyPreference; label: string }[] = [
  { value: "include", label: "포함" },
  { value: "exclude", label: "제외" },
];

export const SUBSCRIPTION_DISCOUNT_RATE = 0.1;

export const DELIVERY_CYCLE_OPTIONS: { value: DeliveryCycle; label: string }[] = [
  { value: "1month", label: "1달마다 배송" },
  { value: "2month", label: "2달마다 배송" },
];

export const PACK_COMPOSITION_OPTIONS: { value: PackComposition; label: string }[] = [
  { value: "14day", label: "슬런치 (식단구성) 14일팩" },
  { value: "14day+random7", label: "슬런치 (식단구성) 14일팩 + 이후 랜덤 7일팩" },
  { value: "14day+random14", label: "슬런치 (식단구성) 14일팩 + 이후 랜덤 14일팩" },
  { value: "14day+random21", label: "슬런치 (식단구성) 14일팩 + 이후 랜덤 21일팩" },
];

export const EXCLUDE_CATEGORIES: Record<ExcludeCategory, { label: string; mark: string; keywords: string[] }> = {
  dairy: { label: "유제품", mark: "유", keywords: ["치즈", "크림", "버터", "우유", "파르미지아노"] },
  shellfish: { label: "갑각류", mark: "갑", keywords: ["새우", "관자", "랍스터", "해물"] },
  fish: { label: "생선", mark: "어", keywords: ["연어", "참치", "도미", "고등어"] },
  nuts: { label: "견과류", mark: "견", keywords: ["땅콩", "아몬드", "호두", "캐슈넛"] },
  chicken: { label: "닭고기", mark: "닭", keywords: ["닭", "치킨", "닭가슴살"] },
  egg: { label: "계란", mark: "난", keywords: ["달걀", "계란", "오야코"] },
  gluten: { label: "글루텐", mark: "밀", keywords: ["파스타", "우동", "뇨끼", "또띠아"] },
  spicy: { label: "매운맛", mark: "매", keywords: ["고추장", "청양고추", "스리라차"] },
};

const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const img = (file: string) => `${_BASE}/images/menus/${file}`;

export const PLAN_TYPES: PlanType[] = [
  {
    id: "slim",
    name: "슬림 밸런스",
    subtitle: "SLIM BALANCE",
    description:
      "저칼로리·저탄수 중심의 가벼운 식단. 샐러드·랩·채소 볼로 포만감은 유지하면서 체중 관리.",
    image: img("01_roasted_beet_carpaccio.png"),
    color: "#EEF6EF",
    accent: "#4A7F52",
    filterTags: ["저칼로리", "저탄수"],
  },
  {
    id: "protein",
    name: "헬시 프로틴",
    subtitle: "HEALTHY PROTEIN",
    description:
      "두부·해산물·견과류 등 고단백 재료 중심. 근육 유지와 든든한 포만감이 필요한 날에.",
    image: img("02_lentil_bolognese.png"),
    color: "#FBF1E8",
    accent: "#8B5A2B",
    filterTags: ["고단백"],
  },
];

/* 33개 메뉴 (슬림 13 + 프로틴 20) */
export const MENUS: Record<string, MenuData> = {
  /* ── 슬림 밸런스 (13) ── */
  S01: { id: "S01", name: "로스티드 비트 카르파초", category: "slim", cost: 3800, price: 7500, image: img("01_roasted_beet_carpaccio.png"), description: "구운 비트의 선명한 맛", excludable: ["nuts"] },
  S02: { id: "S02", name: "케일 월도프 샐러드", category: "slim", cost: 3400, price: 7200, image: img("04_kale_waldorf_salad.png"), description: "아삭한 케일과 사과의 월도프", excludable: ["nuts"] },
  S03: { id: "S03", name: "지중해식 퀴노아 샐러드", category: "slim", cost: 3200, price: 7500, image: img("05_mediterranean_quinoa_salad.png"), description: "올리브와 허브의 지중해 샐러드", excludable: [] },
  S04: { id: "S04", name: "지중해 후무스 랩", category: "slim", cost: 3000, price: 6900, image: img("16_mediterranean_hummus_wrap.png"), description: "후무스와 신선한 채소의 랩", excludable: ["gluten"] },
  S05: { id: "S05", name: "버섯 잡채", category: "slim", cost: 3100, price: 7100, image: img("18_mushroom_japchae.png"), description: "담백한 버섯 잡채", excludable: [] },
  S06: { id: "S06", name: "스파이시 콜리플라워 타코", category: "slim", cost: 3200, price: 7300, image: img("19_spicy_cauliflower_tacos.png"), description: "훈제 파프리카 콜리플라워", excludable: ["gluten", "spicy"] },
  S07: { id: "S07", name: "지중해 채소 파스타", category: "slim", cost: 3200, price: 7500, image: img("20_mediterranean_vegetable_pasta.png"), description: "가지·주키니 올리브오일 파스타", excludable: ["gluten"] },
  S08: { id: "S08", name: "칠리 두부 스크램블", category: "slim", cost: 3000, price: 6900, image: img("21_chili_tofu_scramble.png"), description: "가벼운 두부 스크램블", excludable: [] },
  S09: { id: "S09", name: "아보카도 스시 볼", category: "slim", cost: 3300, price: 7400, image: img("22_avocado_sushi_bowl.png"), description: "아보카도와 에다마메 볼", excludable: [] },
  S10: { id: "S10", name: "케일 시저 샐러드", category: "slim", cost: 3000, price: 6900, image: img("23_kale_caesar_salad.png"), description: "비건 시저 드레싱의 케일", excludable: ["gluten"] },
  S11: { id: "S11", name: "퓨전 콩나물 비빔면", category: "slim", cost: 3100, price: 7000, image: img("26_fusion_bean_sprout_noodles.png"), description: "매콤 콩나물 비빔면", excludable: ["gluten", "spicy"] },
  S12: { id: "S12", name: "구운 채소 퀴노아 샐러드", category: "slim", cost: 3400, price: 7400, image: img("27_roasted_vegetable_quinoa_salad.png"), description: "단호박과 아루굴라 퀴노아", excludable: [] },
  S13: { id: "S13", name: "지중해 채소 구이 랩", category: "slim", cost: 3000, price: 6900, image: img("30_mediterranean_grilled_veg_wrap.png"), description: "가지·주키니 구이 랩", excludable: ["gluten"] },

  /* ── 헬시 프로틴 (20) ── */
  P01: { id: "P01", name: "렌틸 볼로네제", category: "protein", cost: 2500, price: 7900, image: img("02_lentil_bolognese.png"), description: "고단백 렌틸 토마토 파스타", excludable: ["gluten"] },
  P02: { id: "P02", name: "크리스피 두부 스테이크", category: "protein", cost: 3000, price: 6900, image: img("07_crispy_tofu_steak.png"), description: "바삭한 두부 스테이크", excludable: [] },
  P03: { id: "P03", name: "해바라기씨 페스토 파스타", category: "protein", cost: 3200, price: 7900, image: img("03_sunflower_seed_pesto_pasta.png"), description: "해바라기씨 페스토 파스타", excludable: ["nuts", "gluten"] },
  P04: { id: "P04", name: "아시안 피넛 누들", category: "protein", cost: 3100, price: 7800, image: img("06_asian_peanut_noodles.png"), description: "땅콩 소스 쌀국수", excludable: ["nuts", "spicy"] },
  P05: { id: "P05", name: "구운 채소 라자냐", category: "protein", cost: 3500, price: 8500, image: img("08_roasted_vegetable_lasagna.png"), description: "채소와 캐슈넛 리코타 라자냐", excludable: ["nuts", "gluten"] },
  P06: { id: "P06", name: "관자 버터 소테", category: "protein", cost: 8500, price: 12000, image: img("09_scallop_butter_saute.png"), description: "버터에 구운 홋카이도 관자", excludable: ["shellfish", "dairy"] },
  P07: { id: "P07", name: "미소 글레이즈드 삼치", category: "protein", cost: 6200, price: 9800, image: img("10_miso_glazed_mackerel.png"), description: "미소 글레이즈 삼치", excludable: ["fish"] },
  P08: { id: "P08", name: "그릴드 옥토퍼스", category: "protein", cost: 7500, price: 11500, image: img("11_grilled_octopus.png"), description: "구운 문어 다리", excludable: ["shellfish"] },
  P09: { id: "P09", name: "레몬 허브 농어 구이", category: "protein", cost: 6500, price: 10200, image: img("12_lemon_herb_sea_bass.png"), description: "레몬 허브 농어", excludable: ["fish", "dairy"] },
  P10: { id: "P10", name: "해물 짬뽕 리조또", category: "protein", cost: 5500, price: 9900, image: img("13_seafood_jjambong_risotto.png"), description: "고춧가루 해물 리조또", excludable: ["shellfish", "spicy"] },
  P11: { id: "P11", name: "피쉬 타코", category: "protein", cost: 5000, price: 9500, image: img("14_fish_tacos.png"), description: "흰살 생선 타코", excludable: ["fish", "gluten", "egg"] },
  P12: { id: "P12", name: "고추장 두부 덮밥", category: "protein", cost: 2800, price: 6900, image: img("15_gochujang_tofu_bowl.png"), description: "매콤 고추장 두부", excludable: ["spicy"] },
  P13: { id: "P13", name: "마라 두부 볶음", category: "protein", cost: 3000, price: 7100, image: img("17_mala_tofu_stir_fry.png"), description: "마라 소스 두부 볶음", excludable: ["nuts", "spicy"] },
  P14: { id: "P14", name: "흑임자 두부 샐러드", category: "protein", cost: 2900, price: 7000, image: img("24_black_sesame_tofu_salad.png"), description: "흑임자 드레싱의 두부", excludable: [] },
  P15: { id: "P15", name: "카레 두부 라이스", category: "protein", cost: 3100, price: 7200, image: img("25_curry_tofu_rice.png"), description: "코코넛 카레 두부", excludable: ["spicy"] },
  P16: { id: "P16", name: "반미 샌드위치 비건", category: "protein", cost: 3000, price: 6900, image: img("28_vegan_banh_mi.png"), description: "두부 반미 샌드위치", excludable: ["gluten", "spicy"] },
  P17: { id: "P17", name: "두부 포케 볼", category: "protein", cost: 3200, price: 7300, image: img("29_tofu_poke_bowl.png"), description: "두부 포케 볼", excludable: ["spicy"] },
  P18: { id: "P18", name: "연어 아보카도 덮밥", category: "protein", cost: 4500, price: 8900, image: img("31_salmon_avocado_bowl.png"), description: "연어와 아보카도 덮밥", excludable: ["fish"] },
  P19: { id: "P19", name: "새우 아보카도 롤", category: "protein", cost: 4800, price: 9200, image: img("32_shrimp_avocado_roll.png"), description: "새우 아보카도 롤", excludable: ["shellfish", "gluten", "egg"] },
  P20: { id: "P20", name: "참치 샐러드 랩", category: "protein", cost: 3400, price: 7900, image: img("33_tuna_salad_wrap.png"), description: "참치 마요 랩", excludable: ["fish", "gluten", "egg"] },
};

/** 구 프로젝트와 동일하게 현재는 변형 규칙 없음 */
export const MENU_VARIATIONS: Record<string, Partial<Record<ExcludeCategory, { name: string; badge: string }>>> = {};

export function getDisplayMenu(menuId: string, excludeCategories: ExcludeCategory[]): DisplayMenuData {
  const menu = MENUS[menuId];
  if (!menu) {
    return {
      id: menuId, name: "", category: "slim", cost: 0, price: 0, image: "",
      description: "", excludable: [], displayName: "", isVariation: false,
    };
  }
  const variations = MENU_VARIATIONS[menuId];
  if (!variations) return { ...menu, displayName: menu.name, isVariation: false };
  for (const category of excludeCategories) {
    if (variations[category]) {
      return {
        ...menu,
        displayName: variations[category]!.name,
        badge: variations[category]!.badge,
        isVariation: true,
        originalName: menu.name,
      };
    }
  }
  return { ...menu, displayName: menu.name, isVariation: false };
}

export const CATEGORY_MAP: Record<string, MenuCategory> = {
  slim: "slim",
  protein: "protein",
};

export const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatDateLabel(date: Date) {
  const names = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dow = date.getDay();
  return { dayName: names[dow], dayNum: date.getDate(), isHoliday: dow === 0 };
}

export function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

/** 월~수 결제: 다음날 배송 가능 / 목~일: 다음 주 화요일부터 */
export function getEarliestStartDate(today: Date): Date {
  const dow = today.getDay();
  const result = new Date(today);
  result.setHours(0, 0, 0, 0);
  if (dow >= 1 && dow <= 3) {
    result.setDate(result.getDate() + 1);
    return result;
  }
  const delta = dow === 4 ? 5 : dow === 5 ? 4 : dow === 6 ? 3 : 2;
  result.setDate(result.getDate() + delta);
  return result;
}

export function isFlexibleToday(today: Date): boolean {
  const dow = today.getDay();
  return dow >= 1 && dow <= 3;
}

export function getHolidayMeta(d: Date): { labelKo?: string; noteEn?: string } {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 1 && day === 1) return { labelKo: "신정", noteEn: "HAPPY NEW YEAR!" };
  if (m === 3 && day === 1) return { labelKo: "삼일절", noteEn: "MARCH 1ST" };
  if (m === 5 && day === 5) return { labelKo: "어린이날", noteEn: "CHILDREN'S DAY" };
  if (m === 8 && day === 15) return { labelKo: "광복절", noteEn: "LIBERATION DAY" };
  if (m === 10 && day === 3) return { labelKo: "개천절", noteEn: "NATIONAL FOUNDATION DAY" };
  if (m === 10 && day === 9) return { labelKo: "한글날", noteEn: "HANGUL DAY" };
  if (m === 12 && day === 25) return { labelKo: "성탄절", noteEn: "MERRY CHRISTMAS!" };
  return {};
}

export function generateWeekDays(weekStart: Date): DayPlan[] {
  const mealTimes: ("점심" | "저녁")[] = ["점심", "저녁"];
  const days: DayPlan[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    days.push({
      date,
      dateKey,
      dateLabel: formatDateLabel(date),
      slots: mealTimes.map((mealTime, idx) => ({
        slotId: `${dateKey}-${idx}`,
        index: idx as 0 | 1,
        mealTime,
      })),
    });
  }
  return days;
}

export function getAllergens(excludable: ExcludeCategory[]): ExcludeCategory[] {
  return excludable.filter((c) => c !== "spicy");
}

export function getAllergyLabel(excludable: ExcludeCategory[]): string {
  const list = getAllergens(excludable);
  return list.length ? list.map((c) => EXCLUDE_CATEGORIES[c].label).join(", ") : "";
}
