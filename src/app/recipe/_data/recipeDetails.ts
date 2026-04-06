const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface Ingredient {
  name: string;
  amount: string;
  note?: string;
}

export interface Nutrition {
  calories: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  protein: number;
}

export interface Step {
  step: number;
  title: string;
  instructions: string[];
  tip?: string;
  image?: string;
}

export interface RelatedRecipe {
  id: number;
  title: string;
  description: string;
}

export interface DetailedRecipe {
  id: number;
  title: string;
  description: string;
  image: string;
  heroImage?: string;
  author: string;
  likes: number;
  tags: string[];
  dietCategory: string;
  recipeCategory: string;
  totalTime: string;
  difficulty: string;
  servings: number;
  allergens?: string[];
  ingredients: Ingredient[];
  nutrition: Nutrition;
  steps: Step[];
  relatedRecipes?: RelatedRecipe[];
}

export const DETAILED_RECIPES: DetailedRecipe[] = [
  {
    id: 101,
    title: "트러플 크림 리조또",
    description: "트러플 향 가득한 크리미 리조또",
    image: `${_BASE}/images/menus/example.png`,
    heroImage: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=1200&h=800&fit=crop",
    author: "슬런치셰프",
    likes: 342,
    tags: ["리조또", "트러플", "비건"],
    dietCategory: "완전비건",
    recipeCategory: "점심",
    totalTime: "40분",
    difficulty: "보통",
    servings: 2,
    allergens: ["대두"],
    ingredients: [
      { name: "아르보리오 쌀", amount: "200g" },
      { name: "양송이", amount: "150g", note: "슬라이스" },
      { name: "양파", amount: "1개", note: "다진 것" },
      { name: "마늘", amount: "3쪽", note: "다진 것" },
      { name: "트러플 오일", amount: "2큰술" },
      { name: "채소 육수", amount: "800ml" },
      { name: "올리브 오일", amount: "2큰술" },
      { name: "소금", amount: "적당량" },
      { name: "후추", amount: "적당량" },
    ],
    nutrition: { calories: 420, fat: 14, saturatedFat: 3, carbs: 62, sugar: 4, fiber: 3, protein: 10 },
    steps: [
      { step: 1, title: "재료 준비", instructions: ["양송이를 슬라이스하고, 양파와 마늘을 다져주세요.", "채소 육수를 냄비에 데워 따뜻하게 유지하세요."], tip: "육수는 따뜻한 상태로 넣어야 쌀이 고르게 익어요." },
      { step: 2, title: "양파 볶기", instructions: ["팬에 올리브 오일을 두르고 양파를 중불에서 3분간 볶아주세요.", "양파가 투명해지면 마늘을 넣고 1분 더 볶아주세요."] },
      { step: 3, title: "쌀 볶기", instructions: ["아르보리오 쌀을 넣고 2분간 볶아 쌀 표면에 기름을 입혀주세요.", "쌀알이 반투명해지면 준비 완료입니다."], tip: "쌀을 미리 씻지 마세요. 전분이 크리미한 식감을 만들어줘요." },
      { step: 4, title: "육수 넣기", instructions: ["따뜻한 채소 육수를 한 국자씩 넣으며 저어주세요.", "육수가 거의 흡수되면 다음 국자를 넣는 과정을 반복합니다.", "약 18-20분간 이 과정을 반복하세요."] },
      { step: 5, title: "마무리", instructions: ["버섯을 넣고 3분간 더 익혀주세요.", "불을 끄고 트러플 오일과 소금, 후추로 간을 맞추세요."], tip: "트러플 오일은 열에 약하므로 반드시 불을 끈 후 넣으세요." },
    ],
    relatedRecipes: [
      { id: 102, title: "아보카도 포케 볼", description: "신선한 아보카도와 두부" },
      { id: 103, title: "버섯 크림 파스타", description: "풍미 가득한 크림 파스타" },
      { id: 104, title: "콩나물 비빔밥", description: "고소한 콩나물 비빔밥" },
      { id: 105, title: "두부 스테이크", description: "바삭한 두부 스테이크" },
    ],
  },
  {
    id: 102,
    title: "아보카도 포케 볼",
    description: "신선한 아보카도와 두부로 만든 비건 포케",
    image: `${_BASE}/images/menus/example2.png`,
    heroImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop",
    author: "비건러버",
    likes: 289,
    tags: ["포케", "아보카도", "건강"],
    dietCategory: "완전비건",
    recipeCategory: "점심",
    totalTime: "20분",
    difficulty: "쉬움",
    servings: 2,
    ingredients: [
      { name: "밥", amount: "2공기" },
      { name: "아보카도", amount: "1개" },
      { name: "두부", amount: "150g", note: "단단한 것" },
      { name: "당근", amount: "1/2개", note: "채썬 것" },
      { name: "오이", amount: "1/2개" },
      { name: "간장", amount: "2큰술" },
      { name: "참기름", amount: "1큰술" },
      { name: "깨", amount: "적당량" },
    ],
    nutrition: { calories: 380, fat: 16, saturatedFat: 2, carbs: 48, sugar: 6, fiber: 8, protein: 14 },
    steps: [
      { step: 1, title: "두부 준비", instructions: ["두부를 깍둑썰기 하고 키친타월로 물기를 제거해주세요.", "팬에 기름을 두르고 두부를 바삭하게 구워주세요."] },
      { step: 2, title: "채소 준비", instructions: ["아보카도를 반으로 갈라 슬라이스해주세요.", "당근과 오이를 채썰어 준비해주세요."] },
      { step: 3, title: "소스 만들기", instructions: ["간장, 참기름, 깨를 섞어 소스를 만들어주세요."] },
      { step: 4, title: "플레이팅", instructions: ["볼에 밥을 담고 준비한 재료를 보기 좋게 올려주세요.", "소스를 뿌려 완성합니다."], tip: "에다마메나 김을 추가하면 더 풍성해져요." },
    ],
    relatedRecipes: [
      { id: 101, title: "트러플 크림 리조또", description: "크리미한 트러플 리조또" },
      { id: 105, title: "두부 스테이크", description: "바삭한 두부 스테이크" },
    ],
  },
];

export function getDetailedRecipe(id: number): DetailedRecipe | undefined {
  const found = DETAILED_RECIPES.find((r) => r.id === id);
  if (found) return found;

  // 목록 데이터에서 기본 상세 페이지 생성
  const { ALL_RECIPES } = require("./recipes");
  const listRecipe = ALL_RECIPES.find((r: { id: number }) => r.id === id);
  if (!listRecipe) return undefined;

  return {
    id: listRecipe.id,
    title: listRecipe.title,
    description: listRecipe.description,
    image: listRecipe.image,
    author: listRecipe.author,
    likes: listRecipe.likes,
    tags: listRecipe.tags,
    dietCategory: "비건",
    recipeCategory: listRecipe.category,
    totalTime: "30분",
    difficulty: "보통",
    servings: 2,
    ingredients: [],
    nutrition: { calories: 0, fat: 0, saturatedFat: 0, carbs: 0, sugar: 0, fiber: 0, protein: 0 },
    steps: [],
  };
}
