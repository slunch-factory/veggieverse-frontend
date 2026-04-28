"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  type AllergyFilter,
  type DietType,
  type NutritionGoal,
  type SpicyPreference,
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

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

interface DropdownProps {
  label: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

function Dropdown({ label, badge, isOpen, onToggle, onClose, children }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, onClose);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 h-full px-3 text-[12px] whitespace-nowrap transition-colors border-r border-black last:border-r-0 ${
          isOpen || badge ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {badge ? (
          <span>{label}: <span className="font-medium">{badge}</span></span>
        ) : (
          <span>{label}</span>
        )}
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-px bg-white border border-black shadow-lg min-w-[160px]">
          {children}
        </div>
      )}
    </div>
  );
}

interface OptionItemProps {
  label: string;
  selected: boolean;
  isMulti?: boolean;
  onClick: () => void;
}

function OptionItem({ label, selected, isMulti, onClick }: OptionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-left transition-colors ${
        selected ? "bg-black text-white" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {isMulti && (
        <span
          className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center text-[9px] ${
            selected ? "border-white bg-transparent" : "border-gray-400"
          }`}
        >
          {selected && "✓"}
        </span>
      )}
      {label}
    </button>
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
}: FilterPanelProps) {
  const [open, setOpen] = useState<FilterKey | null>(null);

  const toggle = useCallback((key: FilterKey) => setOpen((prev) => (prev === key ? null : key)), []);
  const close = useCallback(() => setOpen(null), []);

  const dietLabel = dietType
    ? DIET_TYPE_OPTIONS.find((o) => o.value === dietType)?.label
    : undefined;

  const nutritionBadge = (() => {
    if (nutritionGoals.length === 0) return undefined;
    const firstName = NUTRITION_GOAL_OPTIONS.find((o) => o.value === nutritionGoals[0])?.label ?? "";
    return nutritionGoals.length === 1 ? firstName : `${firstName} 외 ${nutritionGoals.length - 1}`;
  })();

  const allergyBadge = (() => {
    if (allergyFilters.includes("none")) return "해당 없음";
    if (allergyFilters.length === 0) return undefined;
    const firstName = ALLERGY_FILTER_OPTIONS.find((o) => o.value === allergyFilters[0])?.label ?? "";
    return allergyFilters.length === 1 ? firstName : `${firstName} 외 ${allergyFilters.length - 1}`;
  })();

  const spicyLabel = spicyPreference
    ? SPICY_PREFERENCE_OPTIONS.find((o) => o.value === spicyPreference)?.label
    : undefined;

  return (
    <div className="flex items-stretch h-10 border-t border-b border-black pl-3">
      {/* 식이 유형 */}
      <Dropdown
        label="식이 유형"
        badge={dietLabel}
        isOpen={open === "diet"}
        onToggle={() => toggle("diet")}
        onClose={close}
      >
        <OptionItem
          label="전체"
          selected={dietType === null}
          onClick={() => { onDietTypeChange(null); close(); }}
        />
        {DIET_TYPE_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.value}
            label={opt.label}
            selected={dietType === opt.value}
            onClick={() => { onDietTypeChange(opt.value); close(); }}
          />
        ))}
      </Dropdown>

      {/* 영양 목표 */}
      <Dropdown
        label="영양 목표"
        badge={nutritionBadge}
        isOpen={open === "nutrition"}
        onToggle={() => toggle("nutrition")}
        onClose={close}
      >
        {NUTRITION_GOAL_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.value}
            label={opt.label}
            selected={nutritionGoals.includes(opt.value)}
            isMulti
            onClick={() => onNutritionGoalToggle(opt.value)}
          />
        ))}
      </Dropdown>

      {/* 알레르기 */}
      <Dropdown
        label="알레르기"
        badge={allergyBadge}
        isOpen={open === "allergy"}
        onToggle={() => toggle("allergy")}
        onClose={close}
      >
        {ALLERGY_FILTER_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.value}
            label={opt.label}
            selected={allergyFilters.includes(opt.value)}
            isMulti={opt.value !== "none"}
            onClick={() => onAllergyFilterToggle(opt.value)}
          />
        ))}
      </Dropdown>

      {/* 매운맛 */}
      <Dropdown
        label="매운맛"
        badge={spicyLabel}
        isOpen={open === "spicy"}
        onToggle={() => toggle("spicy")}
        onClose={close}
      >
        <OptionItem
          label="전체"
          selected={spicyPreference === null}
          onClick={() => { onSpicyPreferenceChange(null); close(); }}
        />
        {SPICY_PREFERENCE_OPTIONS.map((opt) => (
          <OptionItem
            key={opt.value}
            label={opt.label}
            selected={spicyPreference === opt.value}
            onClick={() => { onSpicyPreferenceChange(opt.value); close(); }}
          />
        ))}
      </Dropdown>

    </div>
  );
}
