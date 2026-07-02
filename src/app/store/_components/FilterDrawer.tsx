"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export interface FilterState {
  diet: string;
  restrictions: string[];
  foodTypes: string[];
}

export const DIET_OPTIONS = ["전체", "비건", "락토", "오보", "페스코"];
export const RESTRICTION_OPTIONS = ["글루텐프리", "넛프리", "소이프리"];
export const FOOD_TYPE_OPTIONS = ["한식", "양식", "일식", "중식", "디저트"];

export function FilterDrawer({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (f: FilterState) => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const renderRadio = (options: string[], selected: string, onSelect: (v: string) => void) => (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2.5 cursor-pointer text-[14px]"
          style={{ color: selected === opt ? "#000" : "#666" }}
          onClick={() => onSelect(opt)}
        >
          <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
            {selected === opt && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
          </span>
          {opt}
        </label>
      ))}
    </div>
  );

  const renderCheckbox = (options: string[], selected: string[], onToggle: (v: string) => void) => (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label
            key={opt}
            className="flex items-center gap-2.5 cursor-pointer text-[14px]"
            style={{ color: checked ? "#000" : "#666" }}
            onClick={() => onToggle(opt)}
          >
            <span className="w-[18px] h-[18px] rounded-full border border-black flex items-center justify-center shrink-0">
              {checked && <span className="w-[10px] h-[10px] rounded-full bg-black" />}
            </span>
            {opt}
          </label>
        );
      })}
    </div>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      position="drawer-right"
      labelledBy="filter-drawer-title"
      overlayClassName="!bg-transparent"
      zIndex={100}
      className="flex w-[320px] max-w-full flex-col bg-white border-l border-black"
      style={{ marginTop: "var(--header-area-h, var(--header-h))" }}
    >
      <div className="flex items-center justify-between border-b border-black px-5 py-4">
        <span id="filter-drawer-title" className="text-[16px]">Filter</span>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
          <X size={20} strokeWidth={1} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-black py-5 px-5">
          {renderRadio(DIET_OPTIONS, local.diet, (v) => setLocal((p) => ({ ...p, diet: v })))}
        </div>
        <div className="border-b border-black py-5 px-5">
          {renderCheckbox(RESTRICTION_OPTIONS, local.restrictions, (v) =>
            setLocal((p) => ({ ...p, restrictions: toggleArray(p.restrictions, v) }))
          )}
        </div>
        <div className="py-5 px-5">
          {renderCheckbox(FOOD_TYPE_OPTIONS, local.foodTypes, (v) =>
            setLocal((p) => ({ ...p, foodTypes: toggleArray(p.foodTypes, v) }))
          )}
        </div>
      </div>

      <div className="flex gap-3 border-t border-black px-5 py-4">
        <button
          className="flex-1 border border-black py-3 text-[14px] cursor-pointer"
          onClick={() => setLocal({ diet: "전체", restrictions: [], foodTypes: [] })}
        >
          초기화
        </button>
        <button
          className="flex-1 bg-black text-white py-3 text-[14px] cursor-pointer border-none"
          onClick={() => { onApply(local); onClose(); }}
        >
          적용하기
        </button>
      </div>
    </Modal>
  );
}
