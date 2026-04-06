"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { VegetableItem } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { TarotCardGrid } from "../_components/TarotCardGrid";
import { SpiritResult } from "../_components/SpiritResult";
import {
  STANDARD_QUESTIONS,
  WITTY_QUESTIONS,
  type SurveyQuestion,
} from "../_data/surveyQuestions";

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

// ─── 설문 답변 → 스피릿 유형 계산 ───
function calculateSpiritType(answers: Record<number, string | string[]>) {
  let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;

  // Step 1: 식이유형
  const diet = answers[1] as string | undefined;
  if (diet === "vegan") { i++; j++; n++; }
  else if (diet === "pesco") { e++; p++; s++; }
  else if (diet === "pollo") { e++; p++; }

  // Step 2: 영양 목표
  const goals = (answers[2] as string[] | undefined) ?? [];
  if (goals.includes("plant-based")) { i++; f++; }
  if (goals.includes("low-carb")) { t++; j++; }
  if (goals.includes("low-calories")) { s++; j++; }
  if (goals.includes("high-protein")) { e++; t++; }
  if (goals.includes("low-sodium")) { i++; s++; }

  // Step 3: 알레르기 (개수 기반)
  const allergies = (answers[3] as string[] | undefined) ?? [];
  if (allergies.length >= 2) { j++; s++; }
  else if (allergies.length === 1) { t++; }
  else { p++; n++; }

  // Step 4: 매운맛
  const spice = answers[4] as string | undefined;
  if (spice === "mild") { i++; s++; f++; }
  else if (spice === "medium") { e++; n++; }
  else if (spice === "hot") { e++; n++; p++; }

  const mbti = `${e >= i ? "E" : "I"}${n >= s ? "N" : "S"}${t >= f ? "T" : "F"}${j >= p ? "J" : "P"}`;
  return VEGAN_TYPES.find((type) => type.mbti === mbti) || VEGAN_TYPES[0];
}

// ═══════════════════════════════════════════
// 메인 오케스트레이터
// ═══════════════════════════════════════════
export default function SpiritFinderStepPage() {
  const router = useRouter();
  const { user, login } = useUser();

  // 설문 버전 ("standard" | "witty")
  const [questionVersion, setQuestionVersion] = useState<"standard" | "witty">("witty");

  const questions: SurveyQuestion[] = useMemo(
    () => (questionVersion === "standard" ? STANDARD_QUESTIONS : WITTY_QUESTIONS),
    [questionVersion],
  );

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

  const handleOptionSelect = (questionId: number, value: string) => {
    setInteractedQuestions((prev) => new Set(prev).add(questionId));

    const question = questions.find((q) => q.id === questionId);
    if (question?.multiSelect) {
      setAnswers((prev) => {
        const current = (prev[questionId] as string[] | undefined) ?? [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [questionId]: updated };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) setCurrentStep((s) => s + 1);
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
    generateMonsterName(selectedItems);
    generateMonsterDescription(selectedItems);
    setTimeout(() => { setMonsterImageUrl(null); setIsGeneratingImage(false); }, 2000);
  }, [selectedItems]);

  useEffect(() => {
    if (selectedItems.length > 0) generateMonster();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const result = useMemo(
    () => (showResult ? calculateSpiritType(answers) : null),
    [showResult, answers],
  );

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
  if (currentStep >= questions.length || currentStep < 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#B2B2B2" }}>
        <p className="text-stone-500">질문을 불러오는 중...</p>
      </div>
    );
  }

  // ─── 질문 화면 ───
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="relative">
      {/* 버전 토글 */}
      <div className="absolute top-4 right-4 z-20 flex gap-1 bg-white/80 backdrop-blur-sm rounded-full p-1">
        <button
          onClick={() => setQuestionVersion("standard")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            questionVersion === "standard" ? "bg-[#8C451D] text-white" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          정석
        </button>
        <button
          onClick={() => setQuestionVersion("witty")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            questionVersion === "witty" ? "bg-[#8C451D] text-white" : "text-stone-500 hover:text-stone-800"
          }`}
        >
          위트
        </button>
      </div>

      <TarotCardGrid
        question={currentQuestion}
        answers={answers}
        interactedQuestions={interactedQuestions}
        progress={progress}
        onSelect={handleOptionSelect}
        onNext={handleNext}
        onBack={handleBack}
      />
    </div>
  );
}
