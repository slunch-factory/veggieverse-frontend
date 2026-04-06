export type DurationType = 1 | 2;
export type ExcludeCategory = "dairy" | "shellfish" | "fish" | "nuts" | "chicken" | "egg" | "gluten" | "spicy";
export type MenuCategory = "glow" | "recovery" | "clean" | "light" | "balance";

export interface MenuData {
  id: string;
  name: string;
  category: MenuCategory;
  cost: number;
  price: number;
  image: string;
  description: string;
  excludable: ExcludeCategory[];
}

export interface DisplayMenuData extends MenuData {
  displayName: string;
  isVariation: boolean;
  originalName?: string;
  badge?: string;
}

/* ─── 제외 재료 카테고리 ─── */
export const EXCLUDE_CATEGORIES: Record<ExcludeCategory, { label: string; keywords: string[] }> = {
  dairy: { label: "유제품", keywords: ["치즈", "크림", "버터", "우유", "파르미지아노"] },
  shellfish: { label: "갑각류", keywords: ["새우", "관자", "랍스터", "해물"] },
  fish: { label: "생선", keywords: ["연어", "참치", "도미", "고등어"] },
  nuts: { label: "견과류", keywords: ["땅콩", "아몬드", "호두", "캐슈넛"] },
  chicken: { label: "닭고기", keywords: ["닭", "치킨", "닭가슴살"] },
  egg: { label: "계란", keywords: ["달걀", "계란", "오야코"] },
  gluten: { label: "글루텐", keywords: ["파스타", "우동", "뇨끼", "또띠아"] },
  spicy: { label: "매운맛", keywords: ["고추장", "청양고추", "스리라차"] },
};

/* ─── 식단 유형 ─── */
export const PLAN_TYPES = [
  { id: "glow", name: "글로우", subtitle: "GLOW", description: "피부 건강과 안티에이징에 집중한 식단. 항산화 성분이 풍부한 채소와 과일, 오메가-3가 풍부한 식재료로 구성됩니다.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop", color: "#FFE4E1", filterTags: ["저칼로리", "비건"] },
  { id: "wellness", name: "웰니스", subtitle: "WELLNESS", description: "전반적인 건강 증진을 위한 균형 잡힌 식단. 면역력 강화와 에너지 부스팅에 초점을 맞춥니다.", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=400&fit=crop", color: "#E8F5E9", filterTags: ["고단백", "비건"] },
  { id: "balance", name: "밸런스", subtitle: "BALANCE", description: "탄수화물, 단백질, 지방의 완벽한 균형. 바쁜 일상 속에서도 건강한 식습관을 유지할 수 있습니다.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop", color: "#FFF8E1", filterTags: ["비건"] },
  { id: "light", name: "라이트", subtitle: "LIGHT", description: "칼로리 컨트롤에 최적화된 저칼로리 식단. 포만감은 유지하면서 체중 관리를 도와줍니다.", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop", color: "#E3F2FD", filterTags: ["저칼로리"] },
  { id: "clean", name: "클린", subtitle: "CLEAN", description: "가공식품 없이 자연 그대로의 식재료만 사용. 디톡스와 클린 이팅을 추구하는 분들께 추천합니다.", image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&h=400&fit=crop", color: "#F3E5F5", filterTags: ["비건", "저칼로리"] },
];

const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* ─── 30개 메뉴 ─── */
export const MENUS: Record<string, MenuData> = {
  G01: { id: "G01", name: "노르웨이 연어 콩피", category: "glow", cost: 6500, price: 9500, image: `${_BASE}/images/menus/example.png`, description: "저온에서 천천히 익힌 프리미엄 연어", excludable: ["fish"] },
  G02: { id: "G02", name: "홋카이도 관자 버터 소테", category: "glow", cost: 8500, price: 12000, image: `${_BASE}/images/menus/example2.png`, description: "버터에 구운 홋카이도산 관자", excludable: ["shellfish", "dairy"] },
  G03: { id: "G03", name: "연어 아보카도 덮밥", category: "glow", cost: 4500, price: 8900, image: `${_BASE}/images/menus/example3.png`, description: "신선한 연어와 아보카도의 조합", excludable: ["fish"] },
  G04: { id: "G04", name: "아보카도 타르타르", category: "glow", cost: 4000, price: 7900, image: `${_BASE}/images/menus/example4.png`, description: "크리미한 아보카도 타르타르", excludable: [] },
  G05: { id: "G05", name: "로스티드 비트 카르파초", category: "glow", cost: 3800, price: 7500, image: `${_BASE}/images/menus/example5.png`, description: "구운 비트의 선명한 맛", excludable: [] },
  G06: { id: "G06", name: "미소 글레이즈드 연어", category: "glow", cost: 6000, price: 9900, image: `${_BASE}/images/menus/example6.png`, description: "미소 소스로 글레이즈한 연어", excludable: ["fish"] },
  R01: { id: "R01", name: "치킨 콩피", category: "recovery", cost: 5500, price: 9500, image: `${_BASE}/images/menus/example.png`, description: "저온에서 천천히 익힌 닭다리살", excludable: ["chicken"] },
  R02: { id: "R02", name: "치킨 마르살라", category: "recovery", cost: 5200, price: 9200, image: `${_BASE}/images/menus/example2.png`, description: "마르살라 와인 소스 치킨", excludable: ["chicken"] },
  R03: { id: "R03", name: "치킨 마요 덮밥", category: "recovery", cost: 2800, price: 6900, image: `${_BASE}/images/menus/example3.png`, description: "부드러운 치킨과 마요네즈의 조화", excludable: ["chicken", "egg"] },
  R04: { id: "R04", name: "닭갈비 덮밥", category: "recovery", cost: 3200, price: 7500, image: `${_BASE}/images/menus/example4.png`, description: "매콤달콤한 닭갈비 덮밥", excludable: ["chicken", "spicy"] },
  R05: { id: "R05", name: "크리스피 두부 스테이크", category: "recovery", cost: 3000, price: 6900, image: `${_BASE}/images/menus/example5.png`, description: "바삭하게 구운 두부 스테이크", excludable: [] },
  R06: { id: "R06", name: "오야코동", category: "recovery", cost: 2800, price: 6900, image: `${_BASE}/images/menus/example6.png`, description: "부드러운 계란과 닭고기 덮밥", excludable: ["chicken", "egg"] },
  C01: { id: "C01", name: "사프란 퀴노아 필라프", category: "clean", cost: 3500, price: 7900, image: `${_BASE}/images/menus/example.png`, description: "사프란 향이 깃든 퀴노아 필라프", excludable: [] },
  C02: { id: "C02", name: "지중해식 퀴노아 샐러드", category: "clean", cost: 3200, price: 7500, image: `${_BASE}/images/menus/example2.png`, description: "올리브와 허브의 지중해 샐러드", excludable: [] },
  C03: { id: "C03", name: "구운 콜리플라워 스테이크", category: "clean", cost: 3200, price: 7500, image: `${_BASE}/images/menus/example3.png`, description: "통째로 구운 콜리플라워", excludable: [] },
  C04: { id: "C04", name: "아쿠아파차 스타일 도미", category: "clean", cost: 6800, price: 10500, image: `${_BASE}/images/menus/example4.png`, description: "토마토 브로스에 익힌 도미", excludable: ["fish"] },
  C05: { id: "C05", name: "라따뚜이", category: "clean", cost: 3000, price: 6900, image: `${_BASE}/images/menus/example5.png`, description: "프로방스식 채소 스튜", excludable: [] },
  C06: { id: "C06", name: "스터프드 피망", category: "clean", cost: 3500, price: 7900, image: `${_BASE}/images/menus/example6.png`, description: "퀴노아와 야채를 채운 피망", excludable: [] },
  L01: { id: "L01", name: "당근 오렌지 수프", category: "light", cost: 2800, price: 6500, image: `${_BASE}/images/menus/example.png`, description: "상큼한 당근 오렌지 수프", excludable: [] },
  L02: { id: "L02", name: "그린 파파야 샐러드", category: "light", cost: 2500, price: 6200, image: `${_BASE}/images/menus/example2.png`, description: "태국식 그린 파파야 샐러드", excludable: ["nuts", "spicy"] },
  L03: { id: "L03", name: "비건 포케 볼", category: "light", cost: 2800, price: 6900, image: `${_BASE}/images/menus/example3.png`, description: "두부와 채소로 만든 비건 포케", excludable: [] },
  L04: { id: "L04", name: "참치 타르타르", category: "light", cost: 7500, price: 11500, image: `${_BASE}/images/menus/example4.png`, description: "신선한 참치 타르타르", excludable: ["fish"] },
  L05: { id: "L05", name: "닭가슴살 샐러드 볼", category: "light", cost: 3200, price: 7500, image: `${_BASE}/images/menus/example5.png`, description: "그릴드 닭가슴살 샐러드", excludable: ["chicken"] },
  L06: { id: "L06", name: "렌틸콩 수프", category: "light", cost: 2600, price: 6500, image: `${_BASE}/images/menus/example6.png`, description: "고단백 렌틸콩 수프", excludable: [] },
  B01: { id: "B01", name: "트러플 크림 리조또", category: "balance", cost: 4200, price: 8900, image: `${_BASE}/images/menus/example.png`, description: "트러플 향 크리미 리조또", excludable: ["dairy"] },
  B02: { id: "B02", name: "코코뱅", category: "balance", cost: 6800, price: 10500, image: `${_BASE}/images/menus/example2.png`, description: "와인에 조린 프랑스식 닭요리", excludable: ["chicken"] },
  B03: { id: "B03", name: "채소 카레 덮밥", category: "balance", cost: 2800, price: 6900, image: `${_BASE}/images/menus/example3.png`, description: "향신료 가득한 채소 카레", excludable: ["spicy"] },
  B04: { id: "B04", name: "새우 볶음밥", category: "balance", cost: 3200, price: 7500, image: `${_BASE}/images/menus/example4.png`, description: "탱글탱글한 새우 볶음밥", excludable: ["shellfish", "egg"] },
  B05: { id: "B05", name: "버섯 리조또", category: "balance", cost: 4000, price: 8500, image: `${_BASE}/images/menus/example5.png`, description: "다양한 버섯의 크리미 리조또", excludable: ["dairy"] },
  B06: { id: "B06", name: "해물 파에야", category: "balance", cost: 7500, price: 11500, image: `${_BASE}/images/menus/example6.png`, description: "해산물 가득 스페인 파에야", excludable: ["shellfish", "fish"] },
};

/* ─── 메뉴 변형 규칙 ─── */
export const MENU_VARIATIONS: Record<string, Partial<Record<ExcludeCategory, { name: string; badge: string }>>> = {
  G01: { fish: { name: "두부 콩피", badge: "연어 → 두부" } },
  G02: { shellfish: { name: "새송이버섯 버터 소테", badge: "관자 → 새송이" }, dairy: { name: "관자 올리브 소테", badge: "버터 → 올리브오일" } },
  G03: { fish: { name: "아보카도 덮밥", badge: "연어 → 제외" } },
  G06: { fish: { name: "미소 글레이즈드 두부", badge: "연어 → 두부" } },
  R01: { chicken: { name: "두부 콩피", badge: "치킨 → 두부" } },
  R02: { chicken: { name: "버섯 마르살라", badge: "치킨 → 버섯" } },
  R03: { chicken: { name: "두부 마요 덮밥", badge: "치킨 → 두부" } },
  R04: { chicken: { name: "버섯갈비 덮밥", badge: "닭 → 버섯" } },
  R06: { chicken: { name: "야채 덮밥", badge: "닭 → 야채" }, egg: { name: "치킨 덮밥", badge: "계란 → 제외" } },
  C04: { fish: { name: "아쿠아파차 스타일 두부", badge: "도미 → 두부" } },
  L04: { fish: { name: "비트 타르타르", badge: "참치 → 비트" } },
  L05: { chicken: { name: "두부 샐러드 볼", badge: "닭가슴살 → 두부" } },
  B01: { dairy: { name: "트러플 코코넛크림 리조또", badge: "크림 → 코코넛크림" } },
  B02: { chicken: { name: "버섯 코코뱅", badge: "치킨 → 버섯" } },
  B04: { shellfish: { name: "야채 볶음밥", badge: "새우 → 야채" } },
  B05: { dairy: { name: "버섯 코코넛크림 리조또", badge: "크림 → 코코넛크림" } },
  B06: { shellfish: { name: "야채 파에야", badge: "해물 → 야채" } },
};

/* ─── 유틸리티 ─── */
export function getDisplayMenu(menuId: string, excludeCategories: ExcludeCategory[]): DisplayMenuData {
  const menu = MENUS[menuId];
  if (!menu) return { id: menuId, name: "", category: "balance", cost: 0, price: 0, image: "", description: "", excludable: [], displayName: "", isVariation: false };

  const variations = MENU_VARIATIONS[menuId];
  if (!variations) return { ...menu, displayName: menu.name, isVariation: false };

  for (const category of excludeCategories) {
    if (variations[category]) {
      return { ...menu, displayName: variations[category]!.name, badge: variations[category]!.badge, isVariation: true, originalName: menu.name };
    }
  }

  return { ...menu, displayName: menu.name, isVariation: false };
}

export const CATEGORY_MAP: Record<string, MenuCategory> = {
  glow: "glow",
  wellness: "recovery",
  balance: "balance",
  light: "light",
  clean: "clean",
};

export function getNextMonday(): Date {
  const today = new Date();
  const dow = today.getDay();
  const days = dow === 0 ? 1 : dow === 1 ? 7 : 8 - dow;
  const d = new Date(today);
  d.setDate(today.getDate() + days);
  return d;
}

export function formatDateLabel(date: Date) {
  const names = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dow = date.getDay();
  return { dayName: names[dow], dayNum: date.getDate(), isHoliday: dow === 0 };
}

export function formatPrice(price: number) {
  return price.toLocaleString("ko-KR") + "원";
}

export function generateWeekDays(weekStart: Date) {
  const MEAL_TIMES = ["점심", "저녁"] as const;
  const days: { date: Date; dateKey: string; dateLabel: ReturnType<typeof formatDateLabel>; slots: { slotId: string; mealTime: string }[] }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    days.push({
      date,
      dateKey,
      dateLabel: formatDateLabel(date),
      slots: MEAL_TIMES.map((t) => ({ slotId: `${dateKey}-${t}`, mealTime: t })),
    });
  }
  return days;
}
