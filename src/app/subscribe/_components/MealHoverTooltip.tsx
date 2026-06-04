"use client";

import { createPortal } from "react-dom";
import type { DisplayMenuData } from "../_data/subscription";
import { MealImage } from "./MealImage";

export interface HoveredMealState {
  meal: DisplayMenuData;
  x: number;
  y: number;
  placement: "left" | "right";
}

interface MealHoverTooltipProps {
  hovered: HoveredMealState | null;
}

export function MealHoverTooltip({ hovered }: MealHoverTooltipProps) {
  if (!hovered || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="hidden lg:block fixed z-[1000] pointer-events-none"
      style={{
        left: hovered.x,
        top: hovered.y,
        transform:
          hovered.placement === "right"
            ? "translateY(-50%)"
            : "translate(-100%, -50%)",
      }}
    >
      <MealImage
        src={hovered.meal.image}
        alt={hovered.meal.displayName}
        className="w-[160px] h-[160px] object-cover border border-black bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
      />
    </div>,
    document.body,
  );
}
