"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { AllergyWarningModal } from "./AllergyWarningModal";
import { SubscribeTutorial } from "./SubscribeTutorial";
import { SubscribeInfoBanner } from "./SubscribeInfoBanner";

interface SubscribeClientProps {
  menus: MenuData[];
}

export function SubscribeClient({ menus }: SubscribeClientProps) {
  const router = useRouter();
  const p = useSubscribePlanner(menus);
  const [showAllergyModal, setShowAllergyModal] = useState(false);

  // 상단 안내 배너 — 세션 동안 닫으면 다시 뜨지 않는다. 배너 실측 높이를 shell 높이 계산에 넘긴다.
  const [bannerOpen, setBannerOpen] = useState(true);
  const [bannerH, setBannerH] = useState(0);
  const bannerWrapRef = useRef<HTMLDivElement>(null);

  // 실측 높이는 ResizeObserver 콜백(외부 구독)에서만 반영 — effect 본문 동기 setState 회피.
  useEffect(() => {
    const el = bannerWrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setBannerH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [bannerOpen]);

  const closeBanner = useCallback(() => {
    try {
      sessionStorage.setItem("slunch-subscribe-info-seen", "1");
    } catch {
      /* 무시 */
    }
    setBannerOpen(false);
  }, []);

  // 세션 내 이미 닫았으면 마운트 후 숨김(초기 렌더는 true → SSR 하이드레이션 불일치 방지)
  useEffect(() => {
    try {
      if (sessionStorage.getItem("slunch-subscribe-info-seen")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부(sessionStorage) UI 선호도 1회 동기화
        setBannerOpen(false);
      }
    } catch {
      /* 무시 */
    }
  }, []);

  // 선택된 슬롯의 사람용 라벨(예: "3일차 점심") — 메뉴 영역 안내 배너에 사용
  const selectedSlotLabel = useMemo(() => {
    if (!p.selectedSlotId) return null;
    for (const day of p.allDays) {
      const slot = day.slots.find((s) => s.slotId === p.selectedSlotId);
      if (slot) {
        return `${day.dayIndex}일차 ${slot.mealTime}`;
      }
    }
    return null;
  }, [p.selectedSlotId, p.allDays]);

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
      selectedSlotLabel={selectedSlotLabel}
      onCancelSelectedSlot={p.clearSelectedSlot}
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
      allDays={p.allDays}
      mealPlan={p.mealPlan}
      selectedSlotId={p.selectedSlotId}
      mealsPerDay={p.mealsPerDay}
      filledSlots={p.filledSlots}
      draggingMealId={p.draggingMealId}
      draggingSlotId={p.draggingSlotId}
      dragOverDayKey={p.dragOverDayKey}
      listScrollRef={p.listScrollRef}
      onMealsPerDayChange={p.setMealsPerDay}
      onSelectSlot={p.selectSlot}
      onRemoveMeal={p.removeMeal}
      onDragOverDay={p.setDragOverDay}
      onDropMeal={p.dropMealOnDay}
      onDragStartSlot={p.startDragFromSlot}
      onDragEndMeal={p.endDragMeal}
      onReorderSlot={p.reorderSlot}
      onResetMealPlan={p.resetMealPlan}
      onFillRandom={p.fillEmptyRandom}
      onReshuffle={p.reshuffleAll}
      onCopyDay={p.copyDayToAll}
      onSetMeal={p.setMealToSlot}
    />
  );

  const plannerBottomColumn = (
    <CheckoutBar
      totalPrice={p.totalPrice}
      filledSlots={p.filledSlots}
      totalSlots={p.totalSlots}
      onSubmit={handleOrderSubmit}
    />
  );

  return (
    <>
      <div style={{ "--subscribe-banner-h": bannerOpen ? `${bannerH}px` : "0px" } as React.CSSProperties}>
        {bannerOpen && (
          <div ref={bannerWrapRef}>
            <SubscribeInfoBanner onClose={closeBanner} />
          </div>
        )}
        <SubscribeShell
          menuColumn={menuColumn}
          plannerTopColumn={plannerTopColumn}
          plannerBottomColumn={plannerBottomColumn}
          mobileBottomBar={(onOpenMenu) => (
            <MobileCheckoutBar
              totalPrice={p.totalPrice}
              filledSlots={p.filledSlots}
              totalSlots={p.totalSlots}
              onSubmit={handleOrderSubmit}
              onOpenMenu={onOpenMenu}
            />
          )}
        />
      </div>
      <AllergyWarningModal
        open={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        onConfirm={proceedToOrder}
      />
      <SubscribeTutorial />
    </>
  );
}
