"use client";

import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { DayPlan, DisplayMenuData } from "../_data/subscription";
import { formatPrice } from "../_data/subscription";
import { MealImage } from "./MealImage";

interface ScheduleOverviewModalProps {
  open: boolean;
  onClose: () => void;
  allDays: DayPlan[];
  mealPlan: Record<string, DisplayMenuData>;
}

/**
 * 구독 스케줄 "펼쳐서 보기" 모달 — 지금까지 고른 식단을 일차×끼니 그리드로
 * 한눈에 보여주는 읽기 전용 뷰. 하단에 선택 개수·총 금액 요약.
 */
export function ScheduleOverviewModal({
  open,
  onClose,
  allDays,
  mealPlan,
}: ScheduleOverviewModalProps) {
  const maxSlots = Math.max(1, ...allDays.map((d) => d.slots.length));
  const totalSlots = allDays.reduce((acc, d) => acc + d.slots.length, 0);
  const selectedMeals = allDays.flatMap((d) =>
    d.slots.map((s) => mealPlan[s.slotId]).filter(Boolean),
  );
  const totalPrice = selectedMeals.reduce((acc, m) => acc + m.price, 0);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      position="center"
      labelledBy="schedule-overview-title"
      className="flex w-[min(960px,94vw)] max-h-[86dvh] flex-col overflow-hidden bg-white"
      style={{ borderRadius: 20 }}
    >
      {/* 헤더 */}
      <div className="flex shrink-0 items-center justify-between border-b border-[rgba(26,10,5,0.1)] px-6 py-4">
        <h2 id="schedule-overview-title" className="text-[15px] font-bold text-black">
          구독 스케줄 한눈에 보기
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#9a928c] transition-colors hover:text-black"
        >
          <X size={18} strokeWidth={1.6} />
        </button>
      </div>

      {/* 본문 — 일차 × 끼니 그리드 (좁은 화면에선 가로 스크롤) */}
      <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
        <div
          className="grid min-w-[600px] gap-x-2.5 gap-y-3"
          style={{ gridTemplateColumns: `repeat(${allDays.length}, minmax(0, 1fr))` }}
        >
          {/* 일차 헤더 */}
          {allDays.map((day) => (
            <div key={day.dateKey} className="text-center">
              <span className="text-[12px] font-bold text-black">{day.dayIndex}</span>
              <span className="ml-0.5 text-[11px] text-[#9a928c]">일차</span>
            </div>
          ))}

          {/* 끼니 행 */}
          {Array.from({ length: maxSlots }).flatMap((_, slotIndex) =>
            allDays.map((day) => {
              const slot = day.slots[slotIndex];
              if (!slot) return <div key={`${slotIndex}-${day.dateKey}`} />;
              const meal = mealPlan[slot.slotId];
              return (
                <div key={`${slotIndex}-${day.dateKey}`} className="min-w-0">
                  {meal ? (
                    <div>
                      <div
                        className="relative w-full overflow-hidden bg-[#f5f3f0]"
                        style={{ aspectRatio: "1 / 1", borderRadius: 10 }}
                      >
                        <MealImage
                          src={meal.image}
                          alt={meal.displayName}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <p className="mt-1.5 text-[10px] leading-none text-[#9a928c]">
                        {slot.mealTime}
                      </p>
                      <p className="mt-1 truncate text-[12px] leading-tight text-black">
                        {meal.displayName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#6e5035]">
                        {formatPrice(meal.price)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div
                        className="flex w-full items-center justify-center border border-dashed border-[rgba(26,10,5,0.18)] bg-[#fcfaf8]"
                        style={{ aspectRatio: "1 / 1", borderRadius: 10 }}
                      >
                        <span className="text-[11px] text-[#c2bab2]">미선택</span>
                      </div>
                      <p className="mt-1.5 text-[10px] leading-none text-[#9a928c]">
                        {slot.mealTime}
                      </p>
                    </div>
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* 푸터 — 선택 요약 */}
      <div className="flex shrink-0 items-center justify-between border-t border-[rgba(26,10,5,0.1)] px-6 py-4">
        <span className="text-[13px] text-[#6e5035]">
          선택한 식단{" "}
          <b className="text-black tabular-nums">
            {selectedMeals.length} / {totalSlots}끼
          </b>
        </span>
        <span className="text-[13px] text-[#6e5035]">
          총 구매 금액{" "}
          <b className="text-[15px] text-black tabular-nums">{formatPrice(totalPrice)}</b>
        </span>
      </div>
    </Modal>
  );
}
