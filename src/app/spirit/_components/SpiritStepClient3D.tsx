'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';
import type { SurveyQuestion, SurveyOption } from '@/app/spirit/_data/surveyQuestions';
import type { SurveyAnswers } from '@/app/spirit/_types';
import type { MenuData } from '@/app/subscribe/_data/subscription';
import TarotCarousel3DSurvey, { type CarouselOption } from './TarotCarousel3DSurvey';
import { getAutoPlan } from '@/lib/api/spirit';
import { SelectRipple, type Ripple } from './SelectRipple';
import { QuestionHeadline } from './QuestionHeadline';

const ALLERGY_QUESTION_ID = 3;
const _base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const PLAN_LOADING_LOTTIE_SRC = `${_base}/Loading%20Animation.json`;

/** Lottie를 최소 노출하는 시간 — speculative prefetch가 시작된 시점부터 측정 */
const MIN_LOADING_MS = 1500;

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

interface FlyCard {
  id: number;
  image: string;
  fromX: number;
  fromY: number;
  spin: number;        // random rotation during flight
  flying: boolean;     // false = at source (no transition), true = flying to deck
  targetX: number;     // 측정된 deck 새 카드 슬롯 X (flying:true 시점에 채워짐)
  targetY: number;     // 측정된 deck 새 카드 슬롯 Y
}

interface Props {
  questions: SurveyQuestion[];
}

export function SpiritStepClient3D({ questions }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [interactedQuestions, setInteractedQuestions] = useState<Set<number>>(new Set());
  const [isPreparingPlan, setIsPreparingPlan] = useState(false);
  const [planLoadingAnim, setPlanLoadingAnim] = useState<object | null>(null);
  const [flyCards, setFlyCards] = useState<FlyCard[]>([]);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [, setCenterOpt] = useState<CarouselOption | null>(null);
  const [nextBtnState, setNextBtnState] = useState<'idle' | 'hover' | 'active' | 'focus'>('idle');
  const [backBtnState, setBackBtnState] = useState<'idle' | 'hover' | 'active' | 'focus'>('idle');
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const deckRef = useRef<HTMLDivElement>(null);

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
    const promise = getAutoPlan(answers, { signal: ctrl.signal })
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

  // ── Derive deck groups from current answers ────────────────────────
  // Each group = one question's selected cards; multi-select groups render as a row
  const deckGroups = useMemo(() => {
    return questions.flatMap((q) => {
      const ans = answers[q.id];
      if (!ans) return [];
      const vals = Array.isArray(ans) ? ans : [ans];
      const cards = vals
        .map((v) => q.options.find((o) => o.value === v))
        .filter((o): o is SurveyOption => o !== undefined);
      if (cards.length === 0) return [];
      return [{ questionId: q.id, isMulti: !!q.multiSelect, cards }];
    });
  }, [answers, questions]);

  // ── Fly animation trigger ─────────────────────────────────────────
  const triggerFly = useCallback((option: SurveyOption, screenX: number, screenY: number) => {
    // ripple은 카드 이미지 유무와 관계없이 발생 (선택 피드백)
    const rippleId = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id: rippleId, x: screenX, y: screenY }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 900);

    if (!option.tarot?.image) return;
    const id = Date.now() + Math.random();
    const spin = (Math.random() - 0.5) * 40; // random tilt during flight

    // Step 1: render at source (no transition)
    setFlyCards((prev) => [
      ...prev,
      { id, image: option.tarot!.image, fromX: screenX, fromY: screenY, spin, flying: false, targetX: 0, targetY: 0 },
    ]);

    // Step 2: 다음 페인트 이후 → deck rect 측정(이 시점엔 새 카드가 이미 추가됨) → 비행 시작
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = deckRef.current?.getBoundingClientRect();
        let targetX = (typeof window !== 'undefined' ? window.innerWidth : 800) - 50;
        let targetY = 60;
        if (rect) {
          if (window.innerWidth < 768) {
            targetX = rect.right - 30;
            targetY = rect.top + rect.height / 2;
          } else {
            targetX = rect.left + rect.width / 2;
            targetY = rect.bottom - 30;
          }
        }
        setFlyCards((prev) => prev.map((c) => c.id === id ? { ...c, flying: true, targetX, targetY } : c));
      });
    });

    // Step 3: remove after animation completes
    setTimeout(() => {
      setFlyCards((prev) => prev.filter((c) => c.id !== id));
    }, 900);
  }, []);

  // ── Option select handler ──────────────────────────────────────────
  const handleOptionSelect = useCallback((questionId: number, value: string, screenX?: number, screenY?: number) => {
    const hasInteracted = interactedQuestions.has(questionId);
    const question = questions.find((q) => q.id === questionId);
    const option = question?.options.find((o) => o.value === value);

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

      if (isAdding && option && screenX !== undefined && screenY !== undefined) {
        triggerFly(option, screenX, screenY);
      }
    } else {
      const currentVal = answers[questionId] as string | undefined;
      if (currentVal === value && interactedQuestions.has(questionId)) {
        setAnswers((prev) => { const next = { ...prev }; delete next[questionId]; return next; });
      } else {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
        if (option && screenX !== undefined && screenY !== undefined) {
          triggerFly(option, screenX, screenY);
        }
      }
    }

    setInteractedQuestions((prev) => new Set(prev).add(questionId));
  }, [answers, interactedQuestions, questions, triggerFly]);

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCenterOpt(null);
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
      recommended = await getAutoPlan(answers).catch(() => []);
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
  };

  const handleBack = () => {
    setCenterOpt(null);
    if (currentStep > 0) setCurrentStep((s) => s - 1);
    else router.push('/');
  };

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
  const isLastStep = stepNum === totalSteps;
  const isMulti = !!q.multiSelect;

  const selectedValues = (() => {
    const ans = answers[q.id];
    if (!interactedQuestions.has(q.id)) return [];
    if (Array.isArray(ans)) return ans;
    if (typeof ans === 'string') return [ans];
    return [];
  })();

  const hasSelection = selectedValues.length > 0;
  const showNext = isMulti || stepNum === 1 || isLastStep;
  const nextDisabled = showNext && !hasSelection;

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
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <TarotCarousel3DSurvey
            options={q.options}
            selectedValues={selectedValues}
            onSelect={(value, sx, sy) => handleOptionSelect(q.id, value, sx, sy)}
            onCenterChange={setCenterOpt}
            isMobile={isMobile}
            isExclusion={q.id === ALLERGY_QUESTION_ID}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Deck ─────────────────────────────────────────────────── */}
      <div
        ref={deckRef}
        style={isMobile ? {
          position: 'absolute',
          top: '20%',
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          padding: '4px 16px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } : {
          position: 'fixed',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 14,
          maxHeight: 'calc(100dvh - 260px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          padding: '2px 2px 2px 0',
        }}
      >
        {deckGroups.length === 0 ? (
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 rgba(136,100,255,0.0)',
                '0 0 14px rgba(136,100,255,0.45)',
                '0 0 0 rgba(136,100,255,0.0)',
              ],
              scale: [1, 1.04, 1],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: isMobile ? 45 : 44,
              height: isMobile ? 72 : 72,
              borderRadius: 8,
              border: '1.5px dashed rgba(136,100,255,0.3)',
              background: 'rgba(33,33,33,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: 16, color: 'rgba(136,100,255,0.7)', display: 'inline-block' }}
            >
              ✦
            </motion.span>
          </motion.div>
        ) : (
          deckGroups.map((group) => {
            const n = group.cards.length;
            const CARD_W = isMobile ? 45 : 34;
            const CARD_H = isMobile ? 72 : 56;
            const STACK_X = 5; // px offset per card (right)
            const STACK_Y = 3; // px offset per card (down)

            if (group.isMulti && n > 1) {
              const ROW_H = isMobile ? 104 : 88;  // pad(10) + image + gap(5) + label(~13) + buffer
              const ROW_W = isMobile ? 60 : 60;
              const OVERLAP = isMobile ? 8 : 10; // visible strip per stacked card
              return (
                <motion.div
                  key={group.questionId}
                  layout
                  initial={{ opacity: 0, scale: 0.6, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                  style={{
                    position: 'relative',
                    width: ROW_W + (n - 1) * OVERLAP,
                    height: ROW_H,
                    flexShrink: 0,
                  }}
                >
                  {group.cards.map((card, cardIdx) => {
                    const offset = n - 1 - cardIdx; // 0 = right (oldest), n-1 = left (newest)
                    return (
                      <motion.div
                        key={card.value}
                        layout
                        initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: offset * OVERLAP,
                          width: ROW_W,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 5,
                          background: 'rgba(28,28,28,0.92)',
                          borderRadius: isMobile ? 8 : 10,
                          padding: isMobile ? '5px 5px' : '5px 6px',
                          border: '1px solid rgba(213,254,0,0.2)',
                          boxShadow: '0 2px 14px rgba(0,0,0,0.5), 0 0 8px rgba(136,100,255,0.12)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          zIndex: cardIdx + 1,
                        }}
                      >
                        <div style={{ width: CARD_W, height: CARD_H, borderRadius: isMobile ? 7 : 6, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                          {card.tarot?.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={card.tarot.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'rgba(136,100,255,0.18)' }} />
                          )}
                        </div>
                        <span style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.82)',
                          letterSpacing: '0.03em',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                          textAlign: 'center',
                        }}>
                          {card.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            }

            // Single card (or single-select group): original style
            return (
              <motion.div
                key={group.questionId}
                layout
                initial={{ opacity: 0, scale: 0.55, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  justifyContent: 'flex-end',
                  gap: isMobile ? 4 : 6,
                  flexShrink: 0,
                }}
              >
                {group.cards.map((card) => (
                  isMobile ? (
                    <div
                      key={card.value}
                      style={{
                        background: 'rgba(28,28,28,0.88)',
                        borderRadius: 8,
                        padding: 3,
                        border: '1px solid rgba(213,254,0,0.2)',
                        boxShadow: '0 2px 14px rgba(0,0,0,0.5), 0 0 8px rgba(136,100,255,0.12)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: 45, height: 72, borderRadius: 7, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                        {card.tarot?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={card.tarot.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'rgba(136,100,255,0.18)' }} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={card.value}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 5,
                        background: 'rgba(28,28,28,0.88)',
                        borderRadius: 10,
                        padding: '5px 6px',
                        border: '1px solid rgba(213,254,0,0.2)',
                        boxShadow: '0 2px 14px rgba(0,0,0,0.5), 0 0 8px rgba(136,100,255,0.12)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        width: 60,
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ width: 34, height: 56, borderRadius: 6, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                        {card.tarot?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={card.tarot.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'rgba(136,100,255,0.18)' }} />
                        )}
                      </div>
                      <span style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.82)',
                        letterSpacing: '0.03em',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                        textAlign: 'center',
                      }}>
                        {card.label}
                      </span>
                    </div>
                  )
                ))}
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── Flying cards ─────────────────────────────────────────── */}
      {flyCards.map((fc) => (
        <div
          key={fc.id}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 64,
            height: 106,
            pointerEvents: 'none',
            zIndex: 200,
            borderRadius: 8,
            overflow: 'hidden',
            transformOrigin: '50% 50%',
            willChange: 'transform, opacity',
            transform: fc.flying
              ? `translate(${fc.targetX - 32}px, ${fc.targetY - 53}px) scale(0.22) rotate(${fc.spin}deg)`
              : `translate(${fc.fromX - 32}px, ${fc.fromY - 53}px) scale(1) rotate(0deg)`,
            opacity: fc.flying ? 0 : 1,
            transition: fc.flying
              ? 'transform 0.65s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.45s 0.3s ease-in'
              : 'none',
            boxShadow: '0 8px 32px rgba(136,100,255,0.45)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fc.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
        </div>
      ))}

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
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ── Navigation ───────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '1.75rem',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        userSelect: 'none',
      }}>
        <motion.button
          type="button"
          onClick={handleBack}
          onMouseEnter={() => setBackBtnState('hover')}
          onMouseLeave={() => setBackBtnState('idle')}
          onMouseDown={() => setBackBtnState('active')}
          onMouseUp={() => setBackBtnState('hover')}
          onFocus={() => setBackBtnState('focus')}
          onBlur={() => setBackBtnState('idle')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '11px 22px',
            borderRadius: 6,
            border: '1px solid #250a00',
            cursor: 'pointer',
            fontSize: 14, fontWeight: 500,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            outline: 'none',
            textDecoration: 'none',
            background: backBtnState === 'active'
              ? '#dcfd4a'
              : (backBtnState === 'hover' || backBtnState === 'focus')
                ? '#6e5035'
                : '#250a00',
            color: backBtnState === 'active'
              ? '#250a00'
              : (backBtnState === 'hover' || backBtnState === 'focus')
                ? '#ffffff'
                : '#dcfd4a',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          ← 이전
        </motion.button>

        {showNext && (
          <motion.button
            type="button"
            onClick={handleNext}
            disabled={nextDisabled}
            onMouseEnter={() => { if (!nextDisabled) setNextBtnState('hover'); }}
            onMouseLeave={() => setNextBtnState('idle')}
            onMouseDown={() => { if (!nextDisabled) setNextBtnState('active'); }}
            onMouseUp={() => { if (!nextDisabled) setNextBtnState('hover'); }}
            onFocus={() => { if (!nextDisabled) setNextBtnState('focus'); }}
            onBlur={() => setNextBtnState('idle')}
            whileHover={!nextDisabled ? { scale: 1.06 } : undefined}
            whileTap={!nextDisabled ? { scale: 0.93 } : undefined}
            // 마지막 단계에서 활성화되면 펄스 글로우로 시선 유도
            animate={
              isLastStep && !nextDisabled
                ? { boxShadow: [
                    '0 0 0 rgba(213,254,0,0.0)',
                    '0 0 22px rgba(213,254,0,0.85)',
                    '0 0 0 rgba(213,254,0,0.0)',
                  ] }
                : { boxShadow: '0 0 0 rgba(213,254,0,0.0)' }
            }
            transition={
              isLastStep && !nextDisabled
                ? { boxShadow: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } }
                : { type: 'spring', stiffness: 400, damping: 18 }
            }
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px 22px',
              borderRadius: 6,
              border: '1px solid #250a00',
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              pointerEvents: nextDisabled ? 'none' : 'auto',
              opacity: nextDisabled ? 0.32 : 1,
              fontSize: 14, fontWeight: 700,
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
              outline: 'none',
              textDecoration: 'none',
              background: nextDisabled
                ? '#dcfd4a'
                : nextBtnState === 'active'
                  ? '#250a00'
                  : nextBtnState === 'focus'
                    ? '#cbed7f'
                    : nextBtnState === 'hover'
                      ? '#e8e2e2'
                      : '#dcfd4a',
              color: nextDisabled
                ? '#250a00'
                : nextBtnState === 'active'
                  ? '#dcfd4a'
                  : '#250a00',
            }}
          >
            {isLastStep ? '✦ 완료' : '다음'} →
          </motion.button>
        )}
      </div>

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
                      <Lottie animationData={planLoadingAnim} loop style={{ width: '100%', height: '100%' }} />
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
