"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import type { SurveyQuestion } from "@/app/spirit/_data/surveyQuestions";
import type { SurveyAnswers } from "@/app/spirit/_types";
import { TarotCardGrid } from "@/app/spirit/_components/TarotCardGrid";
import { getAutoPlan } from "@/lib/api/spirit";

const ALLERGY_QUESTION_ID = 3;
const _publicBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const PLAN_LOADING_LOTTIE_SRC = `${_publicBase}/Loading%20Animation.json`;

interface SpiritStepClientProps {
  questions: SurveyQuestion[];
}

export function SpiritStepClient({ questions }: SpiritStepClientProps) {
  const router = useRouter();

  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [interactedQuestions, setInteractedQuestions] = useState<Set<number>>(new Set());
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
    const hasInteracted = interactedQuestions.has(questionId);
    const question = questions.find((q) => q.id === questionId);

    if (question?.multiSelect) {
      setAnswers((prev) => {
        const current = hasInteracted ? (prev[questionId] as string[] | undefined) ?? [] : [];
        if (questionId === ALLERGY_QUESTION_ID) {
          if (value === "no-allergy") {
            return {
              ...prev,
              [questionId]: current.includes("no-allergy") && current.length === 1 ? [] : ["no-allergy"],
            };
          }
          const base = current.filter((v) => v !== "no-allergy");
          return {
            ...prev,
            [questionId]: base.includes(value) ? base.filter((v) => v !== value) : [...base, value],
          };
        }
        return {
          ...prev,
          [questionId]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        };
      });
    } else {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
    }

    setInteractedQuestions((prev) => new Set(prev).add(questionId));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsPreparingPlan(true);
      // autoPlan + 최소 1.5초 로딩 표시를 병렬로 실행, 둘 다 완료되면 이동
      const [recommended] = await Promise.all([
        getAutoPlan(answers).catch(() => []),
        new Promise<void>((r) => setTimeout(r, 1500)),
      ]);
      if (recommended.length > 0) {
        sessionStorage.setItem("spirit-auto-plan", JSON.stringify(recommended));
      }
      router.push("/subscribe");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else router.push("/");
  };

  useEffect(() => {
    if (!isPreparingPlan) {
      setPlanLoadingAnim(null);
      return;
    }
    let cancelled = false;
    fetch(PLAN_LOADING_LOTTIE_SRC)
      .then((res) => res.json())
      .then((data: object) => { if (!cancelled) setPlanLoadingAnim(data); })
      .catch(() => { if (!cancelled) setPlanLoadingAnim(null); });
    return () => { cancelled = true; };
  }, [isPreparingPlan]);

  if (currentStep >= questions.length || currentStep < 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FCFBF7" }}>
        <p className="text-stone-500">질문을 불러오는 중...</p>
      </div>
    );
  }

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
            {planLoadingAnim && (
              <div className="mx-auto mb-4 flex h-36 w-36 items-center justify-center md:h-44 md:w-44">
                <Lottie animationData={planLoadingAnim} loop className="h-full w-full" />
              </div>
            )}
            <p className="text-base md:text-lg text-stone-800 font-medium">
              사용자 맞춤형 구독 플랜을 생성 중입니다...
            </p>
            <p className="mt-2 text-sm text-stone-500">잠시만 기다려 주세요.</p>
          </div>
        </div>
      )}
    </div>
  );
}
