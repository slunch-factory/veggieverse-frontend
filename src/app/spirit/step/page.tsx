"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { VegetableItem } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { TarotCardGrid } from "@/components/spirit/TarotCardGrid";
import { SpiritResult } from "@/components/spirit/SpiritResult";

// ─── 질문 데이터 ───
const QUESTIONS = [
  {
    id: 1,
    question: "당신의 식단 유형은?",
    options: [
      { label: "만찬", description: "고기, 생선, 채소 가리지 않고 다양하게 즐겨요", value: "none", tarot: { number: "I", title: "The Feast.", image: "/images/tarot/diet-type/feast.png" } },
      { label: "정원", description: "동물성 식품 없이 식물성으로만 먹어요", value: "vegan", tarot: { number: "II", title: "The Garden.", image: "/images/tarot/diet-type/garden.png" } },
      { label: "바다", description: "생선, 해산물은 먹어요", value: "pescatarian", tarot: { number: "III", title: "The Sea.", image: "/images/tarot/diet-type/ocean.png" } },
      { label: "새벽", description: "닭고기까지는 OK", value: "pollo", tarot: { number: "IV", title: "The Dawn.", image: "/images/tarot/diet-type/dawn.png" } },
      { label: "균형", description: "평소엔 채식, 가끔은 유연하게 먹어요", value: "flexitarian", tarot: { number: "V", title: "The Balance.", image: "/images/tarot/diet-type/balance.png" } },
    ],
  },
  {
    id: 2,
    question: "추가 옵션이 있나요?",
    options: [
      { label: "곡물", description: "밀, 보리 등 글루텐을 피해요", value: "gluten-free", tarot: { number: "VI", title: "The Grain.", image: "/images/tarot/diet-option/grain.png" } },
      { label: "은하수", description: "우유, 치즈 등 유제품을 피해요", value: "lactose-free", tarot: { number: "VII", title: "The Milkyway.", image: "/images/tarot/diet-option/milkyway.png" } },
      { label: "없음", description: "추가 옵션 없이 진행해요", value: "none", tarot: { number: "", title: "없음", image: "/images/tarot/card-back.png" } },
    ],
  },
  {
    id: 3,
    question: "끌리는 요리 무드는?",
    options: [
      { label: "유산", description: "전통적이고 정직한 맛이 좋아요", value: "traditional", tarot: { number: "VIII", title: "The Heritage.", image: "/images/tarot/food-mood/heritage.png" } },
      { label: "연금술", description: "장르의 경계 없이 섞인 맛이 좋아요", value: "fusion", tarot: { number: "IX", title: "The Alchemy.", image: "/images/tarot/food-mood/alchemy.png" } },
      { label: "고요", description: "재료 본연의 맛, 심플한 구성이 좋아요", value: "simple", tarot: { number: "X", title: "The Silence.", image: "/images/tarot/food-mood/silence.png" } },
      { label: "장인", description: "섬세하고 정교한 스타일이 좋아요", value: "gourmet", tarot: { number: "XI", title: "The Artisan.", image: "/images/tarot/food-mood/artisan.png" } },
    ],
  },
  {
    id: 4,
    question: "요리에서 가장 중요한 건?",
    options: [
      { label: "저울", description: "탄단지, 영양소 균형이 맞아야 해요", value: "nutrition", tarot: { number: "XII", title: "The Scale.", image: "/images/tarot/priority/scale.png" } },
      { label: "혀", description: "맛이 최우선이에요", value: "taste", tarot: { number: "XIII", title: "The Tongue.", image: "/images/tarot/priority/tongue.png" } },
      { label: "바람", description: "빠르고 간편하게 먹을 수 있어야 해요", value: "convenience", tarot: { number: "XIV", title: "The Wind.", image: "/images/tarot/priority/wind.png" } },
      { label: "나침반", description: "새로운 맛을 시도하고 싶어요", value: "novelty", tarot: { number: "XV", title: "The Compass.", image: "/images/tarot/priority/compass.png" } },
    ],
  },
  {
    id: 5,
    question: "식사 시간, 어떤 의미예요?",
    options: [
      { label: "원탁", description: "누군가와 함께 나누는 시간이에요", value: "family", tarot: { number: "XVI", title: "The Table.", image: "/images/tarot/meal-meaning/table.png" } },
      { label: "생명나무", description: "몸과 마음을 돌보는 시간이에요", value: "health", tarot: { number: "XVII", title: "The Tree.", image: "/images/tarot/meal-meaning/tree.png" } },
      { label: "모래시계", description: "빠르게 해결하고 싶은 일이에요", value: "quick", tarot: { number: "XVIII", title: "The Hourglass.", image: "/images/tarot/meal-meaning/hourglass.png" } },
      { label: "지도", description: "새로운 맛을 발견하는 탐험이에요", value: "experience", tarot: { number: "XIX", title: "The Map.", image: "/images/tarot/meal-meaning/map.png" } },
    ],
  },
  {
    id: 6,
    question: "평소 식사 패턴은?",
    options: [
      { label: "시계", description: "정해진 시간에 규칙적으로 먹어요", value: "regular", tarot: { number: "XX", title: "The Clock.", image: "/images/tarot/meal-pattern/clock.png" } },
      { label: "새", description: "배고플 때 자유롭게 먹어요", value: "flexible", tarot: { number: "XXI", title: "The Bird.", image: "/images/tarot/meal-pattern/bird.png" } },
      { label: "설계자", description: "일주일 식단을 미리 계획해요", value: "planned", tarot: { number: "XXII", title: "The Architect.", image: "/images/tarot/meal-pattern/architect.png" } },
      { label: "불꽃", description: "그때그때 끌리는 대로 먹어요", value: "spontaneous", tarot: { number: "XXIII", title: "The Spark.", image: "/images/tarot/meal-pattern/spark.png" } },
    ],
  },
  {
    id: 7,
    question: "채식을 선택한 이유는?",
    isConditional: true,
    condition: (answers: Record<number, string | string[]>) => {
      const dietAnswer = answers[1];
      return !!dietAnswer && dietAnswer !== "none";
    },
    options: [
      { label: "심장", description: "내 몸의 건강을 위해 선택했어요", value: "health", tarot: { number: "XXIV", title: "The Heart.", image: "/images/tarot/veg-reason/heart.png" } },
      { label: "대지", description: "환경과 지구를 위해 선택했어요", value: "environment", tarot: { number: "XXV", title: "The Earth.", image: "/images/tarot/veg-reason/earth.png" } },
      { label: "숨결", description: "동물의 생명을 위해 선택했어요", value: "animal", tarot: { number: "XXVI", title: "The Breath.", image: "/images/tarot/veg-reason/breath.png" } },
      { label: "문", description: "새로운 도전으로 시작했어요", value: "curiosity", tarot: { number: "XXVII", title: "The Door.", image: "/images/tarot/veg-reason/door.png" } },
    ],
  },
];

// ─── 16가지 비건 유형 ───
const VEGAN_TYPES = [
  { mbti: "ENFP", name: "Bloomist", emoji: "🌻", description: "새로운 거 시도하고 나누는 거 좋아해요", color: "#F3B562" },
  { mbti: "INFP", name: "Mindgrower", emoji: "🌿", description: "내 기준이 확실해요. 조용히 생각 많은 편", color: "#A3C585" },
  { mbti: "INFJ", name: "Quiet Root", emoji: "🌱", description: "말보다 행동으로 보여주는 타입이에요", color: "#6A8A6B" },
  { mbti: "ENFJ", name: "Lightgiver", emoji: "🌼", description: "주변 사람들 챙기는 거 좋아해요", color: "#F4C97E" },
  { mbti: "ENTJ", name: "Forger", emoji: "🔥", description: "효율 중시. 뭐든 체계적으로 해요", color: "#8B7055" },
  { mbti: "ESTJ", name: "Groundtype", emoji: "🌰", description: "검증된 거 좋아해요. 루틴형", color: "#9E8961" },
  { mbti: "ISTJ", name: "Planter", emoji: "🪴", description: "꾸준하고 성실해요. 루틴형", color: "#7A8B6A" },
  { mbti: "INTJ", name: "Strategreen", emoji: "🌲", description: "분석하고 설계하는 게 재밌어요", color: "#5D7264" },
  { mbti: "ISFP", name: "Floret", emoji: "🌸", description: "예쁜 거, 감각적인 거 좋아해요", color: "#E6B7C1" },
  { mbti: "ESFP", name: "Joybean", emoji: "🍑", description: "재밌는 게 최고예요. 분위기 메이커", color: "#F6A880" },
  { mbti: "ESFJ", name: "Careleaf", emoji: "🌺", description: "다 같이 잘 먹어야 해요. 배려형", color: "#F2D68A" },
  { mbti: "ISFJ", name: "Nurturer", emoji: "🌾", description: "티 안 내고 챙기는 타입이에요", color: "#D6C6A5" },
  { mbti: "INTP", name: "Thinkroot", emoji: "🌴", description: "왜 그런지 알아야 해요. 탐구형", color: "#7F9B8A" },
  { mbti: "ENTP", name: "Sparknut", emoji: "🍋", description: "다르게 생각하는 거 좋아해요", color: "#E8D26E" },
  { mbti: "ISTP", name: "Craftbean", emoji: "🫘", description: "직접 해보는 걸 좋아해요. 실용형", color: "#B8A88A" },
  { mbti: "ESTP", name: "Wildgrain", emoji: "🌾", description: "일단 해보는 게 중요해요. 도전형", color: "#C4A35A" },
];

const PRIMARY_DIET_VALUES = ["none", "vegan", "lacto", "ovo", "lacto-ovo", "flexitarian", "pescatarian", "pollo"];

const getAvailableQuestions = (answers: Record<number, string | string[]>) =>
  QUESTIONS.filter((q) => {
    if (!(q as any).isConditional) return true;
    return (q as any).condition?.(answers) ?? true;
  });

const generateMonsterName = (items: VegetableItem[]) => {
  const prefixes = ["Ancient", "Crystal", "Shadow", "Cosmic", "Mystic"];
  const suffixes = ["Guardian", "Spirit", "Beast", "Phoenix", "Dragon"];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${items.map((i) => i.name.slice(0, 3)).join("")}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
};

const generateMonsterDescription = (items: VegetableItem[]) => {
  const names = items.map((i) => i.name).join(", ");
  const descs = [
    `${names}의 힘을 흡수하여 탄생한 신비로운 채소 정령입니다.`,
    `${names}가 융합되어 만들어진 강력한 비건 수호자입니다.`,
    `${names}의 에센스가 결합된 자연의 화신입니다.`,
  ];
  return descs[Math.floor(Math.random() * descs.length)];
};

// ═══════════════════════════════════════════
// 메인 오케스트레이터
// ═══════════════════════════════════════════
export default function SpiritFinderStepPage() {
  const router = useRouter();
  const { user, login } = useUser();

  const [selectedItems] = useState<VegetableItem[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("spirit-finder-selected-items") || "[]"); }
    catch { return []; }
  });

  const [answers, setAnswers] = useState<Record<number, string | string[]>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("spirit-finder-answers") || "{}"); }
    catch { return {}; }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [interactedQuestions, setInteractedQuestions] = useState<Set<number>>(new Set());
  const [monsterImageUrl, setMonsterImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("spirit-finder-answers", JSON.stringify(answers));
    }
  }, [answers]);

  const availableQuestions = useMemo(() => getAvailableQuestions(answers), [answers]);

  const handleOptionSelect = (questionId: number, value: string) => {
    setInteractedQuestions((prev) => new Set(prev).add(questionId));
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < availableQuestions.length - 1) setCurrentStep((s) => s + 1);
    else setShowResult(true);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else router.push("/");
  };

  const onSaveProfile = useCallback((profileImage: string, veganType: string) => {
    localStorage.setItem("veggieverse-profile", JSON.stringify({ profileImage, veganType, savedAt: new Date().toISOString() }));
  }, []);

  const generateMonster = useCallback(() => {
    setIsGeneratingImage(true);
    // 이름/설명 생성 (향후 사용)
    generateMonsterName(selectedItems);
    generateMonsterDescription(selectedItems);
    setTimeout(() => { setMonsterImageUrl(null); setIsGeneratingImage(false); }, 2000);
  }, [selectedItems]);

  useEffect(() => {
    if (selectedItems.length > 0) generateMonster();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 결과 계산
  const calculateResult = useCallback(() => {
    if (Object.keys(answers).length === 0) return VEGAN_TYPES[0];
    let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;
    const dietSelections = Array.isArray(answers[1]) ? answers[1] : answers[1] ? [answers[1]] : [];
    const primaryDiet = (dietSelections as string[]).find((v) => PRIMARY_DIET_VALUES.includes(v)) || "none";
    if (["vegan", "lacto", "ovo", "lacto-ovo"].includes(primaryDiet)) { i++; j++; } else if (["flexitarian", "pescatarian", "pollo"].includes(primaryDiet)) { e++; p++; } else { e++; p++; }
    if (answers[3] === "traditional" || answers[3] === "simple") { s++; j++; } else if (answers[3]) { n++; p++; }
    if (answers[4] === "nutrition" || answers[4] === "convenience") { t++; } else if (answers[4]) { f++; }
    if (answers[5] === "family" || answers[5] === "experience") { f++; e++; } else if (answers[5]) { t++; i++; }
    if (answers[7] === "health" || answers[7] === "environment") { t++; j++; } else if (answers[7]) { f++; p++; }
    if (answers[6] === "regular") { j++; s++; } else if (answers[6] === "flexible") { p++; f++; } else if (answers[6] === "planned") { j++; t++; } else if (answers[6] === "spontaneous") { p++; n++; }
    const mbti = `${e >= i ? "E" : "I"}${n >= s ? "N" : "S"}${t >= f ? "T" : "F"}${j >= p ? "J" : "P"}`;
    return VEGAN_TYPES.find((type) => type.mbti === mbti) || VEGAN_TYPES[0];
  }, [answers]);

  const result = useMemo(() => (showResult ? calculateResult() : null), [showResult, calculateResult]);

  useEffect(() => {
    if (showResult && result && !user) {
      const username = `${result.name.replace(/\s+/g, "")}_${Date.now().toString(36).slice(-4)}`;
      login({ id: username, name: username, email: "", spiritName: result.name });
    }
  }, [showResult, result, user, login]);

  // ─── 결과 화면 ───
  if (showResult && result) {
    return (
      <SpiritResult
        result={result}
        selectedItems={selectedItems}
        isGeneratingImage={isGeneratingImage}
        monsterImageUrl={monsterImageUrl}
        onRegenerate={generateMonster}
        onSaveProfile={onSaveProfile}
      />
    );
  }

  // ─── 로딩 ───
  if (currentStep >= availableQuestions.length || currentStep < 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#B2B2B2" }}>
        <p className="text-stone-500">질문을 불러오는 중...</p>
      </div>
    );
  }

  // ─── 질문 화면 ───
  const currentQuestion = availableQuestions[currentStep];
  const progress = ((currentStep + 1) / availableQuestions.length) * 100;

  return (
    <TarotCardGrid
      question={currentQuestion}
      answers={answers}
      interactedQuestions={interactedQuestions}
      progress={progress}
      onSelect={handleOptionSelect}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}
