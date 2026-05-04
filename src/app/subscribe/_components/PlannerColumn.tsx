"use client";

import { RotateCcw } from "lucide-react";
import type {
  DayPlan,
  DisplayMenuData,
  MenuCategory,
  PlanType,
} from "../_data/subscription";
import { WEEKDAY_KO } from "../_data/subscription";
import { DayRow } from "./DayRow";

interface PlannerColumnProps {
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
  onStartDateChange: (d: Date) => void;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
  onResetMealPlan: () => void;
  onSetMeal: (slotId: string, meal: DisplayMenuData) => void;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function PlannerColumn({
  startDate,
  earliestStart,
  allDays,
  mealPlan,
  selectedSlotId,
  filledSlots,
  draggingMealId,
  dragOverDayKey,
  listScrollRef,
  onStartDateChange,
  onSelectSlot,
  onRemoveMeal,
  onDragOverDay,
  onDropMeal,
  onResetMealPlan,
  onSetMeal,
}: PlannerColumnProps) {
  const atMin = stripTime(startDate) <= stripTime(earliestStart);
  const shift = (days: number) => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + days);
    if (stripTime(next) < stripTime(earliestStart)) return;
    onStartDateChange(next);
  };

  const scrollToDay = (dateKey: string) => {
    const container = listScrollRef.current;
    const target = container?.querySelector(`[data-day-key="${dateKey}"]`) as HTMLElement | null;
    if (container && target) {
      container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative flex flex-col h-full min-h-0 bg-[#fcfaf8]"
      aria-label="구독 일정 플래너"
    >
      {/* cal-title-row */}
      <div className="relative shrink-0 h-[48px] px-5 flex items-center justify-center border-b border-black bg-white">
        <h2 className="text-[14px] font-normal tracking-[-0.005em] text-black">구독 스케쥴</h2>
        {filledSlots > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("선택한 식단을 모두 삭제할까요?")) return;
              onResetMealPlan();
            }}
            aria-label="식단 초기화"
            title="식단 초기화"
            className="absolute right-5 flex items-center justify-center text-[#9a928c] hover:text-black transition-colors"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.6} />
          </button>
        )}
      </div>

      {/* week-nav: 이전/다음 + 날짜 탭 스트립 (7일 균등 분배) */}
      <div className="shrink-0 h-[56px] flex items-stretch border-b border-black bg-white">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={atMin}
          aria-label="이전 기간"
          className={`shrink-0 w-8 border-r border-black flex items-center justify-center bg-white text-[16px] leading-none transition-colors ${
            atMin
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-[#fcfaf8] cursor-pointer"
          }`}
        >
          ‹
        </button>

        {/* 7일 균등 분배 탭 */}
        <div className="flex-1 flex items-stretch">
          {allDays.slice(0, 7).map((day) => {
            const d = day.date;
            const dow = d.getDay();
            const isSun = dow === 0;
            const isSat = dow === 6;
            const dateNum = String(d.getDate());
            const dowLabel = WEEKDAY_KO[dow];
            const dowColor = isSun ? "text-[#e68a45]" : isSat ? "text-[#7eb5e6]" : "text-[#9a928c]";
            const dateColor = isSun ? "text-[#e68a45]" : isSat ? "text-[#7eb5e6]" : "text-[#3d3d3d]";
            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => scrollToDay(day.dateKey)}
                className="flex-1 flex flex-col items-center justify-center gap-[3px] hover:bg-[#fcfaf8] transition-colors"
              >
                <span className={`text-[10px] font-bold leading-none ${dowColor}`}>{dowLabel}</span>
                <span className={`text-[14px] font-bold leading-none ${dateColor}`}>{dateNum}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="다음 기간"
          className="shrink-0 w-8 border-l border-black flex items-center justify-center bg-white text-[16px] leading-none hover:bg-[#fcfaf8] cursor-pointer transition-colors"
        >
          ›
        </button>
      </div>

      {/* 일정 리스트 */}
      <div
        ref={listScrollRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#fcfaf8]"
      >
        {allDays.map((day) => (
          <DayRow
            key={day.dateKey}
            day={day}
            mealPlan={mealPlan}
            selectedSlotId={selectedSlotId}
            draggingMealId={draggingMealId}
            dragOverDayKey={dragOverDayKey}
            onSelectStartDate={onStartDateChange}
            onSelectSlot={onSelectSlot}
            onRemoveMeal={onRemoveMeal}
            onDragOverDay={onDragOverDay}
            onDropMeal={onDropMeal}
            onSetMeal={onSetMeal}
          />
        ))}
      </div>
    </section>
  );
}
