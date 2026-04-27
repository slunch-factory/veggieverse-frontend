"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_MAP,
  type DayPlan,
  type DeliveryCycle,
  type DisplayMenuData,
  type DurationType,
  type ExcludeCategory,
  type MenuCategory,
  type MenuData,
  type PackComposition,
  type PurchaseType,
  generateWeekDays,
  getEarliestStartDate,
  isFlexibleToday,
} from "../_data/subscription";

export interface SubscribePlannerState {
  duration: DurationType;
  selectedExcludes: ExcludeCategory[];
  selectedSlotId: string | null;
  mealPlan: Record<string, DisplayMenuData>;
  selectedPlanType: MenuCategory | null;
  purchaseType: PurchaseType;
  deliveryCycle: DeliveryCycle | "";
  packComposition: PackComposition | "";
  startDate: Date;
  earliestStart: Date;
  flexible: boolean;
  startDateOptions: Date[];
  week1Days: DayPlan[];
  week2Days: DayPlan[];
  allDays: DayPlan[];
  filteredMeals: DisplayMenuData[];
  planMeals: { primary: DisplayMenuData[]; others: DisplayMenuData[] };
  totalPrice: number;
  filledSlots: number;
  totalSlots: number;
  variationCount: number;
  draggingMealId: string | null;
  dragOverDayKey: string | null;
  listScrollRef: React.RefObject<HTMLDivElement | null>;
}

export interface SubscribePlannerActions {
  setDuration: (d: DurationType) => void;
  setStartDate: (d: Date) => void;
  toggleExclude: (category: ExcludeCategory) => void;
  resetExcludes: () => void;
  selectSlot: (slotId: string) => void;
  addMeal: (meal: DisplayMenuData) => void;
  removeMeal: (slotId: string, e: React.MouseEvent) => void;
  selectPlanType: (planId: MenuCategory) => void;
  resetMealPlan: () => void;
  setPurchaseType: (t: PurchaseType) => void;
  setDeliveryCycle: (c: DeliveryCycle | "") => void;
  setPackComposition: (p: PackComposition | "") => void;
  startDragMeal: (mealId: string) => void;
  endDragMeal: () => void;
  setDragOverDay: (key: string | null) => void;
  dropMealOnDay: (dateKey: string, mealId: string) => void;
}

export function useSubscribePlanner(menuList: MenuData[]): SubscribePlannerState & SubscribePlannerActions {
  const menusMap = useMemo(
    () => Object.fromEntries(menuList.map((m) => [m.id, m])),
    [menuList],
  );
  const [duration, setDurationState] = useState<DurationType>(1);
  const [selectedExcludes, setSelectedExcludes] = useState<ExcludeCategory[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<Record<string, DisplayMenuData>>({});
  const [selectedPlanType, setSelectedPlanType] = useState<MenuCategory | null>(null);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("once");
  const [deliveryCycle, setDeliveryCycle] = useState<DeliveryCycle | "">("");
  const [packComposition, setPackComposition] = useState<PackComposition | "">("");
  const [draggingMealId, setDraggingMealId] = useState<string | null>(null);
  const [dragOverDayKey, setDragOverDayKey] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const earliestStart = useMemo(() => getEarliestStartDate(today), [today]);
  const flexible = useMemo(() => isFlexibleToday(today), [today]);
  const [startDate, setStartDateState] = useState<Date>(earliestStart);

  const listScrollRef = useRef<HTMLDivElement | null>(null);

  /** 1주↔2주 변경 시 플래너 초기화 */
  const prevDurationRef = useRef<DurationType | null>(null);
  useEffect(() => {
    if (prevDurationRef.current === null) {
      prevDurationRef.current = duration;
      return;
    }
    if (prevDurationRef.current === duration) return;
    prevDurationRef.current = duration;
    setMealPlan({});
    setSelectedSlotId(null);
    setSelectedPlanType(null);
  }, [duration]);

  /** 제외 재료 변경 시 캘린더 상 해당 메뉴도 제거 */
  useEffect(() => {
    if (selectedExcludes.length === 0) return;
    setMealPlan((prev) => {
      const next: Record<string, DisplayMenuData> = {};
      let changed = false;
      for (const slotId of Object.keys(prev)) {
        const meal = prev[slotId];
        if (meal.excludable.some((e) => selectedExcludes.includes(e))) {
          changed = true;
          continue;
        }
        next[slotId] = meal;
      }
      return changed ? next : prev;
    });
  }, [selectedExcludes]);

  /** 시작일 변경 시 플래너 초기화 */
  const prevStartRef = useRef<string | null>(null);
  useEffect(() => {
    const key = startDate.toISOString().split("T")[0];
    if (prevStartRef.current === null) {
      prevStartRef.current = key;
      return;
    }
    if (prevStartRef.current === key) return;
    prevStartRef.current = key;
    setMealPlan({});
    setSelectedSlotId(null);
    setSelectedPlanType(null);
    listScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [startDate]);

  const startDateOptions = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(earliestStart);
      d.setDate(earliestStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [earliestStart]);

  const week1Days = useMemo(() => generateWeekDays(startDate), [startDate]);
  const week2Days = useMemo(() => {
    const w2 = new Date(startDate);
    w2.setDate(startDate.getDate() + 7);
    return generateWeekDays(w2);
  }, [startDate]);
  const allDays = useMemo(
    () => (duration === 1 ? week1Days : [...week1Days, ...week2Days]),
    [duration, week1Days, week2Days],
  );

  const filteredMeals = useMemo(() => {
    let items: DisplayMenuData[] = menuList.map((m) => ({
      ...m,
      displayName: m.name,
      isVariation: false,
    }));
    if (selectedExcludes.length > 0) {
      items = items.filter((m) => !m.excludable.some((e) => selectedExcludes.includes(e)));
    }
    return items;
  }, [menuList, selectedExcludes]);

  const planMeals = useMemo(() => {
    if (!selectedPlanType) return { primary: [] as DisplayMenuData[], others: filteredMeals };
    const primary = filteredMeals.filter((m) => m.category === selectedPlanType);
    const others = filteredMeals.filter((m) => m.category !== selectedPlanType);
    return { primary, others };
  }, [filteredMeals, selectedPlanType]);

  const totalPrice = useMemo(
    () => Object.values(mealPlan).reduce((s, m) => s + m.price, 0),
    [mealPlan],
  );
  const filledSlots = Object.keys(mealPlan).length;
  const totalSlots = duration === 1 ? 14 : 28;
  const variationCount = useMemo(
    () => Object.values(mealPlan).filter((m) => m.isVariation).length,
    [mealPlan],
  );

  const setDuration = useCallback((d: DurationType) => setDurationState(d), []);
  const setStartDate = useCallback((d: Date) => setStartDateState(d), []);

  const toggleExclude = useCallback((category: ExcludeCategory) => {
    setSelectedExcludes((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }, []);

  const resetExcludes = useCallback(() => setSelectedExcludes([]), []);

  const selectSlot = useCallback((slotId: string) => {
    setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
  }, []);

  const addMeal = useCallback(
    (meal: DisplayMenuData) => {
      const allSlots = allDays.flatMap((d) => d.slots);
      if (duration === 2 && !selectedSlotId) {
        setMealPlan((prev) => {
          const next = { ...prev };
          allSlots.forEach((s) => {
            if (!next[s.slotId]) next[s.slotId] = meal;
          });
          return next;
        });
        setSelectedSlotId(null);
        return;
      }
      if (selectedSlotId) {
        setMealPlan((prev) => ({ ...prev, [selectedSlotId]: meal }));
        const idx = allSlots.findIndex((s) => s.slotId === selectedSlotId);
        const next = allSlots.slice(idx + 1).find((s) => !mealPlan[s.slotId]);
        setSelectedSlotId(next?.slotId || null);
      } else {
        const first = allSlots.find((s) => !mealPlan[s.slotId]);
        if (first) setMealPlan((prev) => ({ ...prev, [first.slotId]: meal }));
      }
    },
    [allDays, duration, mealPlan, selectedSlotId],
  );

  const removeMeal = useCallback((slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealPlan((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  const selectPlanType = useCallback(
    (planId: MenuCategory) => {
      const nextPlan = selectedPlanType === planId ? null : planId;
      setSelectedPlanType(nextPlan);
      if (!nextPlan) {
        setMealPlan({});
        setSelectedSlotId(null);
        return;
      }
      const cat = CATEGORY_MAP[planId];
      if (!cat) return;
      const meals: DisplayMenuData[] = menuList
        .filter((m) => m.category === cat)
        .map((m) => ({ ...m, displayName: m.name, isVariation: false }));
      if (meals.length === 0) return;
      const plan: Record<string, DisplayMenuData> = {};
      let i = 0;
      allDays.forEach((day) =>
        day.slots.forEach((slot) => {
          plan[slot.slotId] = meals[i++ % meals.length];
        }),
      );
      setMealPlan(plan);
      setSelectedSlotId(null);
    },
    [allDays, menuList, selectedPlanType],
  );

  const resetMealPlan = useCallback(() => {
    setMealPlan({});
    setSelectedSlotId(null);
    setSelectedPlanType(null);
  }, []);

  const startDragMeal = useCallback((mealId: string) => setDraggingMealId(mealId), []);
  const endDragMeal = useCallback(() => {
    setDraggingMealId(null);
    setDragOverDayKey(null);
  }, []);
  const setDragOverDay = useCallback((key: string | null) => setDragOverDayKey(key), []);

  const dropMealOnDay = useCallback(
    (dateKey: string, mealId: string) => {
      const menuItem = menusMap[mealId];
      if (!menuItem) return;
      const day = allDays.find((d) => d.dateKey === dateKey);
      if (!day) return;
      const displayMenu: DisplayMenuData = { ...menuItem, displayName: menuItem.name, isVariation: false };
      const emptySlot = day.slots.find((s) => !mealPlan[s.slotId]);
      const targetId = emptySlot ? emptySlot.slotId : day.slots[0]?.slotId;
      if (!targetId) return;
      setMealPlan((prev) => ({ ...prev, [targetId]: displayMenu }));
      setDraggingMealId(null);
      setDragOverDayKey(null);
    },
    [allDays, mealPlan, menusMap],
  );

  return {
    duration,
    selectedExcludes,
    selectedSlotId,
    mealPlan,
    selectedPlanType,
    purchaseType,
    deliveryCycle,
    packComposition,
    startDate,
    earliestStart,
    flexible,
    startDateOptions,
    week1Days,
    week2Days,
    allDays,
    filteredMeals,
    planMeals,
    totalPrice,
    filledSlots,
    totalSlots,
    variationCount,
    draggingMealId,
    dragOverDayKey,
    listScrollRef,
    setDuration,
    setStartDate,
    toggleExclude,
    resetExcludes,
    selectSlot,
    addMeal,
    removeMeal,
    selectPlanType,
    resetMealPlan,
    setPurchaseType,
    setDeliveryCycle,
    setPackComposition,
    startDragMeal,
    endDragMeal,
    setDragOverDay,
    dropMealOnDay,
  };
}
