"use client";

import { useState } from "react";
import { Maximize2, Shuffle, Trash2 } from "lucide-react";
import type {
  DayPlan,
  DisplayMenuData,
  MealsPerDay,
} from "../_data/subscription";
import { MEALS_PER_DAY_OPTIONS } from "../_data/subscription";
import { DayRow } from "./DayRow";
import { ScheduleOverviewModal } from "./ScheduleOverviewModal";

interface PlannerColumnProps {
  allDays: DayPlan[];
  mealPlan: Record<string, DisplayMenuData>;
  selectedSlotId: string | null;
  mealsPerDay: MealsPerDay;
  filledSlots: number;
  draggingMealId: string | null;
  draggingSlotId: string | null;
  dragOverDayKey: string | null;
  listScrollRef: React.RefObject<HTMLDivElement | null>;
  onMealsPerDayChange: (n: MealsPerDay) => void;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onCopyDay: (dateKey: string) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
  onDragStartSlot: (slotId: string, mealId: string) => void;
  onDragEndMeal: () => void;
  onReorderSlot: (sourceSlotId: string, targetSlotId: string) => void;
  onResetMealPlan: () => void;
  onFillRandom: () => void;
  onReshuffle: () => void;
  onSetMeal: (slotId: string, meal: DisplayMenuData) => void;
}

export function PlannerColumn({
  allDays,
  mealPlan,
  selectedSlotId,
  mealsPerDay,
  filledSlots,
  draggingMealId,
  draggingSlotId,
  dragOverDayKey,
  listScrollRef,
  onMealsPerDayChange,
  onSelectSlot,
  onRemoveMeal,
  onCopyDay,
  onDragOverDay,
  onDropMeal,
  onDragStartSlot,
  onDragEndMeal,
  onReorderSlot,
  onResetMealPlan,
  onFillRandom,
  onReshuffle,
  onSetMeal,
}: PlannerColumnProps) {
  const hasEmpty = allDays.some((d) => d.slots.some((s) => !mealPlan[s.slotId]));
  const hasSlots = allDays.some((d) => d.slots.length > 0);
  const [overviewOpen, setOverviewOpen] = useState(false);

  return (
    <section
      className="relative flex flex-col h-full min-h-0 bg-[#fcfaf8]"
      aria-label="구독 일정 플래너"
    >
      {/* 타이틀 행 — 랜덤 채우기(좌) / 전체 비우기(우) */}
      <div className="relative shrink-0 h-[48px] px-5 flex items-center justify-center border-b border-[rgba(26,10,5,0.1)] bg-white">
        <h2 className="text-[14px] font-normal tracking-[-0.005em] text-black">구독 스케쥴</h2>
        {hasSlots && (
          <button
            type="button"
            onClick={() => {
              if (hasEmpty) {
                onFillRandom();
              } else if (confirm("이미 모두 채워져 있어요. 전체를 새로 랜덤 구성할까요?")) {
                onReshuffle();
              }
            }}
            aria-label={hasEmpty ? "빈 칸 랜덤 채우기" : "전체 랜덤 재구성"}
            title={hasEmpty ? "빈 칸 랜덤 채우기" : "전체 랜덤 재구성"}
            className="absolute left-5 flex items-center gap-1 text-[#9a928c] hover:text-black transition-colors"
          >
            <Shuffle className="w-4 h-4" strokeWidth={1.6} />
            <span className="text-[11px]">랜덤</span>
          </button>
        )}
        {filledSlots > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("선택한 식단을 모두 삭제할까요?")) return;
              onResetMealPlan();
            }}
            aria-label="식단 전체 비우기"
            title="식단 전체 비우기"
            className="absolute right-5 flex items-center gap-1 text-[#9a928c] hover:text-[#d4513b] transition-colors"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.6} />
            <span className="text-[11px]">비우기</span>
          </button>
        )}
      </div>

      {/* 끼니 선택 (플랜 길이는 7일 고정) + 펼쳐서 보기 */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-[rgba(26,10,5,0.1)] bg-white overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1">
          {MEALS_PER_DAY_OPTIONS.map((n) => (
            <SegButton key={n} active={n === mealsPerDay} onClick={() => onMealsPerDayChange(n)}>
              {n}끼
            </SegButton>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOverviewOpen(true)}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px] text-[#9a928c] transition-colors hover:text-black"
        >
          <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.6} />
          펼쳐서 보기
        </button>
      </div>

      {/* 일정 리스트 — 1일차 ~ N일차 (카드형) */}
      <div
        ref={listScrollRef}
        className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto bg-[#fcfaf8] p-3"
      >
        {allDays.map((day) => (
          <DayRow
            key={day.dateKey}
            day={day}
            mealPlan={mealPlan}
            selectedSlotId={selectedSlotId}
            draggingMealId={draggingMealId}
            draggingSlotId={draggingSlotId}
            dragOverDayKey={dragOverDayKey}
            onSelectSlot={onSelectSlot}
            onRemoveMeal={onRemoveMeal}
            onCopyDay={onCopyDay}
            onDragOverDay={onDragOverDay}
            onDropMeal={onDropMeal}
            onDragStartSlot={onDragStartSlot}
            onDragEndMeal={onDragEndMeal}
            onReorderSlot={onReorderSlot}
            onSetMeal={onSetMeal}
          />
        ))}
      </div>

      {/* 펼쳐서 보기 — 고른 식단 전체를 한눈에 */}
      <ScheduleOverviewModal
        open={overviewOpen}
        onClose={() => setOverviewOpen(false)}
        allDays={allDays}
        mealPlan={mealPlan}
      />
    </section>
  );
}

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3 py-[5px] text-[12px] leading-none transition-colors ${
        active
          ? "bg-black text-[#dfff4f]"
          : "border border-[rgba(26,10,5,0.2)] bg-white text-[#3d3d3d] hover:border-black"
      }`}
    >
      {children}
    </button>
  );
}
