"use client";

import { useState } from "react";
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
  onSelect: (questionId: number, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TarotCardGrid({
  question,
  answers,
  interactedQuestions,
  progress,
  onSelect,
  onNext,
  onBack,
}: TarotCardGridProps) {
  const [hoveredCard, setHoveredCard] = useState<TarotOption | null>(null);

  const isMulti = !!question.multiSelect;

  const isOptionSelected = (value: string) => {
    const answer = answers[question.id];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  const handleCardClick = (option: TarotOption) => {
    onSelect(question.id, option.value);
    if (!isMulti) {
      setTimeout(() => onNext(), 300);
    }
  };

  const renderCard = (option: TarotOption, size: "mobile" | "desktop") => {
    const isSelected = isOptionSelected(option.value);
    const showSelected = isSelected && interactedQuestions.has(question.id);
    const isHovered = hoveredCard?.value === option.value;
    const isMobile = size === "mobile";

    return (
      <div
        key={`${question.id}-${option.value}-${size}`}
        className="flex flex-col items-center"
        onMouseEnter={!isMobile ? () => setHoveredCard(option) : undefined}
        onMouseLeave={!isMobile ? () => setHoveredCard(null) : undefined}
      >
        <div
          onClick={() => handleCardClick(option)}
          className={`cursor-pointer transition-transform rounded-xl overflow-hidden bg-[#E5E5E5] ${
            isMobile ? "w-[130px] h-[208px]" : "w-[192px] h-[307px]"
          } ${showSelected ? "ring-2 ring-inset ring-[#DCFD4A]" : ""} ${
            showSelected || (!isMobile && isHovered)
              ? isMobile ? "scale-[1.02]" : "-translate-y-2 scale-[1.02]"
              : ""
          }`}
        >
          {option.tarot?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={option.tarot.image} alt={option.tarot.title} className="w-full h-full object-cover pointer-events-none" draggable={false} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
              <span className={isMobile ? "text-sm text-stone-800" : "text-xl text-stone-800"}>{option.label}</span>
            </div>
          )}
          {/* 멀티셀렉트 체크 표시 */}
          {isMulti && showSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#DCFD4A] flex items-center justify-center">
              <span className="text-xs text-black font-bold">✓</span>
            </div>
          )}
        </div>
        <div className={`text-center ${isMobile ? "mt-2 w-[130px]" : "mt-3 w-[192px]"}`}>
          <span className={isMobile ? "text-xs text-stone-800" : "text-base text-stone-800"}>{option.label}</span>
          <div className={`leading-snug ${isMobile ? "text-xs text-stone-500 mt-1" : "text-sm text-stone-500 mt-1"}`}>{option.description}</div>
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

  return (
    <div className="min-h-screen bg-transparent">
      <div className="flex items-center justify-center min-h-screen p-4 md:p-8 bg-[#B2B2B2]">
        <div className="px-2 py-6 md:p-10 relative w-[1000px] max-w-full">

          {/* 질문 헤더 */}
          <div className="relative px-2 md:px-0 mb-10 sticky top-[70px] z-10 bg-[#B2B2B2] pt-4 pb-4">
            <button
              onClick={onBack}
              className="absolute top-5 left-0 w-7 h-7 rounded-full bg-[#8C451D] text-[#DCFD4A] flex items-center justify-center border-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-center text-stone-800 px-8 md:px-0 text-base md:text-xl mb-1">
              {question.question}
            </h2>
            {question.subtitle && (
              <p className="text-center text-stone-500 text-xs md:text-sm mb-3">
                {question.subtitle}
              </p>
            )}
            {isMulti && (
              <p className="text-center text-xs text-[#8C451D] mb-3">
                복수 선택 가능
              </p>
            )}
            <div className="w-full h-px bg-black mt-2" />
            <div className="h-1 bg-black" style={{ width: `${progress}%` }} />
          </div>

          <div className="mb-8">
            {/* 모바일: 가로 스크롤 */}
            <div className="flex md:hidden overflow-x-auto flex-nowrap gap-3 pb-4 no-scrollbar snap-x snap-mandatory -mx-2 w-[calc(100%+16px)]">
              {question.options.map((option, index) => (
                <div
                  key={`m-${option.value}`}
                  className={`flex-shrink-0 snap-center ${index === 0 ? "ml-3" : ""} ${index === question.options.length - 1 ? "mr-3" : ""}`}
                >
                  {renderCard(option, "mobile")}
                </div>
              ))}
            </div>

            {/* 데스크톱: 2+나머지 그리드 */}
            <div className="hidden md:flex flex-col items-center gap-6">
              <div className="flex justify-center gap-6">
                {question.options.slice(0, 2).map((option) => renderCard(option, "desktop"))}
              </div>
              {question.options.length > 2 && (
                <div className="flex justify-center gap-6">
                  {question.options.slice(2).map((option) => renderCard(option, "desktop"))}
                </div>
              )}
            </div>
          </div>

          {/* 멀티셀렉트: 다음 버튼 */}
          {isMulti && (
            <div className="flex justify-center">
              <button
                onClick={onNext}
                className={`px-8 py-3 flex items-center gap-2 text-sm transition-colors ${
                  hasSelection
                    ? "bg-[#8C451D] text-white cursor-pointer"
                    : "bg-stone-300 text-stone-500 cursor-pointer"
                }`}
              >
                {hasSelection ? "다음" : "건너뛰기"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
