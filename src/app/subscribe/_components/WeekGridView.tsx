"use client";

import type { DayPlan, DisplayMenuData } from "../_data/subscription";
import { WEEKDAY_KO, getHolidayMeta } from "../_data/subscription";
import { MiniCalendar } from "./MiniCalendar";
import { MealImage } from "./MealImage";

interface WeekGridViewProps {
  startDate: Date;
  earliestStart: Date;
  allDays: DayPlan[];
  mealPlan: Record<string, DisplayMenuData>;
  selectedSlotId: string | null;
  draggingMealId: string | null;
  dragOverDayKey: string | null;
  onStartDateChange: (d: Date) => void;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
}

const SLOT_LABELS = ["점심", "저녁"] as const;
const CELL_H = 130; // px — HTML 프로토타입과 동일

export function WeekGridView({
  startDate,
  earliestStart,
  allDays,
  mealPlan,
  selectedSlotId,
  draggingMealId,
  dragOverDayKey,
  onStartDateChange,
  onSelectSlot,
  onRemoveMeal,
  onDragOverDay,
  onDropMeal,
}: WeekGridViewProps) {
  return (
    <div className="flex overflow-hidden" style={{ height: CELL_H * 2 + 50 }}>
      {/* ── 좌: 미니 캘린더 (고정 280px) ── */}
      <div className="w-[280px] shrink-0 border-r border-[#e5e2dc] overflow-y-auto no-scrollbar">
        <div className="p-4">
          <MiniCalendar
            startDate={startDate}
            minDate={earliestStart}
            onSelect={onStartDateChange}
          />
        </div>
      </div>

      {/* ── 우: 7일 그리드 ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* 열 헤더 — 날짜 + 요일 */}
        <div className="grid grid-cols-7 shrink-0 border-b border-[#e5e2dc]" style={{ height: 50 }}>
          {allDays.map((day) => {
            const dow = day.date.getDay();
            const meta = getHolidayMeta(day.date);
            const isSun = dow === 0 || Boolean(meta.labelKo);
            const isSat = dow === 6;
            const mm = String(day.date.getMonth() + 1).padStart(2, "0");
            const dd = String(day.date.getDate()).padStart(2, "0");
            const isLastDay = day.dateKey === allDays[allDays.length - 1]?.dateKey;

            return (
              <div
                key={day.dateKey}
                className={`flex flex-col items-center justify-center ${!isLastDay ? "border-r border-[#e5e2dc]" : ""}`}
              >
                <span className={`text-[11px] leading-none ${isSun ? "text-red-400" : isSat ? "text-blue-400" : "text-gray-400"}`}>
                  {mm}.{dd}
                </span>
                <span className={`text-[13px] font-medium mt-0.5 ${isSun ? "text-red-500" : isSat ? "text-blue-500" : "text-gray-800"}`}>
                  {WEEKDAY_KO[dow]}
                </span>
              </div>
            );
          })}
        </div>

        {/* 식단 행 — 점심(row 0) / 저녁(row 1), 각 130px 고정 */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(2, ${CELL_H}px)` }}>
          {([0, 1] as const).flatMap((slotIndex) =>
            allDays.map((day) => {
              const slot = day.slots[slotIndex];
              const isLastDay = day.dateKey === allDays[allDays.length - 1]?.dateKey;

              if (!slot) {
                return (
                  <div
                    key={`${slotIndex}-${day.dateKey}`}
                    className={`${!isLastDay ? "border-r border-[#e5e2dc]" : ""} ${slotIndex === 0 ? "border-b border-[#e5e2dc]" : ""}`}
                    style={{ height: CELL_H }}
                  />
                );
              }

              const meal = mealPlan[slot.slotId];
              const isDragOver = dragOverDayKey === day.dateKey;
              const isSelected = selectedSlotId === slot.slotId;

              return (
                <div
                  key={`${slotIndex}-${day.dateKey}`}
                  className={`relative flex flex-col overflow-hidden transition-colors ${
                    !isLastDay ? "border-r border-[#e5e2dc]" : ""
                  } ${slotIndex === 0 ? "border-b border-[#e5e2dc]" : ""} ${
                    isDragOver ? "bg-[#FDEEE8]" : ""
                  }`}
                  style={{ height: CELL_H }}
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
                    if (mealId) onDropMeal(day.dateKey, mealId);
                  }}
                >
                  {meal ? (
                    <>
                      <div className="relative flex-1 min-h-0 bg-[#F5F5F5]">
                        <MealImage
                          src={meal.image}
                          alt={meal.displayName}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => onRemoveMeal(slot.slotId, e)}
                          aria-label={`${meal.displayName} 삭제`}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/55 text-white flex items-center justify-center text-[12px] leading-none hover:bg-black transition-colors z-10"
                        >
                          ×
                        </button>
                      </div>
                      <div className="shrink-0 px-1.5 py-1 bg-white border-t border-[#f0ede8]">
                        <p className="text-[9px] text-gray-500 truncate leading-tight">{SLOT_LABELS[slotIndex]}</p>
                        <p className="text-[10px] text-gray-800 truncate leading-tight">{meal.displayName}</p>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectSlot(slot.slotId)}
                      title={`${SLOT_LABELS[slotIndex]} 랜덤 추가`}
                      className={`w-full h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer border border-dashed m-0.5 ${
                        isSelected
                          ? "border-[#8C451D] bg-[#FDEEE8] text-[#8C451D]"
                          : "border-[#d4cfc7] bg-transparent text-gray-400 hover:border-[#8C451D] hover:text-[#8C451D]"
                      }`}
                      style={{ width: "calc(100% - 4px)", height: CELL_H - 4 }}
                    >
                      <span className="text-[18px] leading-none">+</span>
                      <span className="text-[9px]">{SLOT_LABELS[slotIndex]}</span>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
