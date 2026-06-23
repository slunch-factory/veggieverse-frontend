"use client";

import { useCallback, useState } from "react";
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
import { AllergyWarningModal } from "./AllergyWarningModal";
import { SubscribeTutorial } from "./SubscribeTutorial";

interface SubscribeClientProps {
  menus: MenuData[];
}

export function SubscribeClient({ menus }: SubscribeClientProps) {
  const router = useRouter();
  const p = useSubscribePlanner(menus);
  const [showAllergyModal, setShowAllergyModal] = useState(false);

  // 실제 주문 제출 (팝업 확인 후 또는 수정 없을 때 바로 호출)
  const proceedToOrder = useCallback(async () => {
    setShowAllergyModal(false);

    const items = p.allDays.map((day) => ({
      date: day.dateKey,
      lunch: p.mealPlan[`${day.dateKey}-0`] ? Number(p.mealPlan[`${day.dateKey}-0`].id) : 0,
      dinner: p.mealPlan[`${day.dateKey}-1`] ? Number(p.mealPlan[`${day.dateKey}-1`].id) : 0,
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
    p.allDays,
    p.startDate,
    p.mealPlan,
    p.purchaseType,
    p.deliveryCycle,
    p.packComposition,
    p.totalPrice,
    router,
  ]);

  // 구매 버튼 클릭: 수정 여부에 따라 분기
  const handleOrderSubmit = useCallback(() => {
    if (p.isMealPlanModified) {
      setShowAllergyModal(true);
    } else {
      proceedToOrder();
    }
  }, [p.isMealPlanModified, proceedToOrder]);

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
      onSetMeal={p.setMealToSlot}
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
      <AllergyWarningModal
        open={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        onConfirm={proceedToOrder}
      />
      <SubscribeTutorial />
    </>
  );
}
