"use client";

import { useRef, useState } from "react";
import type {
  AllergyFilter,
  DietType,
  NutritionGoal,
  SpicyPreference,
} from "../_data/subscription";
import {
  ALLERGY_FILTER_OPTIONS,
  DIET_TYPE_OPTIONS,
  NUTRITION_GOAL_OPTIONS,
  SPICY_PREFERENCE_OPTIONS,
} from "../_data/subscription";

interface FilterPanelProps {
  dietType: DietType | null;
  nutritionGoals: NutritionGoal[];
  allergyFilters: AllergyFilter[];
  spicyPreference: SpicyPreference | null;
  onDietTypeChange: (v: DietType | null) => void;
  onNutritionGoalToggle: (v: NutritionGoal) => void;
  onAllergyFilterToggle: (v: AllergyFilter) => void;
  onSpicyPreferenceChange: (v: SpicyPreference | null) => void;
}

type FilterKey = "diet" | "nutrition" | "allergy" | "spicy";

function Chip({
  label,
  active,
  isExclude,
  onClick,
}: {
  label: string;
  active: boolean;
  isExclude?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-[5px] border text-[12px] shrink-0 whitespace-nowrap transition-colors ${
        active && isExclude
          ? "bg-[#f7f4ef] text-[#a0a0a0] border-[#e5e2dc] line-through decoration-[1px]"
          : active
          ? "bg-black text-white border-black"
          : "bg-transparent text-[#3d3d3d] border-[rgba(26,10,5,0.2)] hover:border-black"
      }`}
    >
      {label}
    </button>
  );
}

function DropdownFilter({
  label,
  activeCount,
  open,
  onToggle,
  onClose,
  children,
}: {
  label: string;
  activeCount: number;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number } | null>(null);

  const handleToggle = () => {
    if (!open) {
      const r = btnRef.current?.getBoundingClientRect();
      if (r) setDropPos({ top: r.bottom + 3, left: r.left });
    }
    onToggle();
  };

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-[5px] px-[10px] py-[6px] text-[13px] border whitespace-nowrap transition-colors ${
          activeCount > 0
            ? "border-black bg-black text-white"
            : "border-[rgba(26,10,5,0.22)] text-[#3d3d3d] bg-white hover:border-black"
        }`}
      >
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="text-[11px] opacity-80">({activeCount})</span>
        )}
        <span
          className={`text-[9px] leading-none transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && dropPos && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={onClose} />
          <div
            className="fixed z-[191] bg-white border border-black shadow-lg p-3 inline-flex flex-nowrap gap-2 w-max max-w-[90vw]"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export function FilterPanel({
  dietType,
  nutritionGoals,
  allergyFilters,
  spicyPreference,
  onDietTypeChange,
  onNutritionGoalToggle,
  onAllergyFilterToggle,
  onSpicyPreferenceChange,
  onResetFilters,
}: FilterPanelProps & { onResetFilters: () => void }) {
  const [open, setOpen] = useState<FilterKey | null>(null);
  const toggle = (key: FilterKey) => setOpen((prev) => (prev === key ? null : key));

  return (
    <div className="flex items-center gap-3 px-5 h-[56px] border-b border-black bg-white overflow-x-auto no-scrollbar shrink-0">
      <DropdownFilter
        label="식이 유형"
        activeCount={dietType ? 1 : 0}
        open={open === "diet"}
        onToggle={() => toggle("diet")}
        onClose={() => setOpen(null)}
      >
        {DIET_TYPE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={dietType === opt.value}
            onClick={() => onDietTypeChange(dietType === opt.value ? null : opt.value)}
          />
        ))}
      </DropdownFilter>

      <DropdownFilter
        label="영양 목표"
        activeCount={nutritionGoals.length}
        open={open === "nutrition"}
        onToggle={() => toggle("nutrition")}
        onClose={() => setOpen(null)}
      >
        {NUTRITION_GOAL_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={nutritionGoals.includes(opt.value)}
            onClick={() => onNutritionGoalToggle(opt.value)}
          />
        ))}
      </DropdownFilter>

      <DropdownFilter
        label="알러지 제외"
        activeCount={allergyFilters.length}
        open={open === "allergy"}
        onToggle={() => toggle("allergy")}
        onClose={() => setOpen(null)}
      >
        {ALLERGY_FILTER_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={allergyFilters.includes(opt.value)}
            isExclude
            onClick={() => onAllergyFilterToggle(opt.value)}
          />
        ))}
      </DropdownFilter>

      <DropdownFilter
        label="매운맛"
        activeCount={spicyPreference ? 1 : 0}
        open={open === "spicy"}
        onToggle={() => toggle("spicy")}
        onClose={() => setOpen(null)}
      >
        {SPICY_PREFERENCE_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            active={spicyPreference === opt.value}
            isExclude={opt.value === "exclude"}
            onClick={() =>
              onSpicyPreferenceChange(spicyPreference === opt.value ? null : opt.value)
            }
          />
        ))}
      </DropdownFilter>

      {(dietType || nutritionGoals.length > 0 || allergyFilters.length > 0 || spicyPreference) && (
        <button
          type="button"
          onClick={onResetFilters}
          className="shrink-0 px-[8px] py-[4px] text-[11px] border border-[rgba(26,10,5,0.22)] text-[#9a928c] bg-white hover:border-black hover:text-black transition-colors whitespace-nowrap"
        >
          초기화
        </button>
      )}
    </div>
  );
}
