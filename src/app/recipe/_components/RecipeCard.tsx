"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import type { Recipe } from "../_data/recipes";

/* ─── 기본 레시피 카드 (그리드용) ─── */
export function RecipeCard({ recipe, rank }: { recipe: Recipe; rank?: number }) {
  return (
    <Link href={`/recipe/${recipe.id}`} className="block bg-[var(--cream)]">
      <div className="relative w-full aspect-square bg-[#f5f5f5] overflow-hidden rounded-[4px]">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(min-width:640px) 25vw, 50vw"
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        {rank !== undefined && (
          <span className="absolute top-2 left-2 bg-black text-white px-2 py-1 text-[11px] rounded-[2px]">
            #{rank + 1}
          </span>
        )}
      </div>
      <div className="pt-3">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-[15px] leading-[1.3] text-black line-clamp-2 flex-1">{recipe.title}</h3>
          <span className="flex items-center gap-1 text-[11px] text-[#6B6B6B] shrink-0">
            <Heart className="w-3 h-3 text-[#E53935] fill-[#E53935]" />
            {recipe.likes.toLocaleString()}
          </span>
        </div>
        <p className="text-[13px] text-[#6B6B6B] leading-[1.4] line-clamp-2 mb-2">{recipe.description}</p>
        <span className="text-[12px] text-[#6B6B6B]">@{recipe.author}</span>
      </div>
    </Link>
  );
}

/* ─── 에디토리얼 카드 (가로 스크롤용, 200x330) ─── */
export function EditorialRecipeCard({ recipe }: { recipe: Recipe }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="flex flex-col w-[200px] h-[330px] bg-white rounded-2xl overflow-hidden shrink-0 transition-transform"
      style={{ transform: hovered ? "scale(1.03)" : "scale(1)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-[200px] h-[200px] overflow-hidden bg-[#f0f0f0] shrink-0 rounded-t-2xl">
        <Image src={recipe.image} alt={recipe.title} width={200} height={200} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
      </div>
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1 min-h-0">
        <h3 className={`text-[18px] font-bold text-black leading-[1.3] mb-1 line-clamp-2 ${hovered ? "underline underline-offset-2" : ""}`}>
          {recipe.title}
        </h3>
        <span className="text-[12px] text-[#888]">@{recipe.author}</span>
        <div className="mt-auto flex justify-end">
          <span className="inline-flex items-center justify-center w-[42px] h-[20px] rounded-full text-[11px] font-medium border border-black">
            {recipe.likes.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── 전체보기 카드 ─── */
export function ViewAllCard({ categoryId }: { categoryId: string }) {
  return (
    <Link
      href={`/recipe/category/${categoryId}`}
      className="flex flex-col items-center justify-center w-[200px] h-[330px] bg-[#F5F5F5] rounded-2xl shrink-0 hover:bg-gray-200 transition-colors"
    >
      <span className="text-[12px] text-[#666] tracking-[0.1em] uppercase">View More</span>
    </Link>
  );
}
