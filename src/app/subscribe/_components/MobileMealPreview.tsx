"use client";

import type { DisplayMenuData } from "../_data/subscription";
import { MealImage } from "./MealImage";

export interface MobilePreviewState {
  meal: DisplayMenuData;
  /** 클릭된 요소의 수직 중앙 (viewport 기준) */
  y: number;
}

interface MobileMealPreviewProps {
  preview: MobilePreviewState | null;
  onClose: () => void;
}

const IMG_SIZE = 160;
const RIGHT_OFFSET = 20;
const EDGE_PADDING = 16;

export function MobileMealPreview({ preview, onClose }: MobileMealPreviewProps) {
  if (!preview || typeof window === "undefined") return null;

  const viewportH = window.innerHeight;
  const top = Math.max(
    EDGE_PADDING,
    Math.min(preview.y - IMG_SIZE / 2, viewportH - IMG_SIZE - EDGE_PADDING),
  );

  return (
    <div className="lg:hidden">
      {/* 투명 backdrop — 탭으로 닫기 */}
      <div
        className="fixed inset-0 z-[200]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 이미지 */}
      <div
        role="dialog"
        aria-label={preview.meal.displayName}
        onClick={onClose}
        className="fixed z-[201] bg-white border border-black overflow-hidden animate-fadeIn cursor-pointer"
        style={{
          right: RIGHT_OFFSET,
          top,
          width: IMG_SIZE,
          height: IMG_SIZE,
        }}
      >
        <MealImage
          src={preview.meal.image}
          alt={preview.meal.displayName}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
