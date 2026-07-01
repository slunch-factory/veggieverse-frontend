"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Plus } from "lucide-react";
import type { DayPlan, DisplayMenuData, MenuData } from "../_data/subscription";
import { getSlotRecommend } from "@/lib/api/subscription";
import { Skeleton } from "@/components/ui/Skeleton";
import { MealImage } from "./MealImage";
import { setSlotDragImage } from "./dragGhost";

interface DayRowProps {
  day: DayPlan;
  mealPlan: Record<string, DisplayMenuData>;
  selectedSlotId: string | null;
  draggingMealId: string | null;
  draggingSlotId: string | null;
  dragOverDayKey: string | null;
  onSelectSlot: (slotId: string) => void;
  onRemoveMeal: (slotId: string, e: React.MouseEvent) => void;
  onCopyDay: (dateKey: string) => void;
  onDragOverDay: (key: string | null) => void;
  onDropMeal: (dateKey: string, mealId: string) => void;
  onDragStartSlot: (slotId: string, mealId: string) => void;
  onDragEndMeal: () => void;
  onReorderSlot: (sourceSlotId: string, targetSlotId: string) => void;
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
    <div className="mt-1.5 p-[10px] bg-[#faf8f5] border border-[rgba(26,10,5,0.12)] rounded-[10px]">
      <p className="text-[11px] font-bold tracking-[0.05em] text-[#9a928c] mb-[8px]">추천 메뉴</p>
      {loading ? (
        <div className="grid grid-cols-3 gap-[10px]" aria-busy="true">
          <span className="sr-only">추천 메뉴를 불러오는 중</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[5px]">
              <div className="aspect-square rounded-[8px] overflow-hidden">
                <Skeleton width="100%" height="100%" radius={8} />
              </div>
              <Skeleton width="80%" height={11} />
            </div>
          ))}
        </div>
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
              <div className="aspect-square rounded-[8px] overflow-hidden bg-[#e8e4de]">
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
  draggingSlotId,
  dragOverDayKey,
  onSelectSlot,
  onRemoveMeal,
  onCopyDay,
  onDragOverDay,
  onDropMeal,
  onDragStartSlot,
  onDragEndMeal,
  onReorderSlot,
  onSetMeal,
}: DayRowProps) {
  const [recSlot, setRecSlot] = useState<string | null>(null);
  // 재배치 드래그 시 hover 중인 슬롯(드롭 대상) — 시각 표시용.
  const [overSlotId, setOverSlotId] = useState<string | null>(null);
  const dayHasMeals = day.slots.some((s) => mealPlan[s.slotId]);
  const isDragOver = dragOverDayKey === day.dateKey;

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
      className={`rounded-[14px] border transition-colors ${
        isDragOver
          ? "border-black bg-[rgba(223,255,79,0.16)]"
          : "border-[rgba(26,10,5,0.08)] bg-white"
      }`}
    >
      {/* 헤더: N일차 + 복사 */}
      <header className="flex items-center justify-between px-3.5 pt-2.5 pb-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-bold leading-none text-[#1a0a05]">{day.dayIndex}</span>
          <span className="text-[11px] font-medium leading-none text-[#9a928c]">일차</span>
        </div>
        {dayHasMeals && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("이 날의 식단을 다른 모든 날에 복사할까요?")) return;
              onCopyDay(day.dateKey);
            }}
            aria-label="이 날 식단을 모든 날에 복사"
            title="이 날 식단을 모든 날에 복사"
            className="flex items-center gap-1 text-[11px] text-[#9a928c] hover:text-black transition-colors"
          >
            <Copy size={12} strokeWidth={1.8} />
            복사
          </button>
        )}
      </header>

      {/* 슬롯들 — 부드러운 카드 행, 구분선 없이 간격으로 분리 */}
      <div className="flex flex-col gap-1.5 px-2 pb-2">
        {day.slots.map((slot) => {
          const meal = mealPlan[slot.slotId];
          const isSelected = selectedSlotId === slot.slotId;
          // 재배치 드래그 중이고 출발 슬롯이 아니면 드롭 대상 후보.
          const isReorderTarget =
            draggingSlotId !== null && draggingSlotId !== slot.slotId;
          const isSourceSlot = draggingSlotId === slot.slotId;

          return (
            <div
              key={slot.slotId}
              // 스케줄 안 순서 변경: 슬롯에 메뉴를 드롭하면 두 칸을 맞바꾼다.
              // 라이브러리에서 끌어온 드래그(draggingSlotId=null)는 가로채지 않고
              // 데이(article) 레벨 드롭으로 흘려보낸다.
              onDragOver={(e) => {
                if (!isReorderTarget) return;
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";
                if (overSlotId !== slot.slotId) setOverSlotId(slot.slotId);
              }}
              onDragLeave={(e) => {
                if (!isReorderTarget) return;
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                if (overSlotId === slot.slotId) setOverSlotId(null);
              }}
              onDrop={(e) => {
                if (!draggingSlotId) return;
                e.preventDefault();
                e.stopPropagation();
                onReorderSlot(draggingSlotId, slot.slotId);
                setOverSlotId(null);
              }}
              className={`rounded-[11px] transition-shadow ${
                isReorderTarget && overSlotId === slot.slotId
                  ? "shadow-[inset_0_0_0_2px_#1a0a05]"
                  : ""
              }`}
            >
              {/* 추가/삭제 시 빈 슬롯↔메뉴가 부드럽게 크로스페이드. 고정 높이로 점프 방지.
                  initial=false → 첫 마운트(추천 채움·길이 변경)에는 애니메이션 미발동. */}
              <AnimatePresence mode="wait" initial={false}>
                {meal ? (
                  <motion.div
                    key={meal.id}
                    initial={{ opacity: 0, scale: 0.85, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 520, damping: 30 }}
                    className="h-[56px]"
                  >
                    {/* 네이티브 HTML5 드래그는 안쪽 div에 — motion.div의 onDragStart는
                        framer 제스처(PanInfo) 타입이라 e.dataTransfer와 충돌. */}
                    <div
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", meal.id);
                        setSlotDragImage(e, meal);
                        onDragStartSlot(slot.slotId, meal.id);
                      }}
                      onDragEnd={onDragEndMeal}
                      className={`flex h-full flex-row items-center gap-2.5 overflow-hidden rounded-[10px] bg-[#faf8f5] px-2 cursor-grab active:cursor-grabbing transition-opacity ${
                        isSourceSlot ? "opacity-40" : ""
                      }`}
                    >
                      <div className="h-[42px] w-[42px] shrink-0 overflow-hidden rounded-[8px] bg-[#fcfaf8]">
                        <MealImage
                          src={meal.image}
                          alt={meal.displayName}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] overflow-hidden">
                        <span className="inline-flex w-fit items-center rounded-full bg-[#efe9df] px-[7px] py-[1px] text-[10px] leading-snug text-[#6b6560]">
                          {slot.mealTime}
                        </span>
                        <span className="truncate text-[13px] font-medium leading-tight text-[#1a0a05]">
                          {meal.displayName}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-row items-center gap-[6px]">
                        <span className="whitespace-nowrap text-[13px] tabular-nums text-[#3d3d3d]">
                          {meal.price.toLocaleString()}원
                        </span>
                        <button
                          type="button"
                          onClick={(e) => onRemoveMeal(slot.slotId, e)}
                          aria-label={`${meal.displayName} 삭제`}
                          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[rgba(26,10,5,0.06)] text-[13px] leading-none text-[#6b6560] transition-colors hover:bg-black hover:text-[#dfff4f]"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="flex h-[56px] flex-row items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectSlot(slot.slotId)}
                      className={`flex h-full min-w-0 flex-1 flex-row items-center gap-2.5 rounded-[10px] px-2.5 text-left transition-colors ${
                        isSelected
                          ? "border border-black bg-[#faf8f5] shadow-[inset_0_0_0_1.5px_#dfff4f]"
                          : "border border-dashed border-[rgba(26,10,5,0.18)] bg-[#faf8f5] hover:border-[rgba(26,10,5,0.4)]"
                      }`}
                    >
                      <span className="inline-flex w-fit items-center rounded-full bg-[#efe9df] px-[7px] py-[1px] text-[10px] leading-snug text-[#9a928c]">
                        {slot.mealTime}
                      </span>
                      <span className="truncate text-[12px] text-[#9a928c]">메뉴 추가</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecSlot((p) => (p === slot.slotId ? null : slot.slotId))}
                      aria-label={`${slot.mealTime} 추천 메뉴`}
                      title="추천 메뉴"
                      className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full border border-[rgba(26,10,5,0.2)] bg-white text-[#3d3d3d] transition-colors hover:border-black hover:bg-black hover:text-[#dfff4f]"
                    >
                      <Plus size={15} strokeWidth={1.8} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!meal && recSlot === slot.slotId && (
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
