"use client";

import { Plus, X } from "lucide-react";
import type { DayPlan, DisplayMenuData, PlanType } from "../_data/subscription";
import { getHolidayMeta, WEEKDAY_KO } from "../_data/subscription";
import type { HoveredMealState } from "./MealHoverTooltip";

interface DayRowProps {
  day: DayPlan;
  mealPlan: Record<string, DisplayMenuData>;
  selectedSlotId: string | null;
  selectedPlan: PlanType | null;
  draggingMealId: string | null;
  dragOverDayKey: string | null;
  onSelectStartDate: (d: Date) => void;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
  onHoverMeal: (state: HoveredMealState | null) => void;
  onShowMobilePreview: (meal: DisplayMenuData) => void;
}

const POPUP_WIDTH = 280;

export function DayRow({
  day,
  mealPlan,
  selectedSlotId,
  selectedPlan,
  draggingMealId,
  dragOverDayKey,
  onSelectStartDate,
  onSelectSlot,
  onRemoveMeal,
  onDragOverDay,
  onDropMeal,
  onHoverMeal,
  onShowMobilePreview,
}: DayRowProps) {
  const dow = day.date.getDay();
  const meta = getHolidayMeta(day.date);
  const isSunday = dow === 0;
  const isSaturday = dow === 6;
  const isHoliday = Boolean(meta.labelKo);
  const dowShort = WEEKDAY_KO[dow];
  const mm = String(day.date.getMonth() + 1).padStart(2, "0");
  const dd = String(day.date.getDate()).padStart(2, "0");
  const hasMeal = day.slots.some((s) => Boolean(mealPlan[s.slotId]));
  const dateTone =
    isSunday || isHoliday
      ? "text-red-400"
      : isSaturday
        ? "text-blue-400"
        : hasMeal
          ? "text-gray-900"
          : "text-gray-400";
  const dowTone =
    isSunday || isHoliday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-gray-700";

  const mealEntries = day.slots
    .map((slot) => ({ slot, meal: mealPlan[slot.slotId] }))
    .filter((e): e is { slot: typeof day.slots[number]; meal: DisplayMenuData } => Boolean(e.meal));

  const firstSlot = day.slots[0];
  const isFirstSelected = firstSlot ? selectedSlotId === firstSlot.slotId : false;
  const isDragOver = dragOverDayKey === day.dateKey;
  const nextEmptySlot = day.slots.find((s) => !mealPlan[s.slotId]);
  const nextEmptySelected = nextEmptySlot ? selectedSlotId === nextEmptySlot.slotId : false;

  return (
    <article
      onDragOver={(e) => {
        if (!draggingMealId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        if (dragOverDayKey !== day.dateKey) onDragOverDay(day.dateKey);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        if (dragOverDayKey === day.dateKey) onDragOverDay(null);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const mealId = e.dataTransfer.getData("text/plain");
        if (!mealId) return;
        onDropMeal(day.dateKey, mealId);
      }}
      className={`flex min-h-[56px] lg:min-h-[76px] flex-row items-center gap-6 md:gap-10 overflow-hidden border-b border-gray-200 px-4 md:px-5 last:border-b-0 transition-colors ${
        isDragOver ? "bg-[#FDEEE8]" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectStartDate(day.date)}
        title="이 날짜부터 배송 시작"
        className="flex shrink-0 flex-row lg:flex-col items-baseline lg:items-center gap-1.5 lg:gap-0.5 bg-transparent p-0 hover:opacity-70 cursor-pointer"
      >
        <span className={`text-[22px] leading-tight tracking-tight ${dateTone}`}>
          {mm}.{dd}
        </span>
        <span className={`text-[13px] leading-tight ${dowTone}`}>{dowShort}</span>
      </button>

      {mealEntries.length > 0 ? (
        <div
          className="min-w-0 flex-1 flex items-center flex-wrap gap-x-2 gap-y-1 text-[14px] leading-tight text-gray-800"
          style={{ color: selectedPlan ? selectedPlan.accent : undefined }}
        >
          {mealEntries.map(({ slot, meal }, idx) => (
            <span key={slot.slotId} className="inline-flex items-center gap-1 min-w-0 group/meal">
              {idx > 0 && <span className="text-gray-300 shrink-0 mr-1">·</span>}
              <span
                className="truncate hover:underline underline-offset-2 decoration-gray-400 cursor-pointer max-w-[180px]"
                onClick={() => {
                  onShowMobilePreview(meal);
                  onSelectSlot(slot.slotId);
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const spaceOnRight = window.innerWidth - rect.right;
                  const placement: "left" | "right" =
                    spaceOnRight > POPUP_WIDTH + 24 ? "right" : "left";
                  onHoverMeal({
                    meal,
                    x: placement === "right" ? rect.right + 12 : rect.left - 12,
                    y: rect.top + rect.height / 2,
                    placement,
                  });
                }}
                onMouseLeave={() => onHoverMeal(null)}
              >
                {meal.displayName}
              </span>
              <button
                type="button"
                onClick={(e) => onRemoveMeal(slot.slotId, e)}
                aria-label={`${meal.displayName} 삭제`}
                title="삭제"
                className="shrink-0 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-gray-400 hover:text-black hover:bg-gray-100 bg-transparent cursor-pointer transition-colors"
              >
                <X className="w-2.5 h-2.5" strokeWidth={2.5} />
              </button>
            </span>
          ))}
          {nextEmptySlot && (
            <button
              type="button"
              onClick={() => {
                if (selectedSlotId !== nextEmptySlot.slotId) onSelectSlot(nextEmptySlot.slotId);
              }}
              title={`${nextEmptySlot.mealTime} 메뉴 추가`}
              className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 border border-dashed text-[12px] transition-all cursor-pointer ${
                nextEmptySelected
                  ? "border-[#8C451D] bg-[#FDEEE8] text-[#8C451D]"
                  : "border-gray-300 bg-transparent text-gray-400 hover:border-gray-900 hover:text-gray-900"
              }`}
            >
              <Plus className="w-3 h-3" strokeWidth={2.5} />
              <span className="whitespace-nowrap">{nextEmptySlot.mealTime}</span>
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!firstSlot) return;
            if (selectedSlotId !== firstSlot.slotId) onSelectSlot(firstSlot.slotId);
          }}
          className={`group min-w-0 flex-1 flex items-center gap-2 cursor-pointer text-left py-1.5 px-3 border border-dashed transition-all ${
            isFirstSelected
              ? "border-[#8C451D] bg-[#FDEEE8] text-[#8C451D]"
              : "border-gray-300 bg-transparent text-gray-400 hover:border-gray-900 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <span
            className={`inline-flex shrink-0 items-center justify-center w-5 h-5 rounded-full border text-[13px] leading-none transition-colors ${
              isFirstSelected
                ? "border-[#8C451D] bg-[#8C451D] text-white"
                : "border-gray-400 text-gray-400 group-hover:border-gray-900 group-hover:text-gray-900"
            }`}
          >
            <Plus className="w-3 h-3" strokeWidth={2.5} />
          </span>
          <span className="text-[13px] whitespace-nowrap">
            점심 · 저녁 메뉴 추가하기
          </span>
        </button>
      )}
    </article>
  );
}
