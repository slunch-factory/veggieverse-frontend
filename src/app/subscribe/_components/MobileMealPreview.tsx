"use client";

import type { DisplayMenuData } from "../_data/subscription";

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
        className="fixed z-[201] bg-white border border-black shadow-[0_8px_24px_rgba(0,0,0,0.2)] overflow-hidden animate-fadeIn cursor-pointer"
        style={{
          right: RIGHT_OFFSET,
          top,
          width: IMG_SIZE,
          height: IMG_SIZE,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview.meal.image}
          alt={preview.meal.displayName}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      </div>
    </div>
  );
}
