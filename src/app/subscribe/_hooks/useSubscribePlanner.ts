"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type AllergyFilter,
  type DayPlan,
  type DeliveryCycle,
  type DietType,
  type DisplayMenuData,
  type ExcludeCategory,
  type MenuData,
  type NutritionGoal,
  type PackComposition,
  type PurchaseType,
  type SpicyPreference,
  generateWeekDays,
  getEarliestStartDate,
  isFlexibleToday,
} from "../_data/subscription";

export interface SubscribePlannerState {
  dietType: DietType | null;
  nutritionGoals: NutritionGoal[];
  allergyFilters: AllergyFilter[];
  spicyPreference: SpicyPreference | null;
  selectedSlotId: string | null;
  mealPlan: Record<string, DisplayMenuData>;
  purchaseType: PurchaseType;
  deliveryCycle: DeliveryCycle | "";
  packComposition: PackComposition | "";
  startDate: Date;
  earliestStart: Date;
  flexible: boolean;
  startDateOptions: Date[];
  allDays: DayPlan[];
  filteredMeals: DisplayMenuData[];
  totalPrice: number;
  filledSlots: number;
  totalSlots: number;
  variationCount: number;
  draggingMealId: string | null;
  dragOverDayKey: string | null;
  listScrollRef: React.RefObject<HTMLDivElement | null>;
  snackbarMsg: string | null;
}

export interface SubscribePlannerActions {
  setStartDate: (d: Date) => void;
  setDietType: (v: DietType | null) => void;
  toggleNutritionGoal: (v: NutritionGoal) => void;
  toggleAllergyFilter: (v: AllergyFilter) => void;
  setSpicyPreference: (v: SpicyPreference | null) => void;
  resetAllFilters: () => void;
  selectSlot: (slotId: string) => void;
  addMeal: (meal: DisplayMenuData) => void;
  removeMeal: (slotId: string, e: React.MouseEvent) => void;
  resetMealPlan: () => void;
  setPurchaseType: (t: PurchaseType) => void;
  setDeliveryCycle: (c: DeliveryCycle | "") => void;
  setPackComposition: (p: PackComposition | "") => void;
  startDragMeal: (mealId: string) => void;
  endDragMeal: () => void;
  setDragOverDay: (key: string | null) => void;
  dropMealOnDay: (dateKey: string, mealId: string) => void;
  clearSnackbar: () => void;
}

export function useSubscribePlanner(menuList: MenuData[]): SubscribePlannerState & SubscribePlannerActions {
  const menusMap = useMemo(
    () => Object.fromEntries(menuList.map((m) => [m.id, m])),
    [menuList],
  );

  const [dietType, setDietTypeState] = useState<DietType | null>(null);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoal[]>([]);
  const [allergyFilters, setAllergyFilters] = useState<AllergyFilter[]>([]);
  const [spicyPreference, setSpicyPreferenceState] = useState<SpicyPreference | null>(null);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<Record<string, DisplayMenuData>>({});
  const [spiritRecommended, setSpiritRecommended] = useState<MenuData[]>([]);
  const spiritAppliedRef = useRef(false);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("once");
  const [deliveryCycle, setDeliveryCycle] = useState<DeliveryCycle | "">("");
  const [packComposition, setPackComposition] = useState<PackComposition | "">("");
  const [draggingMealId, setDraggingMealId] = useState<string | null>(null);
  const [dragOverDayKey, setDragOverDayKey] = useState<string | null>(null);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const earliestStart = useMemo(() => getEarliestStartDate(today), [today]);
  const flexible = useMemo(() => isFlexibleToday(today), [today]);
  const [startDate, setStartDateState] = useState<Date>(earliestStart);

  const listScrollRef = useRef<HTMLDivElement | null>(null);

  /** 새 필터 → ExcludeCategory 변환 (메뉴 제거 및 필터링에 사용) */
  const selectedExcludes = useMemo<ExcludeCategory[]>(() => {
    const excludes = new Set<ExcludeCategory>();

    if (dietType === "vegan") {
      (["shellfish", "fish", "chicken", "egg", "dairy"] as ExcludeCategory[]).forEach((e) => excludes.add(e));
    } else if (dietType === "pesco") {
      (["chicken", "egg"] as ExcludeCategory[]).forEach((e) => excludes.add(e));
    }

    const hasNoneAllergy = allergyFilters.includes("none");
    if (!hasNoneAllergy) {
      if (allergyFilters.includes("nuts") || allergyFilters.includes("peanut")) excludes.add("nuts");
      if (allergyFilters.includes("dairy")) excludes.add("dairy");
    }

    if (spicyPreference === "exclude") excludes.add("spicy");

    return Array.from(excludes);
  }, [dietType, allergyFilters, spicyPreference]);

  /** 필터 변경 시 해당 메뉴 캘린더에서 제거 */
  useEffect(() => {
    if (selectedExcludes.length === 0) return;
    setMealPlan((prev) => {
      const next: Record<string, DisplayMenuData> = {};
      let changed = false;
      for (const slotId of Object.keys(prev)) {
        const meal = prev[slotId];
        if (meal.excludable.some((e) => selectedExcludes.includes(e as ExcludeCategory))) {
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

  const allDays = useMemo(() => generateWeekDays(startDate), [startDate]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("subscribe-meal-plan");
      if (raw) setMealPlan(JSON.parse(raw) as Record<string, DisplayMenuData>);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("spirit-auto-plan");
    if (!raw) return;
    sessionStorage.removeItem("spirit-auto-plan");
    try {
      const parsed: MenuData[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSpiritRecommended(parsed);
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  useEffect(() => {
    if (Object.keys(mealPlan).length > 0) {
      sessionStorage.setItem("subscribe-meal-plan", JSON.stringify(mealPlan));
    } else {
      sessionStorage.removeItem("subscribe-meal-plan");
    }
  }, [mealPlan]);

  useEffect(() => {
    if (spiritAppliedRef.current) return;
    if (spiritRecommended.length === 0 || allDays.length === 0) return;
    spiritAppliedRef.current = true;
    const plan: Record<string, DisplayMenuData> = {};
    let i = 0;
    allDays.forEach((day) =>
      day.slots.forEach((slot) => {
        const menu = spiritRecommended[i % spiritRecommended.length];
        plan[slot.slotId] = { ...menu, displayName: menu.name, isVariation: false };
        i++;
      }),
    );
    setMealPlan(plan);
  }, [spiritRecommended, allDays]);

  const filteredMeals = useMemo(() => {
    let items: DisplayMenuData[] = menuList.map((m) => ({
      ...m,
      displayName: m.name,
      isVariation: false,
    }));

    if (selectedExcludes.length > 0) {
      items = items.filter((m) => !m.excludable.some((e) => selectedExcludes.includes(e as ExcludeCategory)));
    }

    if (nutritionGoals.length > 0) {
      const animalExcludes: ExcludeCategory[] = ["shellfish", "fish", "chicken", "egg"];
      items = items.filter((m) =>
        nutritionGoals.some((goal) => {
          switch (goal) {
            case "plant-based":
              return !m.excludable.some((e) => animalExcludes.includes(e as ExcludeCategory));
            case "low-carb":
            case "low-calorie":
            case "low-sodium":
              return m.category === "slim";
            case "high-protein":
              return m.category === "protein";
            default:
              return true;
          }
        }),
      );
    }

    return items;
  }, [menuList, selectedExcludes, nutritionGoals]);

  const totalPrice = useMemo(
    () => Object.values(mealPlan).reduce((s, m) => s + m.price, 0),
    [mealPlan],
  );
  const filledSlots = Object.keys(mealPlan).length;
  const totalSlots = 14;
  const variationCount = useMemo(
    () => Object.values(mealPlan).filter((m) => m.isVariation).length,
    [mealPlan],
  );

  const setStartDate = useCallback((d: Date) => setStartDateState(d), []);

  const setDietType = useCallback((v: DietType | null) => setDietTypeState(v), []);

  const toggleNutritionGoal = useCallback((v: NutritionGoal) => {
    setNutritionGoals((prev) =>
      prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v],
    );
  }, []);

  const toggleAllergyFilter = useCallback((v: AllergyFilter) => {
    if (v === "none") {
      setAllergyFilters((prev) => (prev.includes("none") ? [] : ["none"]));
    } else {
      setAllergyFilters((prev) => {
        const without = prev.filter((a) => a !== "none");
        return without.includes(v) ? without.filter((a) => a !== v) : [...without, v];
      });
    }
  }, []);

  const setSpicyPreference = useCallback(
    (v: SpicyPreference | null) => setSpicyPreferenceState(v),
    [],
  );

  const resetAllFilters = useCallback(() => {
    setDietTypeState(null);
    setNutritionGoals([]);
    setAllergyFilters([]);
    setSpicyPreferenceState(null);
  }, []);

  const selectSlot = useCallback((slotId: string) => {
    if (filteredMeals.length > 0) {
      const random = filteredMeals[Math.floor(Math.random() * filteredMeals.length)];
      setMealPlan((prev) => ({ ...prev, [slotId]: random }));
    }
    setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
  }, [filteredMeals]);

  const addMeal = useCallback(
    (meal: DisplayMenuData) => {
      const allSlots = allDays.flatMap((d) => d.slots);
      if (selectedSlotId) {
        setMealPlan((prev) => ({ ...prev, [selectedSlotId]: meal }));
        const idx = allSlots.findIndex((s) => s.slotId === selectedSlotId);
        const next = allSlots.slice(idx + 1).find((s) => !mealPlan[s.slotId]);
        setSelectedSlotId(next?.slotId || null);
      } else {
        const first = allSlots.find((s) => !mealPlan[s.slotId]);
        if (first) {
          setMealPlan((prev) => ({ ...prev, [first.slotId]: meal }));
        } else {
          setSnackbarMsg("식단이 가득 찼어요. 기존 식단을 삭제하고 다시 추가해 보세요.");
        }
      }
    },
    [allDays, mealPlan, selectedSlotId],
  );

  const removeMeal = useCallback((slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealPlan((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }, []);

  const resetMealPlan = useCallback(() => {
    setMealPlan({});
    setSelectedSlotId(null);
    sessionStorage.removeItem("subscribe-meal-plan");
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
    dietType,
    nutritionGoals,
    allergyFilters,
    spicyPreference,
    selectedSlotId,
    mealPlan,
    purchaseType,
    deliveryCycle,
    packComposition,
    startDate,
    earliestStart,
    flexible,
    startDateOptions,
    allDays,
    filteredMeals,
    totalPrice,
    filledSlots,
    totalSlots,
    variationCount,
    draggingMealId,
    dragOverDayKey,
    listScrollRef,
    snackbarMsg,
    setStartDate,
    setDietType,
    toggleNutritionGoal,
    toggleAllergyFilter,
    setSpicyPreference,
    resetAllFilters,
    selectSlot,
    addMeal,
    removeMeal,
    resetMealPlan,
    setPurchaseType,
    setDeliveryCycle,
    setPackComposition,
    startDragMeal,
    endDragMeal,
    setDragOverDay,
    dropMealOnDay,
    clearSnackbar: () => setSnackbarMsg(null),
  };
}
