"use client";

import type { MenuCategory, PlanType } from "../_data/subscription";

interface PlanTabsProps {
  plans: PlanType[];
  selectedPlanType: MenuCategory | null;
  onSelect: (id: MenuCategory) => void;
  variant?: "menu" | "mobile";
}

export function PlanTabs({ plans, selectedPlanType, onSelect, variant = "menu" }: PlanTabsProps) {
  const isMobile = variant === "mobile";
  return (
    <div
      className={`grid bg-white ${isMobile ? "border-b border-black" : "border-t border-black"}`}
      style={{ gridTemplateColumns: `repeat(${plans.length}, minmax(0, 1fr))` }}
    >
      {plans.map((plan, idx) => {
        const active = selectedPlanType === plan.id;
        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan.id)}
            aria-pressed={active}
            className={`py-3 text-[13px] leading-normal text-center bg-transparent cursor-pointer transition-colors underline-offset-4 ${
              idx < plans.length - 1 ? "border-r border-black" : ""
            } ${
              active
                ? "text-[#8C451D] underline"
                : isMobile
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {plan.name}
          </button>
        );
      })}
    </div>
  );
}
