"use client";

import { useState, useMemo } from "react";
import {
  type DurationType,
  type ExcludeCategory,
  type DisplayMenuData,
  type MenuCategory,
  EXCLUDE_CATEGORIES,
  PLAN_TYPES,
  MENUS,
  CATEGORY_MAP,
  getDisplayMenu,
  getNextMonday,
  generateWeekDays,
  formatPrice,
} from "../_data/subscription";

export function SubscribeClient() {
  const [duration, setDuration] = useState<DurationType>(1);
  const [selectedExcludes, setSelectedExcludes] = useState<ExcludeCategory[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<Record<string, DisplayMenuData>>({});
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [durationSelected, setDurationSelected] = useState(false);
  const [hoveredPlanType, setHoveredPlanType] = useState<string | null>(null);

  const startDate = useMemo(() => getNextMonday(), []);
  const week1Days = useMemo(() => generateWeekDays(startDate), [startDate]);
  const week2Days = useMemo(() => {
    const w2 = new Date(startDate);
    w2.setDate(startDate.getDate() + 7);
    return generateWeekDays(w2);
  }, [startDate]);

  const filteredMeals = useMemo(() => {
    let menus: DisplayMenuData[] = Object.keys(MENUS).map((id) => {
      const m = MENUS[id];
      return { ...m, displayName: m.name, isVariation: false };
    });
    if (selectedExcludes.length > 0) {
      menus = menus.filter((m) => !m.excludable.some((e) => selectedExcludes.includes(e)));
    }
    if (selectedPlanType) {
      const cat = CATEGORY_MAP[selectedPlanType];
      if (cat) menus = menus.filter((m) => m.category === cat);
    }
    return menus;
  }, [selectedExcludes, selectedPlanType]);

  const totalPrice = useMemo(() => Object.values(mealPlan).reduce((s, m) => s + m.price, 0), [mealPlan]);
  const filledSlots = Object.keys(mealPlan).length;
  const totalSlots = duration === 1 ? 14 : 28;
  const variationCount = useMemo(() => Object.values(mealPlan).filter((m) => m.isVariation).length, [mealPlan]);

  const toggleExclude = (cat: ExcludeCategory) => {
    setSelectedExcludes((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]));
  };

  const handleSlotClick = (slotId: string) => setSelectedSlotId((p) => (p === slotId ? null : slotId));

  const handleAddMeal = (meal: DisplayMenuData) => {
    const allDays = duration === 1 ? week1Days : [...week1Days, ...week2Days];
    const allSlots = allDays.flatMap((d) => d.slots);

    if (duration === 2) {
      const newPlan = { ...mealPlan };
      allSlots.forEach((s) => { if (!newPlan[s.slotId]) newPlan[s.slotId] = meal; });
      setMealPlan(newPlan);
      setSelectedSlotId(null);
      return;
    }

    if (selectedSlotId) {
      setMealPlan((p) => ({ ...p, [selectedSlotId]: meal }));
      const idx = allSlots.findIndex((s) => s.slotId === selectedSlotId);
      const next = allSlots.slice(idx + 1).find((s) => !mealPlan[s.slotId]);
      setSelectedSlotId(next?.slotId || null);
    } else {
      const first = allSlots.find((s) => !mealPlan[s.slotId]);
      if (first) setMealPlan((p) => ({ ...p, [first.slotId]: meal }));
    }
  };

  const handleRemoveMeal = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMealPlan((p) => { const n = { ...p }; delete n[slotId]; return n; });
  };

  const handlePlanTypeSelect = (planId: string) => {
    setSelectedPlanType(planId);
    setHoveredPlanType(null);
    const cat = CATEGORY_MAP[planId] as MenuCategory | undefined;
    if (!cat) return;

    const menuIds = Object.keys(MENUS).filter((id) => MENUS[id].category === cat);
    const meals = menuIds.map((id) => getDisplayMenu(id, selectedExcludes));
    if (meals.length === 0) return;

    const allDays = duration === 1 ? week1Days : [...week1Days, ...week2Days];
    const newPlan: Record<string, DisplayMenuData> = {};
    let i = 0;
    allDays.forEach((day) => day.slots.forEach((slot) => { newPlan[slot.slotId] = meals[i++ % meals.length]; }));
    setMealPlan(newPlan);
    setSelectedSlotId(null);
  };

  /* ─── 캘린더 셀 ─── */
  const renderCalendarCell = (day: ReturnType<typeof generateWeekDays>[0]) => (
    <div key={day.dateKey} className="border-r border-b border-gray-200 last:border-r-0 flex flex-col">
      <div className={`text-center py-1 border-b border-gray-100 ${day.dateLabel.isHoliday ? "bg-red-50" : "bg-gray-50"}`}>
        <span className={`text-[12px] font-semibold ${day.dateLabel.isHoliday ? "text-red-500" : "text-gray-700"}`}>{day.dateLabel.dayNum}</span>
      </div>
      <div className="flex-1 flex flex-col">
        {day.slots.map((slot, si) => {
          const meal = mealPlan[slot.slotId];
          const isSelected = selectedSlotId === slot.slotId;
          return (
            <div
              key={slot.slotId}
              onClick={() => handleSlotClick(slot.slotId)}
              className={`flex-1 p-1 cursor-pointer min-h-[60px] ${si === 0 ? "border-b border-gray-100" : ""} ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
            >
              {meal ? (
                <div className="flex flex-col items-center gap-0.5 group/meal h-full">
                  <div className="relative w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={meal.image} alt={meal.displayName} className="w-full h-10 object-cover rounded" />
                    <button onClick={(e) => handleRemoveMeal(slot.slotId, e)} className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full flex items-center justify-center text-[8px] hover:bg-gray-700 opacity-0 group-hover/meal:opacity-100 transition-all">✕</button>
                  </div>
                  <p className="text-[9px] font-medium text-center leading-tight line-clamp-2">{meal.displayName}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-[9px] text-gray-300">{slot.mealTime}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full flex overflow-hidden border-t border-black" style={{ height: "calc(100vh - var(--header-h, 64px))" }}>
      {/* ═══ LEFT: 캘린더 + 결제 ═══ */}
      <section className="w-1/2 h-full flex flex-col border-r border-black relative">
        {/* 기간 탭 */}
        <div className="shrink-0 flex border-b border-black bg-white">
          {([1, 2] as DurationType[]).map((d) => (
            <button
              key={d}
              onClick={() => { setDuration(d); setDurationSelected(true); }}
              className={`flex-1 py-3 text-[12px] font-semibold tracking-tight transition-all ${d === 1 ? "border-r border-black" : ""} ${durationSelected && duration === d ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
            >
              {d}주
            </button>
          ))}
        </div>

        {/* 식단 유형 탭 */}
        <div className="shrink-0 flex border-b border-black bg-white">
          {PLAN_TYPES.map((plan, i) => (
            <button
              key={plan.id}
              onClick={() => durationSelected && handlePlanTypeSelect(plan.id)}
              onMouseEnter={() => durationSelected && setHoveredPlanType(plan.id)}
              onMouseLeave={() => setHoveredPlanType(null)}
              disabled={!durationSelected}
              className={`flex-1 py-3 text-[12px] font-semibold tracking-tight transition-all ${i < PLAN_TYPES.length - 1 ? "border-r border-black" : ""} ${!durationSelected ? "bg-gray-100 text-gray-300 cursor-not-allowed" : selectedPlanType === plan.id ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"}`}
            >
              {plan.name}
            </button>
          ))}
        </div>

        {/* 캘린더 */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="min-h-full flex flex-col">
            {filledSlots === 0 ? (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="text-[16px] text-gray-500 leading-relaxed">
                    {!durationSelected ? "구독할 기간을 선택하신 후" : "내가 원하는 타입을 골라주세요!"}
                  </p>
                  {!durationSelected && <p className="text-[16px] text-gray-500">내가 원하는 타입을 골라주세요!</p>}
                  <div className="mt-4 text-[13px] text-gray-400">
                    {!durationSelected ? "👆 위에서 1주 또는 2주를 선택해주세요" : "👆 위에서 식단 타입을 선택해주세요"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-100">
                  {["월", "화", "수", "목", "금", "토", "일"].map((d, i) => (
                    <div key={d} className={`py-2 text-center text-[11px] font-semibold ${i === 6 ? "text-red-500" : i === 5 ? "text-blue-500" : "text-gray-600"} ${i < 6 ? "border-r border-gray-200" : ""}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1">{week1Days.map(renderCalendarCell)}</div>
                {duration === 2 && <div className="grid grid-cols-7 flex-1 border-t border-gray-300">{week2Days.map(renderCalendarCell)}</div>}
              </div>
            )}
          </div>
        </div>

        {/* 호버 팝업 배너 */}
        {hoveredPlanType && (() => {
          const plan = PLAN_TYPES.find((p) => p.id === hoveredPlanType);
          if (!plan) return null;
          return (
            <div
              className="absolute top-0 right-0 translate-x-full h-full border-l border-black z-50"
              style={{ aspectRatio: "3/5" }}
              onMouseEnter={() => setHoveredPlanType(hoveredPlanType)}
              onMouseLeave={() => setHoveredPlanType(null)}
            >
              <div className="w-full h-full bg-cover bg-center relative" style={{ backgroundImage: `url(${plan.image})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-6 right-6">
                  <p className="text-[11px] text-white/70 tracking-[0.25em] mb-2">{plan.subtitle}</p>
                  <h3 className="text-[32px] font-bold text-white leading-tight mb-3">{plan.name}</h3>
                  <p className="text-[13px] text-white/90 leading-relaxed">{plan.description}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 결제 바 */}
        <div className="shrink-0 h-[90px] border-t border-black bg-white flex items-center justify-between px-8">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">예상 결제 금액</p>
            <div className="flex items-baseline gap-2">
              <p className="text-[28px] font-bold tracking-tight">{formatPrice(totalPrice)}</p>
              {totalPrice > 0 && (
                <>
                  <span className="text-[14px] text-gray-400 line-through">{formatPrice(Math.round(totalPrice / 0.9))}</span>
                  <span className="text-[12px] text-red-500 font-medium">10% 할인</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[13px] text-gray-400 font-medium">
              {filledSlots} / {totalSlots}
              {variationCount > 0 && <span className="ml-2 text-blue-500">🔄 변형 {variationCount}개</span>}
            </span>
            <button className="h-[50px] px-6 bg-[#03C75A] text-white font-bold text-[14px] flex items-center gap-1.5 hover:bg-[#02b351] transition-colors">
              <span className="font-black">N</span>Pay
            </button>
            <button
              disabled={filledSlots === 0}
              className={`h-[50px] px-10 font-bold text-[15px] transition-all ${filledSlots === 0 ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-black text-white hover:bg-gray-900"}`}
            >
              {filledSlots === totalSlots ? "결제하기" : "구독 시작"}
            </button>
          </div>
        </div>
      </section>

      {/* ═══ RIGHT: 메뉴 라이브러리 ═══ */}
      <aside className="w-1/2 h-full flex flex-col bg-[#FAFAFA]">
        {/* 필터 */}
        <div className="shrink-0 p-6 border-b border-black bg-white">
          <h2 className="text-[18px] font-bold mb-5">메뉴 라이브러리</h2>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.15em] mb-2.5">제외 재료 (메뉴 자동 변환)</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(EXCLUDE_CATEGORIES) as ExcludeCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleExclude(cat)}
                  className={`px-3 py-1.5 text-[11px] rounded-full transition-all ${selectedExcludes.includes(cat) ? "bg-blue-50 text-blue-500 border border-blue-200" : "bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-400"}`}
                >
                  {selectedExcludes.includes(cat) && "✕ "}{EXCLUDE_CATEGORIES[cat].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 메뉴 그리드 */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5">
          {filteredMeals.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-[14px]">조건에 맞는 메뉴가 없습니다</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredMeals.map((meal) => (
                <div key={meal.id} onClick={() => handleAddMeal(meal)} className="cursor-pointer group">
                  <div className="relative aspect-square bg-[#F5F5F5] rounded-[4px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={meal.image} alt={meal.displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {meal.isVariation && <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded">🔄 변형</div>}
                  </div>
                  <div className="pt-4">
                    <h3 className="text-[15px] font-semibold leading-[1.3] text-black mb-1 group-hover:underline">{meal.displayName}</h3>
                    {meal.isVariation && <p className="text-[11px] text-blue-500 mb-1">{meal.badge}</p>}
                    <p className="text-[13px] text-[#6B6B6B] leading-[1.5] mb-3 overflow-hidden text-ellipsis whitespace-nowrap">{meal.description}</p>
                    <span className="text-[16px] font-medium text-black">{meal.price.toLocaleString()}원</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
