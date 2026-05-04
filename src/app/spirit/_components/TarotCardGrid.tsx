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
  const [desktopMoreLeft, setDesktopMoreLeft] = useState(false);
  const [mobileMoreLeft, setMobileMoreLeft] = useState(false);

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

    const isAllergyX = currentStep === 3 && option.value !== "no-allergy";

    return (
      <div
        key={`${question.id}-${option.value}-${size}`}
        className="flex flex-col items-center px-2 py-4"
        onMouseEnter={!isMobile ? () => setHoveredCard(option) : undefined}
        onMouseLeave={!isMobile ? () => setHoveredCard(null) : undefined}
      >
        {/* 외곽: glow + scale 담당 */}
        <div
          className={`relative cursor-pointer rounded-xl transition-all duration-200 will-change-transform ${
            showSelected && isAllergyX
              ? "scale-[1.05]"
              : showSelected
              ? "scale-[1.05]"
              : !isMobile && isHovered
                ? "scale-[1.02] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                : ""
          }`}
          onClick={() => handleCardClick(option)}
        >
          {/* 카드 이미지 */}
          <div
            className={`relative isolate rounded-xl overflow-hidden bg-[#E5E5E5] [backface-visibility:hidden] ${
              isMobile ? "w-[calc((100vw-72px)/3)] aspect-[5/8]" : "w-[152px] h-[243px]"
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
            {/* 3단계 어두운 오버레이 */}
            {showSelected && isAllergyX && (
              <div className="pointer-events-none absolute inset-0 bg-black/55" />
            )}
            {/* 체크/X 뱃지 — 이미지 내부 */}
            {showSelected && (
              <div className={`absolute top-2 right-2 z-[1] w-5 h-5 rounded-full flex items-center justify-center shadow-md ${
                isAllergyX ? "bg-neutral-600" : "bg-[#DCFD4A]"
              }`}>
                <span className={`text-xs font-bold ${isAllergyX ? "text-white" : "text-[#8C451D]"}`}>{isAllergyX ? "✕" : "✓"}</span>
              </div>
            )}
          </div>
          {/* 선택 테두리 + glow — 외곽 기준, 이미지 clip 밖 */}
          {showSelected && (
            <div className={`pointer-events-none absolute inset-0 rounded-xl ${
              isAllergyX
                ? "border-[2px] border-neutral-600 shadow-[0_0_14px_rgba(82,82,82,0.5),0_0_28px_rgba(82,82,82,0.25)]"
                : "border-[2.5px] border-[#DCFD4A] shadow-[0_0_14px_rgba(220,253,74,0.65),0_0_32px_rgba(220,253,74,0.35),0_0_48px_rgba(220,253,74,0.15)]"
            }`} />
          )}
        </div>
        <div className={`text-center [word-break:keep-all] ${isMobile ? "mt-3 w-[calc((100vw-72px)/3)]" : "mt-3 w-[152px]"}`}>
          <span className={isMobile ? "text-[10px] leading-tight text-stone-800" : "text-base text-stone-800"}>{option.label}</span>
          {option.description && (
            <div className={`mt-0.5 ${isMobile ? "leading-snug text-[10px] text-stone-500" : "leading-snug text-sm text-stone-500"}`}>
              {option.description}
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
    if (mobileScrollRef.current) {
      setMobileMoreLeft(mobileScrollRef.current.scrollLeft > 12);
    }
    if (desktopScrollRef.current) {
      setDesktopMoreLeft(desktopScrollRef.current.scrollLeft > 12);
    }
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
        <div className="py-3 sm:py-4 md:py-5 relative w-[1080px] max-w-full">
          {/* <div className="sticky top-[70px] z-10 mb-6 md:mb-8 px-3 md:px-6 py-2">
            <p className="text-center text-2xl font-bold text-[#8C451D]">
              당신의 푸드 스피릿을 찾아드립니다
            </p>
          </div> */}

          <div className="mb-3 md:mb-4 flex flex-col gap-3 md:gap-4">
            <aside className="rounded-2xl border border-[#8C451D]/10 bg-white/45 p-4 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="mb-2 text-[16px] leading-snug font-semibold text-stone-800 sm:text-[17px] md:text-[21px]">
                    {question.question}
                  </h2>
                  {(question.subtitle || isMulti) && (
                    <div className="flex items-center gap-2">
                      {question.subtitle && (
                        <p className="text-[12px] leading-relaxed text-stone-500 md:text-sm">
                          {question.subtitle}
                        </p>
                      )}
                      {isMulti && (
                        <span className="shrink-0 text-xs font-medium text-[#8C451D]">(복수 선택 가능)</span>
                      )}
                    </div>
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

            <section className="rounded-2xl border border-[#8C451D]/10 bg-white/35 p-2.5 sm:p-3 md:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-visible">
              <div className="relative md:hidden -mx-1.5 w-[calc(100%+12px)] sm:-mx-2 sm:w-[calc(100%+16px)]">
                <div
                  ref={mobileScrollRef}
                  className={`flex gap-2 pt-3 pb-3 ${
                    question.options.length <= 3
                      ? "flex-wrap justify-center px-2"
                      : "overflow-x-auto flex-nowrap overscroll-x-contain no-scrollbar snap-x snap-mandatory"
                  }`}
                >
                  {question.options.map((option, index) => (
                    <div
                      key={`single-row-mobile-${question.id}-${option.value}`}
                      className={`${
                        question.options.length <= 3
                          ? ""
                          : `flex-shrink-0 snap-center ${index === 0 ? "ml-2.5 sm:ml-3" : ""} ${index === question.options.length - 1 ? "mr-2.5 sm:mr-3" : ""}`
                      }`}
                    >
                      {renderCard(option, "mobile")}
                    </div>
                  ))}
                </div>
                {mobileMoreLeft && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-14 bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/85 to-transparent"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => scrollRowBy(mobileScrollRef.current, -Math.min(280, typeof window !== "undefined" ? window.innerWidth * 0.45 : 200))}
                      className="rounded-btn absolute left-0.5 sm:left-1 top-[45%] z-[2] flex h-9 w-9 sm:h-10 sm:w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-[#8C451D] shadow-md backdrop-blur-sm cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                    </button>
                  </>
                )}
                {mobileMoreRight && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-14 bg-gradient-to-l from-[#FCFBF7] via-[#FCFBF7]/85 to-transparent"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => scrollRowBy(mobileScrollRef.current, Math.min(280, typeof window !== "undefined" ? window.innerWidth * 0.45 : 200))}
                      className="rounded-btn absolute right-0.5 sm:right-1 top-[45%] z-[2] flex h-9 w-9 sm:h-10 sm:w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-[#8C451D] shadow-md backdrop-blur-sm cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
                    </button>
                  </>
                )}
              </div>

              <div className="relative hidden md:block w-full">
                <div
                  ref={desktopScrollRef}
                  className="overflow-x-auto no-scrollbar"
                >
                  <div className="mx-auto flex w-max flex-nowrap gap-6 p-2">
                    {question.options.map((option) => (
                      <div key={`single-row-desktop-${question.id}-${option.value}`}>
                        {renderCard(option, "desktop")}
                      </div>
                    ))}
                  </div>
                </div>
                {desktopMoreLeft && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 bg-gradient-to-r from-[#FCFBF7] via-[#FCFBF7]/90 to-transparent"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => scrollRowBy(desktopScrollRef.current, -300)}
                      className="rounded-btn absolute -left-1 top-[120px] z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-[#8C451D] shadow-md backdrop-blur-sm cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
                    </button>
                  </>
                )}
                {desktopMoreRight && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 bg-gradient-to-l from-[#FCFBF7] via-[#FCFBF7]/90 to-transparent"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => scrollRowBy(desktopScrollRef.current, 300)}
                      className="rounded-btn absolute -right-1 top-[120px] z-[2] flex h-10 w-10 items-center justify-center rounded-full border border-stone-200/80 bg-white/95 text-[#8C451D] shadow-md backdrop-blur-sm cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center w-full gap-2.5 sm:gap-4 md:gap-6 pt-1">
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
