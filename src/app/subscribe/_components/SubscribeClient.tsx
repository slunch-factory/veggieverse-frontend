"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PLAN_TYPES } from "../_data/subscription";
import { saveOrder } from "../_data/order";
import { useSubscribePlanner } from "../_hooks/useSubscribePlanner";
import { SubscribeShell } from "./SubscribeShell";
import { PlanTabs } from "./PlanTabs";
import { MenuLibrary } from "./MenuLibrary";
import { PlannerColumn } from "./PlannerColumn";
import { CheckoutBar } from "./CheckoutBar";
import { MobileMealWheel } from "./MobileMealWheel";

export function SubscribeClient() {
  const router = useRouter();
  const p = useSubscribePlanner();

  const selectedPlan = useMemo(
    () => (p.selectedPlanType ? PLAN_TYPES.find((pl) => pl.id === p.selectedPlanType) ?? null : null),
    [p.selectedPlanType],
  );

  const handleOrderSubmit = useCallback(() => {
    saveOrder({
      duration: p.duration,
      startDateISO: p.startDate.toISOString(),
      mealPlan: p.mealPlan,
      purchaseType: p.purchaseType,
      deliveryCycle: p.deliveryCycle,
      packComposition: p.packComposition,
      totalPrice: p.totalPrice,
    });
    router.push("/subscribe/order");
  }, [
    p.duration,
    p.startDate,
    p.mealPlan,
    p.purchaseType,
    p.deliveryCycle,
    p.packComposition,
    p.totalPrice,
    router,
  ]);

  return (
    <SubscribeShell
      mobilePlanTabs={
        <PlanTabs
          plans={PLAN_TYPES}
          selectedPlanType={p.selectedPlanType}
          onSelect={p.selectPlanType}
          variant="mobile"
        />
      }
      mobileWheel={
        <MobileMealWheel
          filteredMeals={p.filteredMeals}
          selectedPlanType={p.selectedPlanType}
          draggingMealId={p.draggingMealId}
          onAddMeal={p.addMeal}
          onDragStartMeal={p.startDragMeal}
          onDragEndMeal={p.endDragMeal}
        />
      }
      menuColumn={
        <MenuLibrary
          selectedPlanType={p.selectedPlanType}
          selectedPlan={selectedPlan}
          selectedExcludes={p.selectedExcludes}
          planMeals={p.planMeals}
          filteredMeals={p.filteredMeals}
          draggingMealId={p.draggingMealId}
          onPlanTypeSelect={p.selectPlanType}
          onToggleExclude={p.toggleExclude}
          onResetExcludes={p.resetExcludes}
          onAddMeal={p.addMeal}
          onDragStartMeal={p.startDragMeal}
          onDragEndMeal={p.endDragMeal}
        />
      }
      plannerTopColumn={
        <PlannerColumn
          duration={p.duration}
          startDate={p.startDate}
          earliestStart={p.earliestStart}
          allDays={p.allDays}
          mealPlan={p.mealPlan}
          selectedSlotId={p.selectedSlotId}
          selectedPlan={selectedPlan}
          selectedPlanType={p.selectedPlanType}
          filledSlots={p.filledSlots}
          draggingMealId={p.draggingMealId}
          dragOverDayKey={p.dragOverDayKey}
          listScrollRef={p.listScrollRef}
          onDurationChange={p.setDuration}
          onStartDateChange={p.setStartDate}
          onSelectSlot={p.selectSlot}
          onRemoveMeal={p.removeMeal}
          onDragOverDay={p.setDragOverDay}
          onDropMeal={p.dropMealOnDay}
          onResetMealPlan={p.resetMealPlan}
        />
      }
      plannerBottomColumn={
        <CheckoutBar
          purchaseType={p.purchaseType}
          deliveryCycle={p.deliveryCycle}
          packComposition={p.packComposition}
          totalPrice={p.totalPrice}
          filledSlots={p.filledSlots}
          totalSlots={p.totalSlots}
          onChangePurchaseType={p.setPurchaseType}
          onChangeDeliveryCycle={p.setDeliveryCycle}
          onChangePackComposition={p.setPackComposition}
          onSubmit={handleOrderSubmit}
        />
      }
    />
  );
}
