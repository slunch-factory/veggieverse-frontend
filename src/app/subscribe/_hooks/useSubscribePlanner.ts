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
  type MealsPerDay,
  type MenuData,
  type NutritionGoal,
  type PackComposition,
  type PlanDays,
  type PurchaseType,
  type SpicyPreference,
  generatePlanDays,
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
  planDays: PlanDays;
  mealsPerDay: MealsPerDay;
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
  clearSelectedSlot: () => void;
  addMeal: (meal: DisplayMenuData) => void;
  removeMeal: (slotId: string, e: React.MouseEvent) => void;
  fillEmptyRandom: () => void;
  reshuffleAll: () => void;
  copyDayToAll: (dateKey: string) => void;
  resetMealPlan: () => void;
  setPurchaseType: (t: PurchaseType) => void;
  setDeliveryCycle: (c: DeliveryCycle | "") => void;
  setPackComposition: (p: PackComposition | "") => void;
  setPlanDays: (n: PlanDays) => void;
  setMealsPerDay: (n: MealsPerDay) => void;
  startDragMeal: (mealId: string) => void;
  endDragMeal: () => void;
  setDragOverDay: (key: string | null) => void;
  dropMealOnDay: (dateKey: string, mealId: string) => void;
  setMealToSlot: (slotId: string, meal: DisplayMenuData) => void;
  clearSnackbar: () => void;
}

export function useSubscribePlanner(menuList: MenuData[]): SubscribePlannerState & SubscribePlannerActions {
  // 비로그인(게스트)은 구독 메뉴 리스트를 sessionStorage에 저장/복원하지 않는다.
  const { isLoadingSession } = useUser();

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
  const [planDays, setPlanDaysState] = useState<PlanDays>(7);
  const [mealsPerDay, setMealsPerDayState] = useState<MealsPerDay>(2);
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

  const allDays = useMemo(
    () => generatePlanDays(startDate, planDays, mealsPerDay),
    [startDate, planDays, mealsPerDay],
  );

  // 저장된 식단 복원 — 게스트 포함(같은 탭 세션). 새로고침해도 작업이 사라지지 않게 한다.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (isLoadingSession || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = sessionStorage.getItem("subscribe-meal-plan");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setMealPlan(JSON.parse(raw) as Record<string, DisplayMenuData>);
    } catch {
      // ignore
    }
  }, [isLoadingSession]);

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

  // 식단 저장 — 게스트 포함(같은 탭 세션). 결제 시점에 로그인은 별도로 요구된다.
  useEffect(() => {
    if (isLoadingSession) return;
    if (Object.keys(mealPlan).length > 0) {
      sessionStorage.setItem("subscribe-meal-plan", JSON.stringify(mealPlan));
    } else {
      sessionStorage.removeItem("subscribe-meal-plan");
    }
  }, [mealPlan, isLoadingSession]);

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

  // 현재 플랜 길이·끼니에 해당하는 슬롯만 유효. 플랜을 줄이면 그 슬롯의 메뉴는
  // mealPlan에 남아 있어도(orphan) 가격·개수 계산에서 제외한다.
  const validSlotIds = useMemo(
    () => new Set(allDays.flatMap((d) => d.slots.map((s) => s.slotId))),
    [allDays],
  );
  const totalPrice = useMemo(() => {
    let sum = 0;
    validSlotIds.forEach((id) => {
      const m = mealPlan[id];
      if (m) sum += m.price;
    });
    return sum;
  }, [validSlotIds, mealPlan]);
  const filledSlots = useMemo(() => {
    let n = 0;
    validSlotIds.forEach((id) => {
      if (mealPlan[id]) n++;
    });
    return n;
  }, [validSlotIds, mealPlan]);
  const totalSlots = planDays * mealsPerDay;

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

  // 길이·끼니 변경 시 선택 슬롯은 사라질 수 있으니 해제. 담긴 메뉴는 일차 기준으로
  // 보존(줄이면 초과분은 orphan으로 제외, 늘리면 빈칸 추가).
  const setPlanDays = useCallback((n: PlanDays) => {
    setPlanDaysState(n);
    setSelectedSlotId(null);
  }, []);
  const setMealsPerDay = useCallback((n: MealsPerDay) => {
    setMealsPerDayState(n);
    setSelectedSlotId(null);
  }, []);

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

  // 슬롯을 "담을 대상"으로 지정만 한다(토글). 같은 슬롯을 다시 누르면 해제.
  // 예전엔 탭하면 랜덤 메뉴로 즉시 채웠으나, "슬롯 선택→메뉴 카드 클릭으로 담기"
  // 흐름과 충돌해 제거했다. (랜덤 채움이 필요하면 별도 "랜덤 채우기"로 분리)
  const selectSlot = useCallback((slotId: string) => {
    setSelectedSlotId((prev) => (prev === slotId ? null : slotId));
  }, []);

  const clearSelectedSlot = useCallback(() => setSelectedSlotId(null), []);

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

  // 빈 슬롯만 현재 필터에 맞는 메뉴 중 랜덤으로 채운다(이미 담긴 칸은 보존).
  const fillEmptyRandom = useCallback(() => {
    if (filteredMeals.length === 0) return;
    setMealPlan((prev) => {
      const next = { ...prev };
      allDays.forEach((day) =>
        day.slots.forEach((slot) => {
          if (next[slot.slotId]) return;
          next[slot.slotId] = filteredMeals[Math.floor(Math.random() * filteredMeals.length)];
        }),
      );
      return next;
    });
  }, [allDays, filteredMeals]);

  // 전체 슬롯을 랜덤으로 다시 구성(이미 가득 찬 플랜을 새로 굴릴 때).
  const reshuffleAll = useCallback(() => {
    if (filteredMeals.length === 0) return;
    setMealPlan((prev) => {
      const next = { ...prev };
      allDays.forEach((day) =>
        day.slots.forEach((slot) => {
          next[slot.slotId] = filteredMeals[Math.floor(Math.random() * filteredMeals.length)];
        }),
      );
      return next;
    });
  }, [allDays, filteredMeals]);

  // 한 날의 식단을 다른 모든 날의 같은 끼니(index) 칸에 복사한다.
  // 원본 칸이 비어 있으면 해당 끼니는 건드리지 않는다.
  const copyDayToAll = useCallback(
    (dateKey: string) => {
      const source = allDays.find((d) => d.dateKey === dateKey);
      if (!source) return;
      setMealPlan((prev) => {
        const next = { ...prev };
        allDays.forEach((day) => {
          if (day.dateKey === dateKey) return;
          day.slots.forEach((slot) => {
            const srcSlot = source.slots.find((s) => s.index === slot.index);
            const srcMeal = srcSlot ? prev[srcSlot.slotId] : undefined;
            if (srcMeal) next[slot.slotId] = srcMeal;
          });
        });
        return next;
      });
    },
    [allDays],
  );

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
    planDays,
    mealsPerDay,
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
    clearSelectedSlot,
    addMeal,
    removeMeal,
    fillEmptyRandom,
    reshuffleAll,
    copyDayToAll,
    resetMealPlan,
    setPurchaseType,
    setDeliveryCycle,
    setPackComposition,
    setPlanDays,
    setMealsPerDay,
    startDragMeal,
    endDragMeal,
    setDragOverDay,
    dropMealOnDay,
    setMealToSlot,
    clearSnackbar: () => setSnackbarMsg(null),
  };
}
