"use client";

import { useMemo, useRef, useState } from "react";
import type { DisplayMenuData, MenuCategory } from "../_data/subscription";
import { PLAN_TYPES } from "../_data/subscription";
import { MealImage } from "./MealImage";

interface MobileMealWheelProps {
  filteredMeals: DisplayMenuData[];
  selectedPlanType: MenuCategory | null;
  draggingMealId: string | null;
  onAddMeal: (m: DisplayMenuData) => void;
  onDragStartMeal: (id: string) => void;
  onDragEndMeal: () => void;
}

interface PointerState {
  startX: number;
  startY: number;
  startIdx: number;
  moved: boolean;
  direction: "none" | "horizontal" | "vertical-up";
}

const SPACING = 120;
const OUTER_SPACING = 55;

export function MobileMealWheel({
  filteredMeals,
  selectedPlanType,
  draggingMealId,
  onAddMeal,
  onDragStartMeal,
  onDragEndMeal,
}: MobileMealWheelProps) {
  const [centerIdx, setCenterIdx] = useState(0);
  const [prevPlan, setPrevPlan] = useState<MenuCategory | null>(selectedPlanType);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const pointerRef = useRef<PointerState | null>(null);

  /** 플랜 선택 시: 해당 카테고리 메뉴가 앞, 그 외는 뒤로 정렬. 전체는 유지. */
  const sortedMeals = useMemo(() => {
    if (!selectedPlanType) return filteredMeals;
    const primary = filteredMeals.filter((m) => m.category === selectedPlanType);
    const others = filteredMeals.filter((m) => m.category !== selectedPlanType);
    return [...primary, ...others];
  }, [filteredMeals, selectedPlanType]);

  /** 플랜이 바뀌면 첫번째(대표 식단)로 센터 이동 — 렌더 중 파생 상태 초기화 패턴 */
  if (prevPlan !== selectedPlanType) {
    setPrevPlan(selectedPlanType);
    setCenterIdx(0);
  }

  const count = sortedMeals.length;

  /** 현재 중앙 메뉴가 속한 카테고리 라벨 (플랜 선택 시에만 표시) */
  const centerCategoryLabel = useMemo(() => {
    if (!selectedPlanType || count === 0) return null;
    const centerMeal = sortedMeals[centerIdx];
    if (!centerMeal) return null;
    if (centerMeal.category === selectedPlanType) {
      return {
        text: PLAN_TYPES.find((p) => p.id === selectedPlanType)?.name ?? "",
        tone: "primary" as const,
      };
    }
    return { text: "그 외 메뉴", tone: "others" as const };
  }, [centerIdx, selectedPlanType, sortedMeals, count]);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startIdx: centerIdx,
      moved: false,
      direction: "none",
    };
    setDragDelta(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = pointerRef.current;
    if (!s) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.moved && Math.hypot(dx, dy) > 6) {
      s.moved = true;
      setIsDragging(true);
    }
    if (!s.moved) return;
    if (s.direction === "none") {
      if (Math.abs(dy) > Math.abs(dx) && dy < 0) s.direction = "vertical-up";
      else s.direction = "horizontal";
    }
    if (s.direction === "horizontal") setDragDelta(dx);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const s = pointerRef.current;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (!s) {
      setDragDelta(0);
      return;
    }
    if (!s.moved) {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const btn = (el as HTMLElement | null)?.closest("[data-meal-id]");
      const mealId = btn?.getAttribute("data-meal-id");
      if (mealId) {
        const idx = sortedMeals.findIndex((m) => m.id === mealId);
        if (idx >= 0) {
          if (idx === centerIdx) onAddMeal(sortedMeals[idx]);
          else setCenterIdx(idx);
        }
      }
    } else if (s.direction === "vertical-up") {
      const dy = e.clientY - s.startY;
      if (dy < -30) setSheetOpen(true);
    } else {
      const steps = Math.round(-dragDelta / SPACING);
      const next = count > 0 ? (((s.startIdx + steps) % count) + count) % count : 0;
      setCenterIdx(next);
    }
    setDragDelta(0);
    setIsDragging(false);
    pointerRef.current = null;
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointerRef.current = null;
    setDragDelta(0);
    setIsDragging(false);
  };

  return (
    <>
      <div
        className="relative h-[140px] overflow-visible select-none bg-gray-200 border-t border-gray-200"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {centerCategoryLabel && (
          <div className="absolute top-2 right-4 z-0 flex items-center gap-1 text-[11px] pointer-events-none">
            <span
              className={
                centerCategoryLabel.tone === "primary" ? "text-[#8C451D]" : "text-gray-500"
              }
            >
              {centerCategoryLabel.text}
            </span>
          </div>
        )}
        {count === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[12px] text-gray-400">
            조건에 맞는 메뉴가 없습니다
          </div>
        ) : (
          sortedMeals.map((meal, idx) => {
            const half = count / 2;
            let delta = idx - centerIdx;
            if (count > 1) {
              if (delta > half) delta -= count;
              else if (delta <= -half) delta += count;
            }
            const pos = delta + dragDelta / SPACING;
            const absPos = Math.abs(pos);
            const signPos = pos < 0 ? -1 : 1;
            const displayX =
              absPos <= 1
                ? pos * SPACING
                : signPos * (SPACING + (absPos - 1) * OUTER_SPACING);
            const scale = absPos < 0.5 ? 1 : absPos < 1.5 ? 0.7 : absPos < 2.5 ? 0.5 : 0.4;
            const opacity = absPos < 2.5 ? 1 : 0;
            const interactive = absPos < 2.5;
            return (
              <button
                key={meal.id}
                type="button"
                data-meal-id={meal.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "copy";
                  e.dataTransfer.setData("text/plain", meal.id);
                  onDragStartMeal(meal.id);
                }}
                onDragEnd={onDragEndMeal}
                className={`absolute bg-transparent border-0 flex flex-col items-center gap-1.5 ${
                  draggingMealId === meal.id ? "opacity-40" : ""
                }`}
                style={{
                  left: "50%",
                  bottom: 8,
                  width: 130,
                  transform: `translate(calc(-50% + ${displayX}px), 0) scale(${scale})`,
                  transformOrigin: "center bottom",
                  opacity,
                  pointerEvents: interactive ? "auto" : "none",
                  cursor: interactive ? "pointer" : "default",
                  transition: isDragging ? "none" : "transform 0.2s, opacity 0.2s",
                  zIndex: absPos < 0.5 ? 5 : absPos < 1.5 ? 3 : 1,
                }}
              >
                <div
                  className={`w-[130px] h-[130px] rounded-full overflow-hidden border-solid bg-gray-100 pointer-events-none ${
                    absPos < 0.5 ? "border-2 border-black" : "border border-gray-200"
                  }`}
                >
                  <MealImage
                    src={meal.image}
                    alt={meal.displayName}
                    className="w-full h-full object-cover scale-[1.35]"
                    draggable={false}
                  />
                </div>
                <span
                  className={`text-center leading-tight truncate pointer-events-none ${
                    absPos < 0.5
                      ? "text-[13px] text-black w-[130px]"
                      : absPos < 1.5
                        ? "text-[11px] text-gray-500 w-[110px]"
                        : "text-[11px] text-gray-500 w-[100px] opacity-0"
                  }`}
                >
                  {meal.displayName}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* 전체 메뉴 바텀시트 — 위로 스와이프 시 노출 */}
      {sheetOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[100] bg-black/40"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            className="lg:hidden fixed left-0 right-0 bottom-0 z-[101] bg-white border-t border-black flex flex-col max-h-[65dvh] animate-slideInUp"
            role="dialog"
          >
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="닫기"
              className="shrink-0 flex items-center justify-center py-2 bg-transparent cursor-pointer"
            >
              <span className="block w-10 h-1 rounded-full bg-gray-300" />
            </button>
            <div className="shrink-0 flex items-center justify-between px-4 pb-2">
              <h3 className="text-[13px]">전체 메뉴</h3>
              <span className="text-[11px] text-gray-400">{count}개</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {count === 0 ? (
                <div className="flex h-full items-center justify-center text-[13px] text-gray-400">
                  조건에 맞는 메뉴가 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {sortedMeals.map((meal, idx) => {
                    const active = idx === centerIdx;
                    return (
                      <button
                        key={meal.id}
                        type="button"
                        onClick={() => {
                          setCenterIdx(idx);
                          setSheetOpen(false);
                        }}
                        className="flex flex-col items-center gap-1.5 p-2 bg-transparent cursor-pointer transition-all"
                      >
                        <div
                          className={`w-full aspect-square rounded-full overflow-hidden bg-gray-100 border-solid ${
                            active ? "border-2 border-black" : "border border-gray-200"
                          }`}
                        >
                          <MealImage
                            src={meal.image}
                            alt={meal.displayName}
                            className="w-full h-full object-cover scale-[1.35]"
                            draggable={false}
                          />
                        </div>
                        <span
                          className={`text-[12px] leading-tight text-center truncate w-full ${
                            active ? "text-black" : "text-gray-700"
                          }`}
                        >
                          {meal.displayName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
