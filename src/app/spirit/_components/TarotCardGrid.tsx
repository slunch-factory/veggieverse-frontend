"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TarotOption {
  label: string;
  description: string;
  value: string;
  tarot?: { number: string; title: string; image: string };
}

interface Question {
  id: number;
  question: string;
  subtitle?: string;
  multiSelect?: boolean;
  options: TarotOption[];
}

interface TarotCardGridProps {
  question: Question;
  answers: Record<number, string | string[]>;
  interactedQuestions: Set<number>;
  progress: number;
  currentStep: number;
  totalSteps: number;
  onSelect: (questionId: number, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TarotCardGrid({
  question,
  answers,
  interactedQuestions,
  progress,
  currentStep,
  totalSteps,
  onSelect,
  onNext,
  onBack,
}: TarotCardGridProps) {
  const [hoveredCard, setHoveredCard] = useState<TarotOption | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const [mobileMoreRight, setMobileMoreRight] = useState(false);
  const [desktopMoreRight, setDesktopMoreRight] = useState(false);

  const isMulti = !!question.multiSelect;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const isOptionSelected = (value: string) => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  const handleCardClick = (option: TarotOption) => {
    onSelect(question.id, option.value);
    if (!isMulti && !isFirstStep && !isLastStep) {
      setTimeout(() => onNext(), 300);
    }
  };

  const renderCard = (option: TarotOption, size: "mobile" | "desktop") => {
    const isSelected = isOptionSelected(option.value);
    const showSelected = isSelected && interactedQuestions.has(question.id);
    const isHovered = hoveredCard?.value === option.value;
    const isMobile = size === "mobile";
    const showDescription = isMobile || showSelected || isHovered;

    return (
      <div
        key={`${question.id}-${option.value}-${size}`}
        className="flex flex-col items-center"
        onMouseEnter={!isMobile ? () => setHoveredCard(option) : undefined}
        onMouseLeave={!isMobile ? () => setHoveredCard(null) : undefined}
      >
        <div
          onClick={() => handleCardClick(option)}
          className={`cursor-pointer transition-[transform,box-shadow] duration-200 will-change-transform ${
            showSelected || (!isMobile && isHovered)
              ? "scale-[1.02] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
              : ""
          }`}
        >
          <div
            className={`relative isolate rounded-xl overflow-hidden bg-[#E5E5E5] [backface-visibility:hidden] [clip-path:inset(0_round_0.75rem)] ${
              isMobile ? "w-[130px] h-[208px]" : "w-[192px] h-[307px]"
            }`}
          >
            {option.tarot?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.tarot.image} alt={option.tarot.title} className="w-full h-full object-cover pointer-events-none block [transform:translateZ(0)]" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                <span className={isMobile ? "text-sm text-stone-800" : "text-xl text-stone-800"}>{option.label}</span>
              </div>
            )}
            {/* 멀티셀렉트 체크 표시 */}
            {showSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#8C451D] flex items-center justify-center">
                <span className="text-xs text-white font-bold">✓</span>
              </div>
            )}
            {showSelected && (
              <div className="pointer-events-none absolute inset-0 rounded-xl border-[2px] border-[#8C451D] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_10px_22px_rgba(140,69,29,0.18)]" />
            )}
          </div>
        </div>
        <div className={`text-center ${isMobile ? "mt-2 w-[130px] min-h-[72px]" : "mt-3 w-[192px] min-h-[92px] relative"}`}>
          {isMobile ? (
            <>
              <span className="text-xs text-stone-800">{option.label}</span>
              <div className="mt-1 overflow-hidden h-10">
                <div className="leading-snug text-xs text-stone-500 opacity-100 transition-opacity duration-300">
                  {option.description}
                </div>
              </div>
            </>
          ) : (
            <div
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 transition-transform duration-300 ease-out"
            >
              <span className="text-base text-stone-800">{option.label}</span>
              <div className="mt-1 overflow-hidden h-11">
                <div
                  className={`leading-snug text-sm text-stone-500 transition-all duration-300 ease-out ${
                    showDescription ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                  }`}
                >
                  {option.description}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 멀티셀렉트에서 선택된 항목이 있는지
  const hasSelection = (() => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return !!answer;
  })();

  const showNextRow = isMulti || (isFirstStep && !isMulti) || isLastStep;
  const nextDisabled = showNextRow && !hasSelection;

  const syncScrollHints = useCallback(() => {
    const update = (el: HTMLDivElement | null, set: (v: boolean) => void) => {
      if (!el) {
        set(false);
        return;
      }
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      set(maxScroll > 12 && scrollLeft < maxScroll - 12);
    };
    update(mobileScrollRef.current, setMobileMoreRight);
    update(desktopScrollRef.current, setDesktopMoreRight);
  }, []);

  useEffect(() => {
    syncScrollHints();
    const mobileEl = mobileScrollRef.current;
    const desktopEl = desktopScrollRef.current;
    const onResize = () => syncScrollHints();
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (mobileEl) {
      mobileEl.addEventListener("scroll", syncScrollHints, { passive: true });
      ro?.observe(mobileEl);
    }
    if (desktopEl) {
      desktopEl.addEventListener("scroll", syncScrollHints, { passive: true });
      ro?.observe(desktopEl);
    }
    const t = window.setTimeout(syncScrollHints, 100);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(t);
      mobileEl?.removeEventListener("scroll", syncScrollHints);
      desktopEl?.removeEventListener("scroll", syncScrollHints);
      ro?.disconnect();
    };
  }, [syncScrollHints, question.id, question.options.length]);

  const scrollRowBy = (el: HTMLDivElement | null, delta: number) => {
    el?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex justify-center min-h-screen px-3 sm:px-4 md:px-6 bg-[#FCFBF7]">
        <div className="py-5 sm:py-6 md:py-10 relative w-[1080px] max-w-full">
          {/* <div className="sticky top-[70px] z-10 mb-6 md:mb-8 px-3 md:px-6 py-2">
            <p className="text-center text-2xl font-bold text-[#8C451D]">
              당신의 푸드 스피릿을 찾아드립니다
            </p>
          </div> */}

          <div className="mb-7 md:mb-8 flex flex-col gap-4 md:gap-5">
            <aside className="rounded-2xl border border-[#8C451D]/10 bg-white/45 p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="mb-2 text-[16px] leading-snug font-semibold text-stone-800 sm:text-[17px] md:text-[21px]">
                    {question.question}
                  </h2>
                  {question.subtitle && (
                    <p className="text-[12px] leading-relaxed text-stone-500 md:text-sm">
                      {question.subtitle}
                    </p>
                  )}
                  {isMulti && (
                    <p className="mt-2 md:mt-3 text-xs font-medium text-[#8C451D]">복수 선택 가능</p>
                  )}
                </div>
                <div className="shrink-0 flex items-center justify-center md:justify-end md:pt-4">
                  {Array.from({ length: totalSteps }).map((_, idx) => {
                    const stepNo = idx + 1;
                    const completed = stepNo < currentStep;
                    const active = stepNo === currentStep;
                    return (
                      <div key={`side-progress-step-${stepNo}`} className="flex items-center">
                        <div
                          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-semibold transition-colors ${
                            completed
                              ? "bg-[#8C451D]/45 text-white"
                              : active
                                ? "bg-[#8C451D] text-white"
                                : "bg-white text-stone-500 border border-stone-300"
                          }`}
                        >
                          {completed ? "✓" : stepNo}
                        </div>
                        {idx < totalSteps - 1 && (
                          <div className="mx-1.5 sm:mx-2 flex gap-1 sm:gap-1.5">
                            <span className="h-1 w-1 rounded-full bg-[#8C451D]/60" />
                            <span className="h-1 w-1 rounded-full bg-[#8C451D]/60" />
                            <span className="h-1 w-1 rounded-full bg-[#8C451D]/25" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-[#8C451D]/10 bg-white/35 p-2.5 sm:p-3 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="relative md:hidden -mx-1.5 w-[calc(100%+12px)] sm:-mx-2 sm:w-[calc(100%+16px)]">
                <div
                  ref={mobileScrollRef}
                  className="flex overflow-x-auto flex-nowrap gap-2.5 sm:gap-3 overscroll-x-contain [scrollbar-width:thin] snap-x snap-mandatory"
                >
                  {question.options.map((option, index) => (
                    <div
                      key={`single-row-mobile-${question.id}-${option.value}`}
                      className={`flex-shrink-0 snap-center ${index === 0 ? "ml-2.5 sm:ml-3" : ""} ${index === question.options.length - 1 ? "mr-2.5 sm:mr-3" : ""}`}
                    >
                      {renderCard(option, "mobile")}
                    </div>
                  ))}
                </div>
                {mobileMoreRight ? (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-14 bg-gradient-to-l from-[#FCFBF7] via-[#FCFBF7]/85 to-transparent"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => scrollRowBy(mobileScrollRef.current, Math.min(280, typeof window !== "undefined" ? window.innerWidth * 0.45 : 200))}
                      className="rounded-btn absolute right-0.5 sm:right-1 top-1/2 z-[2] flex h-9 w-9 sm:h-10 sm:w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-[#8C451D] shadow-md backdrop-blur-sm"
                      aria-label="More options"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                    </button>
                  </>
                ) : null}
              </div>

              <div className="relative hidden md:block w-full">
                <div
                  ref={desktopScrollRef}
                  className="overflow-x-auto [scrollbar-width:thin]"
                >
                  <div className="mx-auto flex w-max flex-nowrap gap-10 p-2">
                    {question.options.map((option) => (
                      <div key={`single-row-desktop-${question.id}-${option.value}`}>
                        {renderCard(option, "desktop")}
                      </div>
                    ))}
                  </div>
                </div>
                {desktopMoreRight ? (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-[#FCFBF7] via-[#FCFBF7]/90 to-transparent"
                      aria-hidden
                    />
                    {/* <button
                      type="button"
                      onClick={() => scrollRowBy(desktopScrollRef.current, 400)}
                      className="rounded-btn absolute right-2 top-1/2 z-[2] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-[#8C451D] shadow-md backdrop-blur-sm"
                      aria-label="More options"
                    >
                      <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
                    </button> */}
                  </>
                ) : 
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/90 to-transparent"
                  aria-hidden
                />}
              </div>
            </section>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-4 md:gap-6 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="rounded-btn h-11 md:h-12 w-full sm:min-w-[120px] sm:w-auto px-6 flex items-center justify-center gap-2 text-sm font-medium bg-white text-[#8C451D] border border-[#8C451D]/30 rounded-xl transition-colors hover:bg-stone-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            {showNextRow && (
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className={`rounded-btn h-11 md:h-12 w-full sm:min-w-[132px] sm:w-auto px-6 flex items-center justify-center gap-2 text-sm font-medium rounded-xl transition-colors ${
                  nextDisabled
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-[#8C451D] text-white cursor-pointer hover:bg-[#6f3617]"
                }`}
              >
                {isLastStep ? "완료" : "다음"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
