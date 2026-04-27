"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { type MenuData } from "../_data/subscription";
import { getCustomedPlan } from "@/lib/api/subscription";
import { saveOrder } from "../_data/order";
import { useSubscribePlanner } from "../_hooks/useSubscribePlanner";
import { SubscribeShell } from "./SubscribeShell";
import { MenuLibrary } from "./MenuLibrary";
import { PlannerColumn } from "./PlannerColumn";
import { CheckoutBar } from "./CheckoutBar";
import { MobileMealWheel } from "./MobileMealWheel";

interface SubscribeClientProps {
  menus: MenuData[];
}

export function SubscribeClient({ menus }: SubscribeClientProps) {
  const router = useRouter();
  const p = useSubscribePlanner(menus);

  const handleOrderSubmit = useCallback(async () => {
    saveOrder({
      duration: 1,
      startDateISO: p.startDate.toISOString(),
      mealPlan: p.mealPlan,
      purchaseType: p.purchaseType,
      deliveryCycle: p.deliveryCycle,
      packComposition: p.packComposition,
      totalPrice: p.totalPrice,
    });
    const planId = sessionStorage.getItem("spirit-plan-id");
    if (planId) {
      await getCustomedPlan(planId);
    }
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

  return (
    <SubscribeShell
      mobileWheel={
        <MobileMealWheel
          filteredMeals={p.filteredMeals}
          selectedPlanType={null}
          draggingMealId={p.draggingMealId}
          onAddMeal={p.addMeal}
          onDragStartMeal={p.startDragMeal}
          onDragEndMeal={p.endDragMeal}
        />
      }
      menuColumn={
        <MenuLibrary
          selectedExcludes={p.selectedExcludes}
          filteredMeals={p.filteredMeals}
          draggingMealId={p.draggingMealId}
          onToggleExclude={p.toggleExclude}
          onResetExcludes={p.resetExcludes}
          onAddMeal={p.addMeal}
          onDragStartMeal={p.startDragMeal}
          onDragEndMeal={p.endDragMeal}
        />
      }
      plannerTopColumn={
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
      }
      plannerBottomColumn={
        <CheckoutBar
          totalPrice={p.totalPrice}
          filledSlots={p.filledSlots}
          onSubmit={handleOrderSubmit}
        />
      }
    />
  );
}
