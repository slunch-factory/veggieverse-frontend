"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import type { VegetableItem } from "@/types";
import { useUser } from "@/contexts/UserContext";
import { TarotCardGrid } from "../_components/TarotCardGrid";
import { SpiritResult } from "../_components/SpiritResult";
import {
  STANDARD_QUESTIONS,
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

const ALLERGY_QUESTION_ID = 3;

const _publicBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const PLAN_LOADING_LOTTIE_SRC = `${_publicBase}/Loading%20Animation.json`;

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

  // Step 3: 알레르기 (개수 기반, "해당 없음" 제외)
  const allergies = ((answers[ALLERGY_QUESTION_ID] as string[] | undefined) ?? []).filter(
    (v) => v !== "no-allergy",
  );
  if (allergies.length >= 2) { j++; s++; }
  else if (allergies.length === 1) { t++; }
  else { p++; n++; }

  // Step 4: 매운맛 선호
  const spice = answers[4] as string | undefined;
  if (spice === "spicy-no") { i++; s++; f++; }
  else if (spice === "spicy-yes") { e++; n++; p++; }

  const mbti = `${e >= i ? "E" : "I"}${n >= s ? "N" : "S"}${t >= f ? "T" : "F"}${j >= p ? "J" : "P"}`;
  return VEGAN_TYPES.find((type) => type.mbti === mbti) || VEGAN_TYPES[0];
}

// ═══════════════════════════════════════════
// 메인 오케스트레이터
// ═══════════════════════════════════════════
export default function SpiritFinderStepPage() {
  const router = useRouter();
  const { user, login } = useUser();

  const questions: SurveyQuestion[] = STANDARD_QUESTIONS;

  const [selectedItems] = useState<VegetableItem[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("spirit-finder-selected-items") || "[]"); }
    catch { return []; }
  });

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  const [currentStep, setCurrentStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [interactedQuestions, setInteractedQuestions] = useState<Set<number>>(new Set());
  const [monsterImageUrl, setMonsterImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPreparingPlan, setIsPreparingPlan] = useState(false);
  const [planLoadingAnim, setPlanLoadingAnim] = useState<object | null>(null);

  useEffect(() => {
    localStorage.removeItem("spirit-finder-answers");
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("spirit-finder-answers", JSON.stringify(answers));
    }
  }, [answers]);

  const handleOptionSelect = (questionId: number, value: string) => {
    const hasInteractedWithQuestion = interactedQuestions.has(questionId);
    const question = questions.find((q) => q.id === questionId);
    if (question?.multiSelect) {
      setAnswers((prev) => {
        // 첫 클릭에서는 이전 세션(localStorage) 선택값을 무시하고
        // 현재 세션의 선택부터 시작하도록 보정한다.
        const current = hasInteractedWithQuestion
          ? (prev[questionId] as string[] | undefined) ?? []
          : [];
        if (questionId === ALLERGY_QUESTION_ID) {
          if (value === "no-allergy") {
            if (current.includes("no-allergy") && current.length === 1) {
              return { ...prev, [questionId]: [] };
            }
            return { ...prev, [questionId]: ["no-allergy"] };
          }
          const base = current.filter((v) => v !== "no-allergy");
          const updated = base.includes(value)
            ? base.filter((v) => v !== value)
            : [...base, value];
          return { ...prev, [questionId]: updated };
        }
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [questionId]: updated };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }

    setInteractedQuestions((prev) => new Set(prev).add(questionId));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) setCurrentStep((s) => s + 1);
    else setIsPreparingPlan(true);
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

  useEffect(() => {
    if (!isPreparingPlan) return;
    const timer = window.setTimeout(() => {
      router.push("/subscribe");
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [isPreparingPlan, router]);

  useEffect(() => {
    if (!isPreparingPlan) {
      setPlanLoadingAnim(null);
      return;
    }
    let cancelled = false;
    fetch(PLAN_LOADING_LOTTIE_SRC)
      .then((res) => res.json())
      .then((data: object) => {
        if (!cancelled) setPlanLoadingAnim(data);
      })
      .catch(() => {
        if (!cancelled) setPlanLoadingAnim(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isPreparingPlan]);

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FCFBF7" }}>
        <p className="text-stone-500">질문을 불러오는 중...</p>
      </div>
    );
  }

  // ─── 질문 화면 ───
  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div>
      <TarotCardGrid
        key={currentQuestion.id}
        question={currentQuestion}
        answers={answers}
        interactedQuestions={interactedQuestions}
        progress={progress}
        currentStep={currentStep + 1}
        totalSteps={questions.length}
        onSelect={handleOptionSelect}
        onNext={handleNext}
        onBack={handleBack}
      />
      {isPreparingPlan && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 md:p-7 shadow-xl text-center">
            {planLoadingAnim ? (
              <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center md:h-44 md:w-44">
                <Lottie animationData={planLoadingAnim} loop className="h-full w-full" />
              </div>
            ) : null}
            <p className="text-base md:text-lg text-stone-800 font-medium">
              사용자 맞춤형 구독 플랜을 생성 중입니다...
            </p>
            <p className="mt-2 text-sm text-stone-500">
              잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
