const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* ─── 타입 ─── */
export interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string;
  author: string;
  likes: number;
  tags: string[];
  category: string;
}

export interface RecipeCategory {
  id: string;
  title: string;
  subtitle: string;
  recipes: Recipe[];
}

/* ─── 색상 ─── */
export const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  new: { text: "#2E7D32", bg: "#E8F5E9" },
  lunch: { text: "#E65100", bg: "#FFF3E0" },
  popular: { text: "#1565C0", bg: "#E3F2FD" },
  dessert: { text: "#AD1457", bg: "#FCE4EC" },
};

/* ─── 샘플 레시피 데이터 ─── */
const SAMPLE_RECIPES: Recipe[] = [
  { id: 101, title: "트러플 크림 리조또", description: "트러플 향 가득한 크리미 리조또", image: `${_BASE}/images/menus/example.png`, author: "슬런치셰프", likes: 342, tags: ["간편조리", "고단백"], category: "인기" },
  { id: 102, title: "아보카도 포케 볼", description: "신선한 아보카도와 두부로 만든 비건 포케", image: `${_BASE}/images/menus/example2.png`, author: "비건러버", likes: 289, tags: ["건강", "미니멀"], category: "인기" },
  { id: 103, title: "버섯 크림 파스타", description: "다양한 버섯의 풍미가 가득한 크림 파스타", image: `${_BASE}/images/menus/example3.png`, author: "파스타킹", likes: 276, tags: ["간편조리", "감성적"], category: "인기" },
  { id: 104, title: "콩나물 비빔밥", description: "고소한 콩나물과 양념장의 조화", image: `${_BASE}/images/menus/example4.png`, author: "한식사랑", likes: 265, tags: ["전통", "영양균형"], category: "인기" },
  { id: 105, title: "두부 스테이크", description: "바삭하게 구운 두부에 특제 소스를 곁들인", image: `${_BASE}/images/menus/example5.png`, author: "슬런치셰프", likes: 254, tags: ["고단백", "간편조리"], category: "인기" },
  { id: 106, title: "채소 카레 덮밥", description: "향신료 가득한 건강 채소 카레", image: `${_BASE}/images/menus/example6.png`, author: "카레마스터", likes: 243, tags: ["간편조리", "영양균형"], category: "인기" },
  { id: 107, title: "퀴노아 샐러드 볼", description: "지중해식 퀴노아와 올리브 샐러드", image: `${_BASE}/images/menus/example.png`, author: "건강식탁", likes: 231, tags: ["건강", "미니멀"], category: "인기" },
  { id: 108, title: "비건 김치찌개", description: "식물성 육수로 끓인 깊은 맛 김치찌개", image: `${_BASE}/images/menus/example2.png`, author: "한식사랑", likes: 219, tags: ["전통", "깊은맛"], category: "인기" },

  { id: 201, title: "매생이 크림 펜네", description: "바다향 매생이와 고소한 크림소스", image: `${_BASE}/images/menus/example3.png`, author: "파스타킹", likes: 187, tags: ["새로운시도", "간편조리"], category: "신규" },
  { id: 202, title: "감태버터 토스트", description: "바다내음 감태로 만든 건강 토스트", image: `${_BASE}/images/menus/example4.png`, author: "브런치러버", likes: 156, tags: ["간편조리", "감성적"], category: "신규" },
  { id: 203, title: "트러플 리조또 볼", description: "한입 크기 트러플 리조또", image: `${_BASE}/images/menus/example5.png`, author: "슬런치셰프", likes: 134, tags: ["새로운시도", "예쁜플레이팅"], category: "신규" },
  { id: 204, title: "매생이 페스토 파스타", description: "초록빛 건강 매생이 페스토", image: `${_BASE}/images/menus/example6.png`, author: "파스타킹", likes: 128, tags: ["새로운시도", "건강"], category: "신규" },
  { id: 205, title: "고구마 뇨끼", description: "달콤한 고구마로 만든 수제 뇨끼", image: `${_BASE}/images/menus/example.png`, author: "건강식탁", likes: 112, tags: ["새로운시도", "간편조리"], category: "신규" },
  { id: 206, title: "연근 칩 샐러드", description: "바삭한 연근 칩을 올린 샐러드", image: `${_BASE}/images/menus/example2.png`, author: "비건러버", likes: 98, tags: ["건강", "예쁜플레이팅"], category: "신규" },

  { id: 301, title: "시금치 뇨끼 도시락", description: "부드러운 시금치 뇨끼 한 그릇", image: `${_BASE}/images/menus/example3.png`, author: "도시락장인", likes: 198, tags: ["효율적", "간편조리"], category: "점심" },
  { id: 302, title: "두부 김밥", description: "고소한 두부와 신선한 채소 김밥", image: `${_BASE}/images/menus/example4.png`, author: "한식사랑", likes: 187, tags: ["간편조리", "전통"], category: "점심" },
  { id: 303, title: "채소 볶음밥", description: "다양한 채소가 가득한 건강 볶음밥", image: `${_BASE}/images/menus/example5.png`, author: "건강식탁", likes: 176, tags: ["간편조리", "효율적"], category: "점심" },
  { id: 304, title: "비건 샌드위치", description: "통밀빵에 신선한 채소를 가득 넣은", image: `${_BASE}/images/menus/example6.png`, author: "브런치러버", likes: 165, tags: ["간편조리", "건강"], category: "점심" },
  { id: 305, title: "렌틸콩 스프", description: "고단백 렌틸콩으로 만든 든든한 스프", image: `${_BASE}/images/menus/example.png`, author: "슬런치셰프", likes: 154, tags: ["고단백", "간편조리"], category: "점심" },
  { id: 306, title: "야채 주먹밥", description: "한입에 쏙, 건강한 야채 주먹밥", image: `${_BASE}/images/menus/example2.png`, author: "도시락장인", likes: 143, tags: ["간편조리", "효율적"], category: "점심" },

  { id: 401, title: "블루베리 타르트", description: "신선한 블루베리를 올린 비건 타르트", image: `${_BASE}/images/menus/example3.png`, author: "디저트팩토리", likes: 234, tags: ["감성적", "예쁜플레이팅"], category: "디저트" },
  { id: 402, title: "코코넛 푸딩", description: "부드러운 코코넛 밀크 푸딩", image: `${_BASE}/images/menus/example4.png`, author: "디저트팩토리", likes: 212, tags: ["감성적", "즐거움"], category: "디저트" },
  { id: 403, title: "피넛버터 초코 바", description: "고소한 피넛버터와 진한 초콜릿", image: `${_BASE}/images/menus/example5.png`, author: "슬런치셰프", likes: 198, tags: ["즐거움", "간편조리"], category: "디저트" },
  { id: 404, title: "자두 타르트", description: "상큼한 자두를 올린 프리미엄 타르트", image: `${_BASE}/images/menus/example6.png`, author: "디저트팩토리", likes: 187, tags: ["감성적", "예쁜플레이팅"], category: "디저트" },
  { id: 405, title: "단호박 초코 케이크", description: "부드러운 단호박과 진한 초콜릿", image: `${_BASE}/images/menus/example.png`, author: "디저트팩토리", likes: 176, tags: ["감성적", "즐거움"], category: "디저트" },
  { id: 406, title: "오트밀 쿠키", description: "건강한 오트밀로 만든 바삭한 쿠키", image: `${_BASE}/images/menus/example2.png`, author: "건강식탁", likes: 165, tags: ["간편조리", "건강"], category: "디저트" },
];

/* ─── 카테고리별 레시피 ─── */
export const RECIPE_CATEGORIES: RecipeCategory[] = [
  { id: "new", title: "이번 주 새로 올라온 레시피", subtitle: "신규레시피", recipes: SAMPLE_RECIPES.filter((r) => r.category === "신규") },
  { id: "lunch", title: "맛있는 점심으로 하루 채우기", subtitle: "점심", recipes: SAMPLE_RECIPES.filter((r) => r.category === "점심") },
  { id: "popular", title: "가장 사랑받는 인기 레시피", subtitle: "인기", recipes: SAMPLE_RECIPES.filter((r) => r.category === "인기") },
  { id: "dessert", title: "디저트는 내 삶의 낙이야", subtitle: "디저트", recipes: SAMPLE_RECIPES.filter((r) => r.category === "디저트") },
];

export const ALL_RECIPES = SAMPLE_RECIPES;

export const TOP_RECIPES = [...SAMPLE_RECIPES].sort((a, b) => b.likes - a.likes).slice(0, 8);

export function getRecipeById(id: number): Recipe | undefined {
  return SAMPLE_RECIPES.find((r) => r.id === id);
}
