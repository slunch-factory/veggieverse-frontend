"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { type MenuData } from "../_data/subscription";
import { postPlan } from "@/lib/api/subscription";
import { saveOrder } from "../_data/order";
import { useSubscribePlanner } from "../_hooks/useSubscribePlanner";
import { SubscribeShell } from "./SubscribeShell";
import { MenuLibrary } from "./MenuLibrary";
import { PlannerColumn } from "./PlannerColumn";
import { CheckoutBar } from "./CheckoutBar";
import { MobileCheckoutBar } from "./MobileCheckoutBar";
import { Snackbar } from "./Snackbar";

interface SubscribeClientProps {
  menus: MenuData[];
}

export function SubscribeClient({ menus }: SubscribeClientProps) {
  const router = useRouter();
  const p = useSubscribePlanner(menus);

  const handleOrderSubmit = useCallback(async () => {
    // mealPlan → productId별 수량 집계
    const itemMap: Record<number, number> = {};
    for (const meal of Object.values(p.mealPlan)) {
      const id = Number(meal.id);
      itemMap[id] = (itemMap[id] ?? 0) + 1;
    }
    const items = Object.entries(itemMap).map(([id, quantity]) => ({
      productId: Number(id),
      quantity,
    }));

    const result = await postPlan(items);
    if (result?.planId) {
      sessionStorage.setItem("veggieverse-plan-id", result.planId);
    }

    saveOrder({
      duration: 1,
      startDateISO: p.startDate.toISOString(),
      mealPlan: p.mealPlan,
      purchaseType: p.purchaseType,
      deliveryCycle: p.deliveryCycle,
      packComposition: p.packComposition,
      totalPrice: p.totalPrice,
    });
    router.push("/subscribe/order");
  }, [
    p.startDate,
    p.mealPlan,
    p.purchaseType,
    p.deliveryCycle,
    p.packComposition,
    p.totalPrice,
    router,
  ]);

  const menuColumn = (
    <MenuLibrary
      dietType={p.dietType}
      nutritionGoals={p.nutritionGoals}
      allergyFilters={p.allergyFilters}
      spicyPreference={p.spicyPreference}
      filteredMeals={p.filteredMeals}
      draggingMealId={p.draggingMealId}
      onDietTypeChange={p.setDietType}
      onNutritionGoalToggle={p.toggleNutritionGoal}
      onAllergyFilterToggle={p.toggleAllergyFilter}
      onSpicyPreferenceChange={p.setSpicyPreference}
      onResetFilters={p.resetAllFilters}
      onAddMeal={p.addMeal}
      onDragStartMeal={p.startDragMeal}
      onDragEndMeal={p.endDragMeal}
    />
  );

  const plannerTopColumn = (
    <PlannerColumn
      startDate={p.startDate}
      earliestStart={p.earliestStart}
      allDays={p.allDays}
      mealPlan={p.mealPlan}
      selectedSlotId={p.selectedSlotId}
      selectedPlan={null}
      selectedPlanType={null}
      filledSlots={p.filledSlots}
      draggingMealId={p.draggingMealId}
      dragOverDayKey={p.dragOverDayKey}
      listScrollRef={p.listScrollRef}
      onStartDateChange={p.setStartDate}
      onSelectSlot={p.selectSlot}
      onRemoveMeal={p.removeMeal}
      onDragOverDay={p.setDragOverDay}
      onDropMeal={p.dropMealOnDay}
      onResetMealPlan={p.resetMealPlan}
    />
  );

  const plannerBottomColumn = (
    <CheckoutBar
      totalPrice={p.totalPrice}
      filledSlots={p.filledSlots}
      onSubmit={handleOrderSubmit}
    />
  );

  return (
    <>
      <SubscribeShell
        menuColumn={menuColumn}
        plannerTopColumn={plannerTopColumn}
        plannerBottomColumn={plannerBottomColumn}
        mobileBottomBar={(onOpenMenu) => (
          <MobileCheckoutBar
            totalPrice={p.totalPrice}
            filledSlots={p.filledSlots}
            onSubmit={handleOrderSubmit}
            onOpenMenu={onOpenMenu}
          />
        )}
      />
      <Snackbar message={p.snackbarMsg} onClose={p.clearSnackbar} />
    </>
  );
}
