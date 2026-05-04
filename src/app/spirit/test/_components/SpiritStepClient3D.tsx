'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';
import type { SurveyQuestion, SurveyOption } from '@/app/spirit/_data/surveyQuestions';
import type { SurveyAnswers } from '@/app/spirit/_types';
import TarotCarousel3DSurvey, { type CarouselOption } from './TarotCarousel3DSurvey';
import { getAutoPlan } from '@/lib/api/spirit';

const _backBase = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const BACK_CARD: CarouselOption = {
  label: '',
  value: '__back__',
  nonSelectable: true,
  tarot: { number: '', title: '', image: `${_backBase}/images/tarot/card-back.png` },
};

const ALLERGY_QUESTION_ID = 3;
const _base = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '');
const PLAN_LOADING_LOTTIE_SRC = `${_base}/Loading%20Animation.json`;

interface FlyCard {
  id: number;
  image: string;
  fromX: number;
  fromY: number;
  spin: number;        // random rotation during flight
  flying: boolean;     // false = at source (no transition), true = flying to deck
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
  const [centerOpt, setCenterOpt] = useState<CarouselOption | null>(null);
  const [nextBtnState, setNextBtnState] = useState<'idle' | 'hover' | 'active' | 'focus'>('idle');
  const [backBtnState, setBackBtnState] = useState<'idle' | 'hover' | 'active' | 'focus'>('idle');

  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.removeItem('spirit-finder-answers');
  }, []);

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
    if (!option.tarot?.image) return;
    const id = Date.now() + Math.random();
    const spin = (Math.random() - 0.5) * 40; // random tilt during flight

    // Step 1: render at source (no transition)
    setFlyCards((prev) => [...prev, { id, image: option.tarot!.image, fromX: screenX, fromY: screenY, spin, flying: false }]);

    // Step 2: next frame → start transition to deck
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlyCards((prev) => prev.map((c) => c.id === id ? { ...c, flying: true } : c));
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
      setAnswers((prev) => {
        const current = hasInteracted ? (prev[questionId] as string[] | undefined) ?? [] : [];
        let nextVals: string[];

        if (questionId === ALLERGY_QUESTION_ID) {
          if (value === 'no-allergy') {
            nextVals = current.includes('no-allergy') && current.length === 1 ? [] : ['no-allergy'];
          } else {
            const base = current.filter((v) => v !== 'no-allergy');
            nextVals = base.includes(value) ? base.filter((v) => v !== value) : [...base, value];
          }
        } else {
          nextVals = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
        }

        // Fly animation only for newly added cards
        const isNewlyAdded = !current.includes(value) && nextVals.includes(value);
        if (isNewlyAdded && option && screenX !== undefined && screenY !== undefined) {
          triggerFly(option, screenX, screenY);
        }

        return { ...prev, [questionId]: nextVals };
      });
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
  }, [interactedQuestions, questions, triggerFly]);

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCenterOpt(null);
      setCurrentStep((s) => s + 1);
    } else {
      setIsPreparingPlan(true);
      const [recommended] = await Promise.all([
        getAutoPlan(answers).catch(() => []),
        new Promise<void>((r) => setTimeout(r, 1500)),
      ]);
      if (recommended.length > 0) {
        sessionStorage.setItem('spirit-auto-plan', JSON.stringify(recommended));
      }
      router.push('/subscribe');
    }
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
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#212121' }}>
        <p style={{ color: 'rgba(213,254,0,0.5)' }}>질문을 불러오는 중...</p>
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

  // Deck target position (center of deck element)
  const getDeckCenter = () => {
    const rect = deckRef.current?.getBoundingClientRect();
    return rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: (typeof window !== 'undefined' ? window.innerWidth : 800) - 50, y: 60 };
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100dvh - var(--header-area-h, 96px))', overflow: 'hidden', background: '#212121' }}>

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
            options={(currentStep === 2 || isLastStep) ? [...q.options, BACK_CARD] : q.options}
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
          <div style={{
            width: isMobile ? 45 : 44,
            height: isMobile ? 72 : 72,
            borderRadius: 8,
            border: '1.5px dashed rgba(136,100,255,0.3)',
            background: 'rgba(33,33,33,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
          }}>
            <span style={{ fontSize: 16, color: 'rgba(136,100,255,0.45)' }}>✦</span>
          </div>
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
                <div
                  key={group.questionId}
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
                      <div
                        key={card.value}
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
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Single card (or single-select group): original style
            return (
              <div
                key={group.questionId}
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
              </div>
            );
          })
        )}
      </div>

      {/* ── Flying cards ─────────────────────────────────────────── */}
      {flyCards.map((fc) => {
        const deck = getDeckCenter();
        return (
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
                ? `translate(${deck.x - 32}px, ${deck.y - 53}px) scale(0.22) rotate(${fc.spin}deg)`
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
        );
      })}

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
            {/* Step counter */}
            <p style={{
              margin: '0 0 0.6rem',
              fontSize: 'clamp(0.65rem, 1.3vw, 0.78rem)',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(213,254,0,0.45)',
            }}>
              {String(stepNum).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
            </p>

            <h2 style={{
              margin: '0 0 0.55rem',
              fontSize: 'clamp(1.6rem, 4vw, 2rem)',
              fontWeight: 800,
              color: '#D5FE00',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              wordBreak: 'keep-all',
              maxWidth: '55%',
            }}>
              {q.question}
            </h2>

            {(q.subtitle || isMulti) && (
              <p style={{
                margin: 0,
                fontSize: 'clamp(0.7rem, 1.5vw, 0.88rem)',
                color: 'rgba(213,254,0,0.55)',
                letterSpacing: '0.03em',
                wordBreak: 'keep-all',
              }}>
                {q.subtitle}{isMulti ? ' · 복수 선택 가능' : ''}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom gradient overlay ───────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9,
        height: '40%',
        background: 'linear-gradient(to top, rgba(33,33,33,0.95) 0%, rgba(33,33,33,0.55) 55%, transparent 100%)',
        pointerEvents: 'none',
        userSelect: 'none',
      }} />

      {/* ── Description panel ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {centerOpt && (
          <motion.div
            key={currentStep}
            style={{
              position: 'absolute',
              ...(isMobile ? { top: '80%' } : { bottom: '10rem' }),
              left: 0,
              right: 0,
              zIndex: 10,
              textAlign: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
              padding: '0 2rem',
            }}
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 0, opacity: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              fontSize: 'clamp(1.2rem, 2.6vw, 1.75rem)',
              color: '#D5FE00',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: '0.35rem',
            }}>
              {centerOpt.label}
            </div>
            <div style={{
              fontSize: 'clamp(0.68rem, 1.3vw, 0.8rem)',
              color: 'rgba(213,254,0,0.45)',
              lineHeight: 1.55,
              letterSpacing: '0.01em',
              maxWidth: 480,
              margin: '0 auto',
            }}>
              {centerOpt.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <button
          type="button"
          onClick={handleBack}
          onMouseEnter={() => setBackBtnState('hover')}
          onMouseLeave={() => setBackBtnState('idle')}
          onMouseDown={() => setBackBtnState('active')}
          onMouseUp={() => setBackBtnState('hover')}
          onFocus={() => setBackBtnState('focus')}
          onBlur={() => setBackBtnState('idle')}
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
        </button>

        {showNext && (
          <button
            type="button"
            onClick={handleNext}
            disabled={nextDisabled}
            onMouseEnter={() => { if (!nextDisabled) setNextBtnState('hover'); }}
            onMouseLeave={() => setNextBtnState('idle')}
            onMouseDown={() => { if (!nextDisabled) setNextBtnState('active'); }}
            onMouseUp={() => { if (!nextDisabled) setNextBtnState('hover'); }}
            onFocus={() => { if (!nextDisabled) setNextBtnState('focus'); }}
            onBlur={() => setNextBtnState('idle')}
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
            {isLastStep ? '완료' : '다음'} →
          </button>
        )}
      </div>

      {/* ── Plan loading overlay ─────────────────────────────────── */}
      {isPreparingPlan && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(33,33,33,0.82)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div style={{
            width: '100%', maxWidth: 420,
            borderRadius: 20,
            background: 'rgba(28,28,28,0.96)',
            border: '1px solid rgba(136,100,255,0.3)',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(136,100,255,0.2)',
          }}>
            {planLoadingAnim && (
              <div style={{ margin: '0 auto 1rem', width: 140, height: 140 }}>
                <Lottie animationData={planLoadingAnim} loop style={{ width: '100%', height: '100%' }} />
              </div>
            )}
            <p style={{
              fontSize: 'clamp(0.9rem,2vw,1.1rem)',
              color: '#D5FE00',
              letterSpacing: '0.05em',
              margin: 0,
            }}>
              사용자 맞춤형 구독 플랜을 생성 중입니다...
            </p>
            <p style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'rgba(213,254,0,0.45)' }}>
              잠시만 기다려 주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
