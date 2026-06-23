"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/contexts/UserContext";
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
  /** 스피릿 추천 식단에서 1개 이상 변경됐으면 true. 추천 없이 직접 구성한 경우도 true. */
  isMealPlanModified: boolean;
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
  setMealToSlot: (slotId: string, meal: DisplayMenuData) => void;
  clearSnackbar: () => void;
}

export function useSubscribePlanner(menuList: MenuData[]): SubscribePlannerState & SubscribePlannerActions {
  // 비로그인(게스트)은 구독 메뉴 리스트를 sessionStorage에 저장/복원하지 않는다.
  const { isLoggedIn, isLoadingSession } = useUser();

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
  /** 스피릿 추천 적용 직후의 슬롯→메뉴ID 스냅샷. 추천 없으면 null. */
  const [recommendedSnapshot, setRecommendedSnapshot] = useState<Record<string, string> | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const earliestStart = useMemo(() => getEarliestStartDate(today), [today]);
  const flexible = useMemo(() => isFlexibleToday(today), [today]);
  const [startDate, setStartDateState] = useState<Date>(earliestStart);

  const listScrollRef = useRef<HTMLDivElement | null>(null);

  /** 식이 유형 → ExcludeCategory 매핑 (백엔드에 dietType 필드 추가되면 교체) */
  const dietTypeExcludes = useMemo<ExcludeCategory[]>(() => {
    if (dietType === "vegan") return ["shellfish", "fish", "chicken", "egg", "dairy"];
    if (dietType === "pesco") return ["chicken", "egg"];
    if (dietType === "pollo") return ["shellfish", "fish"];
    return [];
  }, [dietType]);

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

  // 저장된 식단 복원 — 로그인 사용자만. (게스트는 저장하지 않으므로 복원도 하지 않음)
  const restoredRef = useRef(false);
  useEffect(() => {
    if (isLoadingSession || restoredRef.current) return;
    restoredRef.current = true;
    if (!isLoggedIn) return;
    try {
      const raw = sessionStorage.getItem("subscribe-meal-plan");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setMealPlan(JSON.parse(raw) as Record<string, DisplayMenuData>);
    } catch {
      // ignore
    }
  }, [isLoadingSession, isLoggedIn]);

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

  // 식단 저장 — 로그인 사용자만. 게스트는 저장하지 않고(창 나가면 사라짐) 기존 키도 제거.
  useEffect(() => {
    if (isLoadingSession) return;
    if (!isLoggedIn) {
      sessionStorage.removeItem("subscribe-meal-plan");
      return;
    }
    if (Object.keys(mealPlan).length > 0) {
      sessionStorage.setItem("subscribe-meal-plan", JSON.stringify(mealPlan));
    } else {
      sessionStorage.removeItem("subscribe-meal-plan");
    }
  }, [mealPlan, isLoggedIn, isLoadingSession]);

  useEffect(() => {
    if (spiritAppliedRef.current) return;
    if (spiritRecommended.length === 0 || allDays.length === 0) return;
    spiritAppliedRef.current = true;
    const plan: Record<string, DisplayMenuData> = {};
    const snapshot: Record<string, string> = {};
    let i = 0;
    allDays.forEach((day) =>
      day.slots.forEach((slot) => {
        const menu = spiritRecommended[i % spiritRecommended.length];
        plan[slot.slotId] = { ...menu, displayName: menu.name, isVariation: false };
        snapshot[slot.slotId] = String(menu.id);
        i++;
      }),
    );
    setMealPlan(plan);
    setRecommendedSnapshot(snapshot);
  }, [spiritRecommended, allDays]);

  const filteredMeals = useMemo(() => {
    const NUTRITION_UI_TO_API: Record<NutritionGoal, string> = {
      "plant-based": "plant_based",
      "low-carb": "low_carb",
      "low-calorie": "low_calorie",
      "high-protein": "high_protein",
      "low-sodium": "low_sodium",
    };
    const ALLERGY_UI_TO_API: Record<AllergyFilter, string[]> = {
      nuts: ["tree_nuts"],
      peanut: ["peanuts"],
      dairy: ["dairy"],
    };

    let items: DisplayMenuData[] = menuList.map((m) => ({
      ...m,
      displayName: m.name,
      isVariation: false,
    }));

    if (dietTypeExcludes.length > 0) {
      items = items.filter((m) => !m.excludable.some((e) => dietTypeExcludes.includes(e)));
    }

    if (nutritionGoals.length > 0) {
      const targetGoals = nutritionGoals.map((g) => NUTRITION_UI_TO_API[g]);
      items = items.filter((m) =>
        targetGoals.some((g) => m.spirit?.healthGoals.includes(g)),
      );
    }

    if (allergyFilters.length > 0) {
      const blocked = allergyFilters.flatMap((f) => ALLERGY_UI_TO_API[f] ?? []);
      items = items.filter((m) => !m.spirit?.allergens.some((a) => blocked.includes(a)));
    }

    if (spicyPreference === "exclude") {
      items = items.filter((m) => !m.spirit?.spicy);
    } else if (spicyPreference === "include") {
      items = items.filter((m) => m.spirit?.spicy);
    }

    return items;
  }, [menuList, dietTypeExcludes, nutritionGoals, allergyFilters, spicyPreference]);

  const totalPrice = useMemo(
    () => Object.values(mealPlan).reduce((s, m) => s + m.price, 0),
    [mealPlan],
  );
  const filledSlots = Object.keys(mealPlan).length;
  const totalSlots = 14;

  const isMealPlanModified = useMemo(() => {
    // 추천 스냅샷 없음 → 직접 구성 → 수정됨으로 간주
    if (!recommendedSnapshot) return true;
    const snapshotKeys = Object.keys(recommendedSnapshot);
    const currentKeys = Object.keys(mealPlan);
    if (snapshotKeys.length !== currentKeys.length) return true;
    return snapshotKeys.some(
      (slot) => recommendedSnapshot[slot] !== String(mealPlan[slot]?.id ?? ""),
    );
  }, [recommendedSnapshot, mealPlan]);

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
    setAllergyFilters((prev) =>
      prev.includes(v) ? prev.filter((a) => a !== v) : [...prev, v],
    );
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

  const setMealToSlot = useCallback((slotId: string, meal: DisplayMenuData) => {
    setMealPlan((prev) => ({ ...prev, [slotId]: meal }));
  }, []);

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
    isMealPlanModified,
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
    setMealToSlot,
    clearSnackbar: () => setSnackbarMsg(null),
  };
}
