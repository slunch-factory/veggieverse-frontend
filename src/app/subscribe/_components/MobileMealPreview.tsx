"use client";

import { X } from "lucide-react";
import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { getAllergyLabel } from "../_data/subscription";

interface MobileMealPreviewProps {
  meal: DisplayMenuData | null;
  onClose: () => void;
}

export function MobileMealPreview({ meal, onClose }: MobileMealPreviewProps) {
  if (!meal) return null;

  const allergy = getAllergyLabel(meal.excludable as ExcludeCategory[]);

  return (
    <div className="lg:hidden">
      <div
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={meal.displayName}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[85vw] max-w-[360px] bg-white shadow-xl overflow-hidden animate-fadeIn"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 text-stone-700" />
        </button>
        <div className="relative aspect-square bg-[#F5F5F5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={meal.image}
            alt={meal.displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          {allergy && (
            <div className="absolute right-0 bottom-0 bg-white/90 px-2 py-0.5 text-[10px] text-gray-900 backdrop-blur-sm rounded-tl">
              Allergy: {allergy}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-[16px] leading-tight mb-1">{meal.displayName}</h3>
          {meal.isVariation && meal.badge && (
            <p className="text-[11px] text-[#8C451D] mb-1">{meal.badge}</p>
          )}
          {meal.description && (
            <p className="text-[13px] text-gray-500 leading-relaxed">{meal.description}</p>
          )}
          <div className="mt-3 flex items-baseline justify-end">
            <span className="text-[16px]">{meal.price.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
