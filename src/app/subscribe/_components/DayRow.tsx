"use client";

import { useState, useEffect } from "react";
import type { DayPlan, DisplayMenuData, MenuData } from "../_data/subscription";
import { getHolidayMeta, WEEKDAY_KO } from "../_data/subscription";
import { getSlotRecommend } from "@/lib/api/subscription";
import { MealImage } from "./MealImage";

interface DayRowProps {
  day: DayPlan;
  mealPlan: Record<string, DisplayMenuData>;
  selectedSlotId: string | null;
  draggingMealId: string | null;
  dragOverDayKey: string | null;
  onSelectStartDate: (d: Date) => void;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
  onSetMeal: (slotId: string, meal: DisplayMenuData) => void;
}

function SlotRecPanel({ onPick }: { onPick: (meal: MenuData) => void }) {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState<MenuData[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSlotRecommend().then((ms) => {
      if (!cancelled) { setMenus(ms); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-3 mb-[10px] p-[10px] bg-[#faf8f5] border border-black rounded-[6px]">
      <p className="text-[11px] font-bold tracking-[0.05em] text-[#9a928c] mb-[8px]">추천 메뉴</p>
      {loading ? (
        <p className="text-[11px] text-[#9a928c]">로딩 중…</p>
      ) : menus.length === 0 ? (
        <p className="text-[11px] text-[#9a928c]">추천 메뉴를 불러올 수 없어요.</p>
      ) : (
        <div className="grid grid-cols-3 gap-[10px]">
          {menus.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              className="flex flex-col gap-[5px] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
            >
              <div className="aspect-square border border-black rounded-[4px] overflow-hidden bg-[#e8e4de]">
                <MealImage src={m.image} alt={m.name} className="w-full h-full object-cover" draggable={false} />
              </div>
              <p className="text-[11px] leading-tight text-[#3d3d3d] line-clamp-2">{m.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DayRow({
  day,
  mealPlan,
  selectedSlotId,
  draggingMealId,
  dragOverDayKey,
  onSelectStartDate,
  onSelectSlot,
  onRemoveMeal,
  onDragOverDay,
  onDropMeal,
  onSetMeal,
}: DayRowProps) {
  const [recSlot, setRecSlot] = useState<string | null>(null);

  const dow = day.date.getDay();
  const meta = getHolidayMeta(day.date);
  const isSunday = dow === 0;
  const isSaturday = dow === 6;
  const isHoliday = Boolean(meta.labelKo);
  const dowShort = WEEKDAY_KO[dow];
  const mm = String(day.date.getMonth() + 1).padStart(2, "0");
  const dd = String(day.date.getDate()).padStart(2, "0");
  const isDragOver = dragOverDayKey === day.dateKey;

  const dowColor =
    isHoliday ? "text-[#ffab91]"
    : isSunday ? "text-[#e68a45]"
    : isSaturday ? "text-[#7eb5e6]"
    : "text-[#9a928c]";

  const dateColor =
    isHoliday ? "text-[#ffab91]"
    : isSunday ? "text-[#e68a45]"
    : isSaturday ? "text-[#7eb5e6]"
    : "text-[#3d3d3d]";

  return (
    <article
      data-day-key={day.dateKey}
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
      className={`grid border-b border-black last:border-b-0 transition-colors ${
        isDragOver ? "bg-[rgba(223,255,79,0.14)]"
        : isHoliday ? "bg-[#fbf2f2]"
        : "bg-white"
      }`}
      style={{ gridTemplateColumns: "72px minmax(0,1fr)" }}
    >
      {/* 날짜 열 */}
      <button
        type="button"
        onClick={() => onSelectStartDate(day.date)}
        title="이 날짜부터 배송 시작"
        className="flex flex-col items-center justify-center gap-[4px] text-center bg-transparent p-0 cursor-pointer hover:opacity-70 transition-opacity border-r border-[rgba(26,10,5,0.08)]"
      >
        <span className={`text-[11px] font-medium tracking-[0.04em] leading-none ${dowColor}`}>
          {dowShort}
        </span>
        <span className={`text-[16px] font-bold tracking-[-0.02em] leading-none ${dateColor}`}>
          {mm}.{dd}
        </span>
        {isHoliday && (
          <span className="text-[9px] text-[#ffab91] leading-tight">{meta.labelKo}</span>
        )}
      </button>

      {/* 슬롯 바디 */}
      <div className="flex flex-col min-w-0 divide-y divide-[rgba(26,10,5,0.06)]">
        {day.slots.map((slot) => {
          const meal = mealPlan[slot.slotId];
          const isSelected = selectedSlotId === slot.slotId;
          const isLunch = slot.mealTime === "점심";

          if (meal) {
            return (
              <div
                key={slot.slotId}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", meal.id);
                }}
                className="flex flex-row items-center gap-[10px] h-[62px] min-h-[62px] max-h-[62px] px-3 overflow-hidden cursor-grab active:cursor-grabbing"
              >
                {/* 썸네일 */}
                <div className="w-[46px] h-[46px] shrink-0 rounded-[3px] bg-[#fcfaf8] overflow-hidden">
                  <MealImage
                    src={meal.image}
                    alt={meal.displayName}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* 뱃지 + 이름 (세로 적층) */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px] overflow-hidden">
                  <span className={`inline-flex items-center w-fit px-[7px] py-[1px] text-[10px] leading-snug rounded-full ${
                    isLunch
                      ? "bg-[#f0ede8] text-[#6b6560]"
                      : "bg-[#e8e0d4] text-[#6b6560]"
                  }`}>
                    {slot.mealTime}
                  </span>
                  <span className="text-[13px] font-medium text-[#1a0a05] truncate leading-tight">
                    {meal.displayName}
                  </span>
                </div>

                {/* 가격 + 삭제 */}
                <div className="flex flex-row items-center gap-[6px] shrink-0">
                  <span className="text-[13px] text-[#3d3d3d] whitespace-nowrap tabular-nums">
                    {meal.price.toLocaleString()}원
                  </span>
                  <button
                    type="button"
                    onClick={(e) => onRemoveMeal(slot.slotId, e)}
                    aria-label={`${meal.displayName} 삭제`}
                    className="w-[22px] h-[22px] shrink-0 flex items-center justify-center rounded-full text-[13px] leading-none border border-[rgba(26,10,5,0.25)] bg-white text-[#3d3d3d] hover:bg-black hover:text-[#dfff4f] hover:border-black transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={slot.slotId} className="flex flex-col">
              <div className="flex flex-row items-center gap-[8px] h-[62px] min-h-[62px] max-h-[62px] px-3 overflow-hidden">
                <button
                  type="button"
                  onClick={() => onSelectSlot(slot.slotId)}
                  className={`flex-1 min-w-0 h-[46px] flex flex-row items-center border rounded-[4px] bg-[#faf8f5] px-[10px] gap-[10px] text-left transition-colors ${
                    isSelected
                      ? "border-black shadow-[inset_0_0_0_1.5px_#dfff4f]"
                      : "border-[rgba(26,10,5,0.1)] hover:border-[rgba(26,10,5,0.22)]"
                  }`}
                >
                  <div className="w-[32px] h-[32px] shrink-0 rounded-[3px] bg-[rgba(26,10,5,0.05)]" />
                  <div className="flex flex-col justify-center gap-[3px] min-w-0 overflow-hidden">
                    <span className={`inline-flex items-center w-fit px-[7px] py-[1px] text-[10px] leading-snug rounded-full ${
                      isLunch
                        ? "bg-[#f0ede8] text-[#9a928c]"
                        : "bg-[#e8e0d4] text-[#9a928c]"
                    }`}>
                      {slot.mealTime}
                    </span>
                    <span className="text-[11px] text-[#9a928c] truncate">{slot.mealTime} 추가</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRecSlot((p) => (p === slot.slotId ? null : slot.slotId))}
                  aria-label={`${slot.mealTime} 추가`}
                  className="w-[26px] h-[26px] shrink-0 flex items-center justify-center border border-[rgba(26,10,5,0.25)] rounded-full bg-white text-[#3d3d3d] text-[15px] leading-none font-light hover:bg-black hover:text-[#dfff4f] hover:border-black transition-colors"
                >
                  +
                </button>
              </div>
              {recSlot === slot.slotId && (
                <SlotRecPanel
                  onPick={(m) => {
                    onSetMeal(slot.slotId, { ...m, displayName: m.name, isVariation: false });
                    setRecSlot(null);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
