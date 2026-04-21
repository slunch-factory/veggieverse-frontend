"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type {
  DayPlan,
  DisplayMenuData,
  DurationType,
  MenuCategory,
  PlanType,
} from "../_data/subscription";
import { WEEKDAY_KO } from "../_data/subscription";
import { DayRow } from "./DayRow";
import { DatePickerCalendar } from "./DatePickerCalendar";
import { MealHoverTooltip, type HoveredMealState } from "./MealHoverTooltip";
import { MobileMealPreview } from "./MobileMealPreview";

interface PlannerColumnProps {
  duration: DurationType;
  startDate: Date;
  earliestStart: Date;
  allDays: DayPlan[];
  mealPlan: Record<string, DisplayMenuData>;
  selectedSlotId: string | null;
  selectedPlan: PlanType | null;
  selectedPlanType: MenuCategory | null;
  filledSlots: number;
  draggingMealId: string | null;
  dragOverDayKey: string | null;
  listScrollRef: React.RefObject<HTMLDivElement | null>;
  onDurationChange: (d: DurationType) => void;
  onStartDateChange: (d: Date) => void;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
  onResetMealPlan: () => void;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function PlannerColumn({
  duration,
  startDate,
  earliestStart,
  allDays,
  mealPlan,
  selectedSlotId,
  selectedPlan,
  filledSlots,
  draggingMealId,
  dragOverDayKey,
  listScrollRef,
  onDurationChange,
  onStartDateChange,
  onSelectSlot,
  onRemoveMeal,
  onDragOverDay,
  onDropMeal,
  onResetMealPlan,
}: PlannerColumnProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hoveredMeal, setHoveredMeal] = useState<HoveredMealState | null>(null);
  const [previewMeal, setPreviewMeal] = useState<DisplayMenuData | null>(null);

  const atMin = stripTime(startDate) <= stripTime(earliestStart);
  const shift = (days: number) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + days);
    if (stripTime(next) < stripTime(earliestStart)) return;
    onStartDateChange(next);
  };

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-white"
      aria-label="구독 일정 플래너"
    >
      <MealHoverTooltip hovered={hoveredMeal} />

      {/* 타이틀 (데스크탑 전용 — 좌측 MenuLibrary 타이틀과 높이 매칭) */}
      <div className="hidden lg:block shrink-0 border-b border-black bg-white px-6 pt-5 pb-4">
        <h2 className="text-[18px] leading-normal tracking-tight text-black">배송 일정</h2>
      </div>

      {/* 기간 탭 */}
      <div className="shrink-0 flex items-stretch justify-center gap-10 border-b border-black bg-white h-11">
        {([1, 2] as DurationType[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDurationChange(d)}
            className={`flex items-center justify-center bg-transparent px-2 text-[14px] whitespace-nowrap transition-colors underline-offset-4 cursor-pointer ${
              duration === d
                ? "text-[#8C451D] underline"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {d}주 · {d * 14}끼
          </button>
        ))}
      </div>

      {/* 배송 시작일 헤더 */}
      <div className="shrink-0 relative flex items-stretch justify-center border-b border-black bg-white h-11">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atMin}
          aria-label="하루 전"
          className={`flex items-center justify-center bg-transparent px-3 leading-none ${
            atMin
              ? "cursor-not-allowed text-gray-300"
              : "cursor-pointer text-gray-700 hover:text-black"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setCalendarOpen((v) => !v)}
          className="flex items-center justify-center bg-transparent px-2 text-[14px] text-black whitespace-nowrap cursor-pointer underline underline-offset-4"
        >
          {startDate.getMonth() + 1}/{startDate.getDate()}({WEEKDAY_KO[startDate.getDay()]})
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="하루 후"
          className="flex items-center justify-center bg-transparent px-3 leading-none cursor-pointer text-gray-700 hover:text-black"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        {calendarOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setCalendarOpen(false)}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white border border-black shadow-lg p-4 w-[280px]">
              <DatePickerCalendar
                selected={startDate}
                minDate={earliestStart}
                onSelect={(d) => {
                  onStartDateChange(d);
                  setCalendarOpen(false);
                }}
              />
            </div>
          </>
        )}
        {filledSlots > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("선택한 식단을 모두 삭제할까요?")) return;
              onResetMealPlan();
            }}
            aria-label="식단 초기화"
            title="식단 초기화"
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center bg-transparent text-gray-400 hover:text-black cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* 일정 리스트 */}
      <div
        ref={listScrollRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto bg-white"
      >
        {allDays.map((day) => (
          <DayRow
            key={day.dateKey}
            day={day}
            mealPlan={mealPlan}
            selectedSlotId={selectedSlotId}
            selectedPlan={selectedPlan}
            draggingMealId={draggingMealId}
            dragOverDayKey={dragOverDayKey}
            onSelectStartDate={onStartDateChange}
            onSelectSlot={onSelectSlot}
            onRemoveMeal={onRemoveMeal}
            onDragOverDay={onDragOverDay}
            onDropMeal={onDropMeal}
            onHoverMeal={setHoveredMeal}
            onShowMobilePreview={setPreviewMeal}
          />
        ))}
      </div>

      <MobileMealPreview meal={previewMeal} onClose={() => setPreviewMeal(null)} />
    </section>
  );
}
