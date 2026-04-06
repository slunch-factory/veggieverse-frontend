const _BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface SurveyOption {
  label: string;
  description: string;
  value: string;
  tarot: { number: string; title: string; image: string };
}

export interface SurveyQuestion {
  id: number;
  step: number;
  question: string;
  subtitle: string;
  multiSelect?: boolean;
  options: SurveyOption[];
}

// ─── 버전 1: 정석 ───
const _STANDARD_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    step: 1,
    question: "어떤 식이유형을 따르고 계신가요?",
    subtitle: "현재 실천 중이거나 관심 있는 식이유형을 선택해주세요.",
    options: [
      {
        label: "비건",
        description: "동물성 식품을 일체 섭취하지 않아요",
        value: "vegan",
        tarot: { number: "I", title: "The Garden.", image: "/images/tarot/diet-type/garden.png" },
      },
      {
        label: "페스코",
        description: "육류는 먹지 않지만 생선과 해산물은 먹어요",
        value: "pesco",
        tarot: { number: "II", title: "The Sea.", image: "/images/tarot/diet-type/ocean.png" },
      },
      {
        label: "폴로",
        description: "붉은 고기는 먹지 않지만 닭고기와 생선은 먹어요",
        value: "pollo",
        tarot: { number: "III", title: "The Dawn.", image: "/images/tarot/diet-type/dawn.png" },
      },
    ],
  },
  {
    id: 2,
    step: 2,
    question: "영양 목표는 무엇인가요?",
    subtitle: "중요하게 생각하는 영양 목표를 모두 선택해주세요.",
    multiSelect: true,
    options: [
      {
        label: "플랜트 베이스드",
        description: "식물성 원재료 중심의 식단을 지향해요",
        value: "plant-based",
        tarot: { number: "IV", title: "The Seed.", image: "/images/tarot/diet-type/garden.png" },
      },
      {
        label: "저탄수화물",
        description: "탄수화물 섭취를 줄이고 싶어요",
        value: "low-carb",
        tarot: { number: "V", title: "The Scale.", image: "/images/tarot/priority/scale.png" },
      },
      {
        label: "저칼로리",
        description: "전체 칼로리 섭취를 낮추고 싶어요",
        value: "low-calories",
        tarot: { number: "VI", title: "The Feather.", image: "/images/tarot/priority/wind.png" },
      },
      {
        label: "고단백",
        description: "단백질 섭취를 높이고 싶어요",
        value: "high-protein",
        tarot: { number: "VII", title: "The Forge.", image: "/images/tarot/meal-meaning/tree.png" },
      },
      {
        label: "저나트륨",
        description: "나트륨(소금) 섭취를 줄이고 싶어요",
        value: "low-sodium",
        tarot: { number: "VIII", title: "The Stream.", image: "/images/tarot/food-mood/silence.png" },
      },
    ],
  },
  {
    id: 3,
    step: 3,
    question: "알레르기가 있으신가요?",
    subtitle: "해당하는 항목을 모두 선택해주세요. 없으면 넘어가셔도 됩니다.",
    multiSelect: true,
    options: [
      {
        label: "견과류",
        description: "호두, 아몬드, 캐슈넛 등에 알레르기가 있어요",
        value: "tree-nuts",
        tarot: { number: "IX", title: "The Nut.", image: "/images/tarot/food-mood/heritage.png" },
      },
      {
        label: "땅콩",
        description: "땅콩 및 땅콩 가공식품에 알레르기가 있어요",
        value: "peanuts",
        tarot: { number: "X", title: "The Earth.", image: "/images/tarot/veg-reason/earth.png" },
      },
      {
        label: "유제품",
        description: "우유, 치즈, 버터 등 유제품에 알레르기가 있어요",
        value: "dairy",
        tarot: { number: "XI", title: "The Milkyway.", image: "/images/tarot/diet-option/milkyway.png" },
      },
    ],
  },
  {
    id: 4,
    step: 4,
    question: "매운맛은 어느 정도 드시나요?",
    subtitle: "선호하는 매운맛 강도를 선택해주세요.",
    options: [
      {
        label: "1단계",
        description: "매운 건 잘 못 먹어요. 순한 맛이 좋아요",
        value: "mild",
        tarot: { number: "XII", title: "The Breeze.", image: "/images/tarot/food-mood/silence.png" },
      },
      {
        label: "2단계",
        description: "적당히 매운 건 괜찮아요. 중간이 딱 좋아요",
        value: "medium",
        tarot: { number: "XIII", title: "The Flame.", image: "/images/tarot/food-mood/alchemy.png" },
      },
      {
        label: "3단계",
        description: "매울수록 좋아요. 얼큰한 맛을 즐겨요",
        value: "hot",
        tarot: { number: "XIV", title: "The Inferno.", image: "/images/tarot/food-mood/artisan.png" },
      },
    ],
  },
];

// ─── 버전 2: 재치 ───
const _WITTY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 1,
    step: 1,
    question: "당신의 식탁 위 철학은?",
    subtitle: "오늘 저녁, 어디까지 허용하시겠어요?",
    options: [
      {
        label: "비건",
        description: "식물만으로 충분해요. 풀의 힘을 믿는 편이죠",
        value: "vegan",
        tarot: { number: "I", title: "The Garden.", image: "/images/tarot/diet-type/garden.png" },
      },
      {
        label: "페스코",
        description: "바다 친구들까지는 OK. 육지 동물은 패스요",
        value: "pesco",
        tarot: { number: "II", title: "The Sea.", image: "/images/tarot/diet-type/ocean.png" },
      },
      {
        label: "폴로",
        description: "치킨은 포기 못 해... 소고기만 안 먹을게요",
        value: "pollo",
        tarot: { number: "III", title: "The Dawn.", image: "/images/tarot/diet-type/dawn.png" },
      },
    ],
  },
  {
    id: 2,
    step: 2,
    question: "요즘 몸이 보내는 신호는?",
    subtitle: "하나만 고르기 힘들면 여러 개 골라도 돼요.",
    multiSelect: true,
    options: [
      {
        label: "플랜트 베이스드",
        description: "자연에서 온 것만 넣고 싶어요",
        value: "plant-based",
        tarot: { number: "IV", title: "The Seed.", image: "/images/tarot/diet-type/garden.png" },
      },
      {
        label: "저탄수화물",
        description: "밥 줄이고 반찬 늘리는 중이에요",
        value: "low-carb",
        tarot: { number: "V", title: "The Scale.", image: "/images/tarot/priority/scale.png" },
      },
      {
        label: "저칼로리",
        description: "가볍게 먹고 싶은 날이 많아졌어요",
        value: "low-calories",
        tarot: { number: "VI", title: "The Feather.", image: "/images/tarot/priority/wind.png" },
      },
      {
        label: "고단백",
        description: "근육이 단백질을 외치고 있어요",
        value: "high-protein",
        tarot: { number: "VII", title: "The Forge.", image: "/images/tarot/meal-meaning/tree.png" },
      },
      {
        label: "저나트륨",
        description: "짠 거 좋아하지만... 참아야 해요",
        value: "low-sodium",
        tarot: { number: "VIII", title: "The Stream.", image: "/images/tarot/food-mood/silence.png" },
      },
    ],
  },
  {
    id: 3,
    step: 3,
    question: "이것만은 제 식탁에 올리지 마세요!",
    subtitle: "알레르기가 있다면 체크해주세요. 없으면 그냥 넘어가요!",
    multiSelect: true,
    options: [
      {
        label: "견과류",
        description: "호두, 아몬드 보면 몸이 먼저 알아요",
        value: "tree-nuts",
        tarot: { number: "IX", title: "The Nut.", image: "/images/tarot/food-mood/heritage.png" },
      },
      {
        label: "땅콩",
        description: "땅콩버터? 저한텐 위험한 존재예요",
        value: "peanuts",
        tarot: { number: "X", title: "The Earth.", image: "/images/tarot/veg-reason/earth.png" },
      },
      {
        label: "유제품",
        description: "우유랑은 거리를 두는 사이예요",
        value: "dairy",
        tarot: { number: "XI", title: "The Milkyway.", image: "/images/tarot/diet-option/milkyway.png" },
      },
    ],
  },
  {
    id: 4,
    step: 4,
    question: "매운맛 앞에서 당신은?",
    subtitle: "솔직하게 답해주세요. 체면은 잠시 내려놓고요.",
    options: [
      {
        label: "1단계",
        description: "신라면도 물 많이 넣어 먹는 편이에요",
        value: "mild",
        tarot: { number: "XII", title: "The Breeze.", image: "/images/tarot/food-mood/silence.png" },
      },
      {
        label: "2단계",
        description: "불닭볶음면은 좀 맵지만 먹을 수는 있어요",
        value: "medium",
        tarot: { number: "XIII", title: "The Flame.", image: "/images/tarot/food-mood/alchemy.png" },
      },
      {
        label: "3단계",
        description: "캡사이신이 혈관을 타고 흐르는 사람이에요",
        value: "hot",
        tarot: { number: "XIV", title: "The Inferno.", image: "/images/tarot/food-mood/artisan.png" },
      },
    ],
  },
];

export const STANDARD_QUESTIONS: SurveyQuestion[] = _STANDARD_QUESTIONS.map((q) => ({
  ...q,
  options: q.options.map((opt) => ({
    ...opt,
    tarot: { ...opt.tarot, image: `${_BASE}${opt.tarot.image}` },
  })),
}));

export const WITTY_QUESTIONS: SurveyQuestion[] = _WITTY_QUESTIONS.map((q) => ({
  ...q,
  options: q.options.map((opt) => ({
    ...opt,
    tarot: { ...opt.tarot, image: `${_BASE}${opt.tarot.image}` },
  })),
}));
