"use client";

import { useState, useEffect, useRef } from "react";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import type { SurveyQuestion } from "@/app/spirit/_data/surveyQuestions";
import type { SurveyAnswers } from "@/app/spirit/_types";
import type { MenuData } from "@/app/subscribe/_data/subscription";
import { TarotCardGrid } from "@/app/spirit/_components/TarotCardGrid";
import { getAutoPlan } from "@/lib/api/spirit";

const ALLERGY_QUESTION_ID = 3;
const _publicBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const PLAN_LOADING_LOTTIE_SRC = `${_publicBase}/Loading%20Animation.json`;

/** Lottie를 최소 노출하는 시간 — speculative prefetch가 시작된 시점부터 측정 */
const MIN_LOADING_MS = 1500;

/**
 * Speculative prefetching 캐시
 * - key: 답변을 정규화 직렬화한 해시
 * - promise: in-flight 또는 완료된 getAutoPlan 결과
 * - ctrl:  요청 취소를 위한 AbortController
 * - startedAt: 최소 로딩 시간 계산용 시작 시각
 */
interface SpeculativeCache {
  key: string;
  promise: Promise<MenuData[]>;
  ctrl: AbortController;
  startedAt: number;
}

/** 답변을 캐시 키로 직렬화. 배열은 정렬하여 선택 순서 차이로 인한 false miss 방지. */
function buildAnswerKey(answers: SurveyAnswers): string {
  const normalized = Object.fromEntries(
    Object.entries(answers).map(([k, v]) => [
      k,
      Array.isArray(v) ? [...v].sort() : v,
    ]),
  );
  return JSON.stringify(normalized);
}

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

  /** Speculative prefetching: 마지막 단계 진입 시점에 부분 답변으로 추천 API를 미리 호출.
   *  사용자가 마지막 질문에 답하는 시간(평균 수 초)을 네트워크 왕복 시간으로 흡수한다. */
  const speculativeRef = useRef<SpeculativeCache | null>(null);
  const isLastStep = currentStep === questions.length - 1;

  useEffect(() => {
    localStorage.removeItem("spirit-finder-answers");
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem("spirit-finder-answers", JSON.stringify(answers));
    }
  }, [answers]);

  /** 마지막 단계 진입 + 답변 변경 시 speculative 요청 발사/갱신 */
  useEffect(() => {
    if (!isLastStep) return;

    const key = buildAnswerKey(answers);
    // 동일 답변에 대한 요청이 이미 in-flight 또는 완료 — 재발사 불필요
    if (speculativeRef.current?.key === key) return;

    // 다른 키 — 이전 요청 abort 후 새 요청
    speculativeRef.current?.ctrl.abort();
    const ctrl = new AbortController();
    const perfStart = performance.now();
    const promise = getAutoPlan(answers, { signal: ctrl.signal })
      .then((result) => {
        console.log(
          `%c[spirit] 📊 speculative API 응답 ${(performance.now() - perfStart).toFixed(0)}ms`,
          "color: #2563eb; font-weight: bold;",
        );
        return result;
      })
      .catch(() => [] as MenuData[]);
    speculativeRef.current = { key, promise, ctrl, startedAt: Date.now() };
    console.log(
      "%c[spirit] speculative prefetch 시작",
      "color: #2563eb; font-weight: bold;",
    );
  }, [isLastStep, answers]);

  /** 언마운트 시 in-flight 요청 정리 — 메모리 누수 및 stale response race 차단 */
  useEffect(
    () => () => {
      speculativeRef.current?.ctrl.abort();
    },
    [],
  );

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
      return;
    }

    /** 📊 측정: 사용자가 "다음" 클릭한 시점 (= 체감 로딩 시작) */
    const clickedAt = performance.now();
    setIsPreparingPlan(true);

    const key = buildAnswerKey(answers);
    const cached = speculativeRef.current;
    const cacheHit = cached?.key === key;
    // 최소 로딩 시간은 speculative 시작 시점부터 측정 — 사용자가 마지막 단계에서
    // 오래 머물렀다면 이미 prefetch가 완료되어 추가 로딩 없이 즉시 이동 가능.
    const loadingStartedAt = cached?.startedAt ?? Date.now();

    let recommended: MenuData[] = [];
    if (cacheHit) {
      console.log(
        "%c[spirit] cache HIT — speculative 결과 await",
        "color: #4A7F52; font-weight: bold;",
      );
      try {
        recommended = await cached!.promise;
      } catch {
        /* abort 또는 실패 — fresh fetch로 fallback */
      }
    } else {
      console.log(
        "%c[spirit] cache MISS — fresh fetch",
        "color: #d97706; font-weight: bold;",
      );
    }

    // cache miss이거나 speculative 결과가 비어있으면 fresh fetch
    if (recommended.length === 0) {
      recommended = await getAutoPlan(answers).catch(() => []);
    }

    // 최소 로딩 시간 보장
    const elapsed = Date.now() - loadingStartedAt;
    const remainingWait = Math.max(0, MIN_LOADING_MS - elapsed);
    if (remainingWait > 0) {
      await new Promise<void>((r) => setTimeout(r, remainingWait));
    }

    if (recommended.length > 0) {
      sessionStorage.setItem("spirit-auto-plan", JSON.stringify(recommended));
    }

    /** 📊 측정: 클릭 → 이동까지의 총 체감 로딩 시간 + P50 자동 집계 */
    const clickToNavigate = performance.now() - clickedAt;
    type Sample = { ms: number; cacheHit: boolean };
    const w = window as Window & { __spiritMetrics?: Sample[] };
    w.__spiritMetrics ??= [];
    w.__spiritMetrics.push({ ms: clickToNavigate, cacheHit });
    const sorted = [...w.__spiritMetrics].sort((a, b) => a.ms - b.ms);
    const p50 = sorted[Math.floor(sorted.length / 2)].ms;
    const hitRate =
      (w.__spiritMetrics.filter((m) => m.cacheHit).length / w.__spiritMetrics.length) * 100;
    console.log(
      `%c[spirit] 📊 클릭→이동 ${clickToNavigate.toFixed(0)}ms (cache ${cacheHit ? "HIT" : "MISS"}) | n=${w.__spiritMetrics.length} P50=${p50.toFixed(0)}ms hitRate=${hitRate.toFixed(0)}%`,
      "color: #7c3aed; font-weight: bold; font-size: 13px;",
    );

    router.push("/subscribe");
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
