'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';
import type { SurveyQuestion, SurveyOption } from '@/app/spirit/_data/surveyQuestions';
import type { SurveyAnswers } from '@/app/spirit/_types';
import type { MenuData } from '@/app/subscribe/_data/subscription';
import TarotFanDraw, { type CarouselOption } from './TarotFanDraw';
import { getAutoPlan } from '@/lib/api/spirit';
import { SelectRipple, type Ripple } from './SelectRipple';
import { QuestionHeadline } from './QuestionHeadline';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const ALLERGY_QUESTION_ID = 3;
const _base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const PLAN_LOADING_LOTTIE_SRC = `${_base}/Loading%20Animation.json`;

/** Lottie를 최소 노출하는 시간 — speculative prefetch가 시작된 시점부터 측정 */
const MIN_LOADING_MS = 1500;

/** 메인 페이지에서 고른 재료(FloatingItem[])를 담아둔 localStorage 키 */
const SELECTED_ITEMS_KEY = 'spirit-finder-selected-items';

/**
 * 메인에서 고른 재료의 구독 재료 id 목록을 추출 → autoPlan 추천 랭킹(ingredientIds)용.
 * 로컬 폴백 재료(API 없이 띄운 것)는 id가 없어 자동 제외된다.
 */
function readSelectedIngredientIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SELECTED_ITEMS_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<{ ingredientId?: number }>;
    return items
      .map((i) => i?.ingredientId)
      .filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
}

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

interface Props {
  questions: SurveyQuestion[];
}

/** 우측 스텝 패널에 쓰는 짧은 라벨(질문은 너무 길어 별도). id별, 없으면 STEP N. */
const STEP_TITLES: Record<number, string> = {
  1: '식이유형',
  2: '영양 목표',
  3: '제외 항목',
};

export function SpiritStepClient3D({ questions }: Props) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [interactedQuestions, setInteractedQuestions] = useState<Set<number>>(new Set());
  const [isPreparingPlan, setIsPreparingPlan] = useState(false);
  const [planLoadingAnim, setPlanLoadingAnim] = useState<object | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [, setCenterOpt] = useState<CarouselOption | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  /** Speculative prefetching: 마지막 단계 진입 시점에 부분 답변으로 추천 API를 미리 호출.
   *  사용자가 마지막 질문에 답하는 시간(평균 수 초)을 네트워크 왕복 시간으로 흡수한다. */
  const speculativeRef = useRef<SpeculativeCache | null>(null);

  useEffect(() => {
    localStorage.removeItem('spirit-finder-answers');
  }, []);

  /** 마지막 단계 진입 + 답변 변경 시 speculative 요청 발사/갱신 */
  useEffect(() => {
    if (currentStep !== questions.length - 1) return;

    const key = buildAnswerKey(answers);
    if (speculativeRef.current?.key === key) return;

    speculativeRef.current?.ctrl.abort();
    const ctrl = new AbortController();
    const perfStart = performance.now();
    const promise = getAutoPlan(answers, { signal: ctrl.signal, ingredientIds: readSelectedIngredientIds() })
      .then((result) => {
        console.log(
          `%c[spirit] 📊 speculative API 응답 ${(performance.now() - perfStart).toFixed(0)}ms`,
          'color: #2563eb; font-weight: bold;',
        );
        return result;
      })
      .catch(() => [] as MenuData[]);
    speculativeRef.current = { key, promise, ctrl, startedAt: Date.now() };
    console.log(
      '%c[spirit] speculative prefetch 시작',
      'color: #2563eb; font-weight: bold;',
    );
  }, [currentStep, questions.length, answers]);

  /** 언마운트 시 in-flight 요청 정리 */
  useEffect(
    () => () => {
      speculativeRef.current?.ctrl.abort();
    },
    [],
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('spirit-finder-answers', JSON.stringify(answers));
    }
  }, [answers]);

  // ── 선택 피드백 ripple (덱으로 날아가는 카드 연출은 제거 — 카드가 중앙에 직접 공개됨) ──
  const flashRipple = useCallback((screenX: number, screenY: number) => {
    const rippleId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: rippleId, x: screenX, y: screenY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 900);
  }, []);

  // ── Option select handler ──────────────────────────────────────────
  const handleOptionSelect = useCallback((questionId: number, value: string, screenX?: number, screenY?: number) => {
    const hasInteracted = interactedQuestions.has(questionId);
    const question = questions.find((q) => q.id === questionId);

    if (question?.multiSelect) {
      // 클로저의 answers 기준으로 "추가/제거"를 미리 판정 — setAnswers updater 내부에서는
      // side effect(triggerFly)를 호출하지 않는다 (React 18 strict mode에서 updater가
      // 두 번 실행되어 fly card·ripple이 중복 생성되는 버그 방지).
      const current = hasInteracted ? (answers[questionId] as string[] | undefined) ?? [] : [];
      let isAdding: boolean;
      if (questionId === ALLERGY_QUESTION_ID) {
        if (value === 'no-allergy') {
          isAdding = !(current.includes('no-allergy') && current.length === 1);
        } else {
          isAdding = !current.includes(value);
        }
      } else {
        isAdding = !current.includes(value);
      }

      setAnswers((prev) => {
        const cur = interactedQuestions.has(questionId)
          ? (prev[questionId] as string[] | undefined) ?? []
          : [];
        let nextVals: string[];
        if (questionId === ALLERGY_QUESTION_ID) {
          if (value === 'no-allergy') {
            nextVals = cur.includes('no-allergy') && cur.length === 1 ? [] : ['no-allergy'];
          } else {
            const base = cur.filter((v) => v !== 'no-allergy');
            nextVals = base.includes(value) ? base.filter((v) => v !== value) : [...base, value];
          }
        } else {
          nextVals = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
        }
        return { ...prev, [questionId]: nextVals };
      });

      if (isAdding && screenX !== undefined && screenY !== undefined) {
        flashRipple(screenX, screenY);
      }
    } else {
      const currentVal = answers[questionId] as string | undefined;
      if (currentVal === value && interactedQuestions.has(questionId)) {
        // 같은 카드 다시 = 선택 취소
        setAnswers((prev) => { const next = { ...prev }; delete next[questionId]; return next; });
      } else {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        if (screenX !== undefined && screenY !== undefined) flashRipple(screenX, screenY);
        // 단일선택 새로 고름 → 중앙 공개 카드를 잠깐 보여준 뒤 다음 스텝으로 자동 이동.
        setTimeout(() => {
          setCenterOpt(null);
          setCurrentStep((s) => (s < questions.length - 1 ? s + 1 : s));
        }, 700);
      }
    }

    setInteractedQuestions((prev) => new Set(prev).add(questionId));
  }, [answers, interactedQuestions, questions, flashRipple]);

  /** 우측 패널에서 스텝 이동 */
  const goToStep = (idx: number) => {
    setCenterOpt(null);
    setCurrentStep(idx);
  };

  /** 전부 선택되면 자동 실행되는 autoPlan + /subscribe 이동 (다음 버튼 대체) */
  const runAutoPlan = useCallback(async () => {
    /** 📊 측정: 트리거 시점 (= 체감 로딩 시작) */
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
        '%c[spirit] cache HIT — speculative 결과 await',
        'color: #4A7F52; font-weight: bold;',
      );
      try {
        recommended = await cached!.promise;
      } catch {
        /* abort 또는 실패 — fresh fetch로 fallback */
      }
    } else {
      console.log(
        '%c[spirit] cache MISS — fresh fetch',
        'color: #d97706; font-weight: bold;',
      );
    }

    if (recommended.length === 0) {
      recommended = await getAutoPlan(answers, { ingredientIds: readSelectedIngredientIds() }).catch(() => []);
    }

    const elapsed = Date.now() - loadingStartedAt;
    const remainingWait = Math.max(0, MIN_LOADING_MS - elapsed);
    if (remainingWait > 0) {
      await new Promise<void>((r) => setTimeout(r, remainingWait));
    }

    if (recommended.length > 0) {
      sessionStorage.setItem('spirit-auto-plan', JSON.stringify(recommended));
      // 카드 타로를 거쳐 구독으로 진입할 때만 스포트라이트 튜토리얼 1회 노출
      sessionStorage.setItem('spirit-tutorial', '1');
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
      `%c[spirit] 📊 클릭→이동 ${clickToNavigate.toFixed(0)}ms (cache ${cacheHit ? 'HIT' : 'MISS'}) | n=${w.__spiritMetrics.length} P50=${p50.toFixed(0)}ms hitRate=${hitRate.toFixed(0)}%`,
      'color: #7c3aed; font-weight: bold; font-size: 13px;',
    );

    router.push('/subscribe');
  }, [answers, router]);

  /** 필수 질문이 다 채워졌는지 — 제외 스텝(알레르기·매운맛)은 선택 안 해도 됨(optional).
   *  채워지면 "나의 구독 스케줄 확인하기" 버튼이 떠 runAutoPlan을 트리거한다. */
  const canFinish = questions.every((qq) => {
    if (qq.id === ALLERGY_QUESTION_ID) return true; // 제외 스텝은 선택 없이도 통과
    const a = answers[qq.id];
    return Array.isArray(a) ? a.length > 0 : a != null && a !== '';
  });

  useEffect(() => {
    if (!isPreparingPlan) { setPlanLoadingAnim(null); return; }
    let cancelled = false;
    fetch(PLAN_LOADING_LOTTIE_SRC)
      .then((r) => r.json())
      .then((data: object) => { if (!cancelled) setPlanLoadingAnim(data); })
      .catch(() => { if (!cancelled) setPlanLoadingAnim(null); });
    return () => { cancelled = true; };
  }, [isPreparingPlan]);

  if (currentStep >= questions.length || currentStep < 0) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#868686' }}>
        <p style={{ color: '#2D5A27' }}>질문을 불러오는 중...</p>
      </div>
    );
  }

  const q = questions[currentStep];
  const totalSteps = questions.length;
  const stepNum = currentStep + 1;
  const isMulti = !!q.multiSelect;

  const selectedValues = (() => {
    const ans = answers[q.id];
    if (!interactedQuestions.has(q.id)) return [];
    if (Array.isArray(ans)) return ans;
    if (typeof ans === 'string') return [ans];
    return [];
  })();

  const progressPct = (stepNum / totalSteps) * 100;

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100dvh - var(--header-area-h, 96px))', overflow: 'hidden', background: '#868686' }}>

      {/* ── 선택 ripple 글로우 ──────────────────────────────────── */}
      <SelectRipple ripples={ripples} />

      {/* ── 3D Carousel — fills entire screen ───────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          style={{ position: 'absolute', inset: 0 }}
          initial={{ y: 64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <TarotFanDraw
            options={q.options}
            selectedValues={selectedValues}
            onSelect={(value, sx, sy) => handleOptionSelect(q.id, value, sx, sy)}
            onCenterChange={setCenterOpt}
            isMobile={isMobile}
            isMulti={isMulti}
            isExclusion={q.id === ALLERGY_QUESTION_ID}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── 우측 스텝 패널 (덱 대체): 스텝별 선택 카드+라벨, 클릭해 이동 ── */}
      <StepPanel
        questions={questions}
        answers={answers}
        currentStep={currentStep}
        onSelectStep={goToStep}
        isMobile={isMobile}
      />

      {/* ── 완료 버튼 — 필수 선택이 끝나면 등장. autoPlan 트리거(다음 버튼 대체) ── */}
      <AnimatePresence>
        {canFinish && !isPreparingPlan && (
          <motion.button
            key="finish-btn"
            type="button"
            onClick={() => { void runAutoPlan(); }}
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              boxShadow: [
                '0 0 0 rgba(213,254,0,0.0)',
                '0 0 24px rgba(213,254,0,0.7)',
                '0 0 0 rgba(213,254,0,0.0)',
              ],
            }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ opacity: { duration: 0.3 }, y: { duration: 0.3 }, boxShadow: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              position: 'absolute',
              bottom: isMobile ? '1.5rem' : '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 46,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: isMobile ? '13px 24px' : '15px 32px',
              borderRadius: 999,
              border: '1px solid #250a00',
              background: '#dcfd4a',
              color: '#250a00',
              fontSize: isMobile ? 14 : 16,
              fontWeight: 700,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            나의 구독 스케줄 확인하기 →
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Top overlay: step + question (dark, left-aligned) ──── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(33,33,33,0.88) 0%, rgba(33,33,33,0.55) 70%, transparent 100%)',
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            style={{ padding: '2rem 2rem 4rem 2rem' }}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -22, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Step counter + progress bar (게임 HUD) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '0 0 1rem',
              maxWidth: 360,
              pointerEvents: 'auto',
            }}>
              <motion.p
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.65rem, 1.3vw, 0.78rem)',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#D5FE00',
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                  textShadow: '0 0 12px rgba(213,254,0,0.35)',
                }}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              >
                {String(stepNum).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
              </motion.p>
              {/* progress bar 트랙 */}
              <div style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: 'rgba(213,254,0,0.12)',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4)',
              }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #D5FE00 0%, #cbed7f 100%)',
                    borderRadius: 2,
                    boxShadow: '0 0 12px rgba(213,254,0,0.7)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* shimmer */}
                <motion.div
                  style={{
                    position: 'absolute', top: 0, bottom: 0, width: 60,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                    pointerEvents: 'none',
                  }}
                  animate={{ x: ['-60px', '320px'] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* 글자 wave 헤드라인 */}
            <QuestionHeadline text={q.question} stepKey={currentStep} />

            {(q.subtitle || isMulti) && (
              <motion.p
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.7rem, 1.5vw, 0.88rem)',
                  color: 'rgba(213,254,0,0.55)',
                  letterSpacing: '0.03em',
                  wordBreak: 'keep-all',
                }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {q.subtitle}{isMulti ? ' · 복수 선택 가능' : ''}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom gradient overlay ───────────────────────────────── */}
      {/* 하단 다크 그라데이션 + 중앙 description 패널 — 사용자 요청으로 제거됨.
          각 카드 하단에 자체 description이 보이도록 TarotCarousel3DSurvey가 표시함. */}

      {/* ── Plan loading overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {isPreparingPlan && (
          <motion.div
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(33,33,33,0.82)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{
                width: '100%', maxWidth: 420,
                borderRadius: 20,
                background: 'rgba(28,28,28,0.96)',
                border: '1px solid rgba(136,100,255,0.3)',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: '0 0 60px rgba(136,100,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 카드 셔플 모션 (Lottie 위에 떠있는 작은 카드 3장) */}
              <div style={{ position: 'relative', height: 140, marginBottom: '1rem' }}>
                {planLoadingAnim && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 140, height: 140 }}>
                      <Lottie animationData={planLoadingAnim} loop={!reducedMotion} autoplay={!reducedMotion} style={{ width: '100%', height: '100%' }} />
                    </div>
                  </div>
                )}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 28,
                      height: 42,
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #D5FE00 0%, #cbed7f 100%)',
                      border: '1px solid rgba(213,254,0,0.6)',
                      boxShadow: '0 4px 18px rgba(213,254,0,0.45)',
                      marginLeft: -14,
                      marginTop: -21,
                    }}
                    animate={{
                      x: [0, (i - 1) * 60, 0],
                      y: [0, -4, 0],
                      rotate: [0, (i - 1) * 25, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1.8,
                      delay: i * 0.18,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              <motion.p
                style={{
                  fontSize: 'clamp(0.9rem,2vw,1.1rem)',
                  color: '#D5FE00',
                  letterSpacing: '0.05em',
                  margin: 0,
                }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                당신의 식취향을 분석 중입니다...
              </motion.p>
              <p style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'rgba(213,254,0,0.45)' }}>
                카드를 펼쳐 운명의 식탁을 그리는 중
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
 * 우측 스텝 패널 — 스텝별로 어떤 카드를 골랐는지 카드+텍스트로 보여주고,
 * 클릭하면 해당 섹션으로 이동한다. (다음/이전 버튼 대체)
 * 데스크톱: 우측 세로 / 모바일: 상단 가로.
 * ───────────────────────────────────────────────────────────────────── */
function StepPanel({
  questions,
  answers,
  currentStep,
  onSelectStep,
  isMobile,
}: {
  questions: SurveyQuestion[];
  answers: SurveyAnswers;
  currentStep: number;
  onSelectStep: (idx: number) => void;
  isMobile: boolean;
}) {
  const rows = questions.map((q, idx) => {
    const ans = answers[q.id];
    const vals = Array.isArray(ans) ? ans : ans != null && ans !== '' ? [ans] : [];
    const cards = vals
      .map((v) => q.options.find((o) => o.value === v))
      .filter((o): o is SurveyOption => o !== undefined);
    return {
      key: q.id,
      idx,
      cards,
      title: STEP_TITLES[q.id] ?? `STEP ${idx + 1}`,
      answered: cards.length > 0,
      active: idx === currentStep,
    };
  });

  const Thumb = ({ src }: { src?: string }) => (
    <div
      style={{
        width: isMobile ? 26 : 34,
        height: isMobile ? 38 : 50,
        borderRadius: 5,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'rgba(37,10,0,0.5)',
        border: '1px solid rgba(220,253,74,0.25)',
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 0,
          right: 0,
          zIndex: 40,
          display: 'flex',
          gap: 6,
          padding: '0 10px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {rows.map(({ key, idx, cards, title, answered, active }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelectStep(idx)}
            style={{
              flex: '1 0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 8px',
              borderRadius: 8,
              cursor: 'pointer',
              background: active ? 'rgba(220,253,74,0.16)' : 'rgba(28,16,8,0.55)',
              border: `1px solid ${active ? 'rgba(220,253,74,0.8)' : 'rgba(255,255,255,0.12)'}`,
              backdropFilter: 'blur(6px)',
            }}
          >
            <Thumb src={answered ? cards[0]?.tarot?.image : undefined} />
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 9, color: 'rgba(213,254,0,0.7)', whiteSpace: 'nowrap' }}>{idx + 1} · {title}</div>
              <div style={{ fontSize: 11, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
                {answered ? cards.map((c) => c.label).join(', ') : '선택 전'}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 296,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 10,
        padding: '0 20px',
        background: 'linear-gradient(to left, rgba(20,10,4,0.62) 35%, transparent)',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: 11, letterSpacing: '0.14em', color: 'rgba(213,254,0,0.6)', textTransform: 'uppercase' }}>
        My Selection
      </p>
      {rows.map(({ key, idx, cards, title, answered, active }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelectStep(idx)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 10,
            cursor: 'pointer',
            textAlign: 'left',
            background: active ? 'rgba(220,253,74,0.14)' : 'rgba(28,16,8,0.5)',
            border: `1px solid ${active ? 'rgba(220,253,74,0.85)' : 'rgba(255,255,255,0.12)'}`,
            boxShadow: active ? '0 0 18px rgba(220,253,74,0.25)' : 'none',
            backdropFilter: 'blur(6px)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        >
          <Thumb src={answered ? cards[0]?.tarot?.image : undefined} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.04em', color: 'rgba(213,254,0,0.7)', marginBottom: 3 }}>
              STEP {idx + 1} · {title}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: answered ? '#fff' : 'rgba(255,255,255,0.4)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {answered ? cards.map((c) => c.label).join(', ') : '선택 전'}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
