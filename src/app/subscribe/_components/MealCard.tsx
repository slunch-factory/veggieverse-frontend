"use client";

import { ShoppingCart } from "lucide-react";
import type { DisplayMenuData, ExcludeCategory } from "../_data/subscription";
import { EXCLUDE_CATEGORIES } from "../_data/subscription";
import { MealImage } from "./MealImage";
import { setSlotDragImage } from "./dragGhost";
import { WishlistButton } from "@/components/ui/WishlistButton";

interface MealCardProps {
  meal: DisplayMenuData;
  draggingMealId: string | null;
  onAdd: (meal: DisplayMenuData) => void;
  onDetail: (meal: DisplayMenuData) => void;
  onDragStart: (mealId: string) => void;
  onDragEnd: () => void;
}

export function MealCard({ meal, draggingMealId, onAdd, onDetail, onDragStart, onDragEnd }: MealCardProps) {
  const isDragging = draggingMealId === meal.id;
  const allergyLabel = meal.excludable.length > 0
    ? meal.excludable.map((c) => EXCLUDE_CATEGORIES[c as ExcludeCategory]?.label ?? c).join(", ")
    : "";

  return (
    <div
      // 카드 클릭 = 상세 보기. 담기는 우상단 전용 버튼(또는 상세 모달 안)에서.
      onClick={() => onDetail(meal)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", meal.id);
        setSlotDragImage(e, meal);
        onDragStart(meal.id);
      }}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDetail(meal);
        }
      }}
      aria-label={`${meal.displayName} 상세 보기`}
      className={`group relative cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 ${isDragging ? "opacity-40" : ""}`}
    >
      {/* 썸네일 */}
      <div className="relative w-full aspect-[4/3] lg:aspect-square overflow-hidden bg-[#fcfaf8] rounded-[4px]">
        <MealImage
          src={meal.image}
          alt={meal.displayName}
          className="h-full w-full object-cover"
          draggable={false}
        />

        {/* 장바구니 담기 — 카드 클릭(상세)과 분리된 전용 버튼 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(meal);
          }}
          aria-label={`${meal.displayName} 담기`}
          title="식단에 담기"
          className="absolute right-1.5 top-1.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black bg-[#dfff4f] text-black shadow-sm transition-colors hover:bg-black hover:text-[#dfff4f]"
        >
          <ShoppingCart size={15} strokeWidth={2} />
        </button>

        {/* 찜(위시리스트) — 우하단 (담기 버튼·알레르기 라벨과 분리) */}
        <div className="absolute right-1.5 bottom-1.5">
          <WishlistButton
            size={14}
            item={{
              key: `subscribe:${meal.id}`,
              kind: "subscribe",
              name: meal.displayName,
              imageUrl: meal.image,
              href: "/subscribe",
              price: meal.price,
            }}
          />
        </div>

        {allergyLabel && (
          <div className="absolute left-0 bottom-0 bg-[#1a0a05] text-white px-[5px] py-[3px] text-[10px] tracking-[0.02em] leading-snug rounded-tr-[4px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
            Allergy: {allergyLabel}
          </div>
        )}
      </div>

      {/* 정보 */}
      <h3 className="mt-3 text-[14px] font-normal leading-snug text-[#1a0a05] truncate">
        {meal.displayName}
      </h3>
      <p className="mt-1 text-[12px] text-[#9a928c] leading-snug truncate">
        {meal.description || "슬런치 채식 식단"}
      </p>
      <p className="mt-2 text-[15px] font-normal text-[#1a0a05]">
        {meal.price.toLocaleString()}원
      </p>
    </div>
  );
}
