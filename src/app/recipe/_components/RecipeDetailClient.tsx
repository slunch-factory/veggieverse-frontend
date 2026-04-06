"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Clock, ChefHat, Users, ChevronUp, ChevronDown, ChevronRight, Camera } from "lucide-react";
import { getIngredientIcon } from "@/utils/ingredientIcon";
import type { DetailedRecipe } from "../_data/recipeDetails";

function parseAmount(amount: string, multiplier: number) {
  const match = amount.match(/^([\d.]+)/);
  if (match) {
    const num = parseFloat(match[1]);
    const unit = amount.replace(match[1], "");
    return `${Math.round(num * multiplier * 10) / 10}${unit}`;
  }
  return amount;
}

export function RecipeDetailClient({ recipe }: { recipe: DetailedRecipe }) {
  const [servings, setServings] = useState(recipe.servings);
  const [isLiked, setIsLiked] = useState(false);

  const multiplier = servings / recipe.servings;

  return (
    <div className="min-h-screen bg-white">
      {/* 커버 이미지 — 컴팩트 사이즈 */}
      <div className="relative h-[40vh] min-h-[320px] max-h-[480px] bg-[#F5F5F5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={recipe.heroImage || recipe.image}
          alt={`${recipe.title} - 커버 이미지`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 pb-10 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <p className="text-white/90 text-sm mb-2">
                  {recipe.dietCategory} / {recipe.recipeCategory}
                </p>
                <h1 className="text-[28px] md:text-[36px] text-white leading-tight drop-shadow-lg mb-3">
                  {recipe.title}
                </h1>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white text-sm font-semibold">{recipe.author}</span>
                  <span>🌻</span>
                </div>
                {recipe.tags.length > 0 && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="text-white/80 text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="inline-flex items-center justify-center w-14 h-7 rounded-full text-[13px] font-medium transition-all cursor-pointer"
                  style={{
                    border: isLiked ? "none" : "1px solid rgba(255,255,255,0.8)",
                    background: isLiked ? "#fff" : "transparent",
                    color: isLiked ? "#000" : "#fff",
                  }}
                >
                  {(recipe.likes + (isLiked ? 1 : 0)).toLocaleString()}
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="text-white hover:text-stone-200 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메타 정보 띠 */}
      <div className="w-full bg-stone-50 border-y border-stone-200">
        <div className="flex items-center justify-center gap-6 py-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-500" />
            <div>
              <p className="text-xs text-stone-500">총 시간</p>
              <p className="text-sm text-stone-900">{recipe.totalTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-stone-500" />
            <div>
              <p className="text-xs text-stone-500">난이도</p>
              <p className="text-sm text-stone-900">{recipe.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-stone-500" />
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs text-stone-500">인원</p>
                <p className="text-sm text-stone-900">{servings}인분</p>
              </div>
              <div className="flex flex-col gap-1 ml-1">
                <button onClick={() => setServings(Math.min(10, servings + 1))} className="hover:opacity-70"><ChevronUp className="w-4 h-4 text-stone-700" /></button>
                <button onClick={() => setServings(Math.max(1, servings - 1))} className="hover:opacity-70"><ChevronDown className="w-4 h-4 text-stone-700" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-[60px]">
        <div className="max-w-[800px] mx-auto">

          {/* 알레르기 */}
          {recipe.allergens && recipe.allergens.length > 0 && (
            <div className="pb-4 border-b border-stone-200 mb-8">
              <p className="text-xs text-stone-500 text-center">
                <span className="font-medium">알레르기 유발 성분:</span> {recipe.allergens.join(", ")}
              </p>
            </div>
          )}

          {/* 재료 + 영양 정보 */}
          {recipe.ingredients.length > 0 && (
          <section className="mb-[60px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[13px]">
              {/* 재료 */}
              <div className="bg-stone-50 border border-stone-200 p-6">
                <h2 className="text-[22px] font-semibold text-stone-900 mb-4">재료</h2>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-stone-200">
                      <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center overflow-hidden shrink-0 border border-stone-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={getIngredientIcon(ing.name)} alt={ing.name} className="w-6 h-6 object-contain" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-baseline gap-2">
                        <span className="text-sm text-stone-900 truncate">{ing.name}</span>
                        <span className="text-sm font-medium text-stone-900 whitespace-nowrap">{parseAmount(ing.amount, multiplier)}</span>
                        {ing.note && <span className="text-xs text-stone-500 whitespace-nowrap">({ing.note})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 영양 정보 */}
              <div className="bg-stone-50 border border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[22px] font-semibold text-stone-900">영양 정보</h2>
                  <span className="text-xs text-stone-500">1인분 기준</span>
                </div>
                <div className="space-y-0">
                  {[
                    { label: "칼로리", value: `${recipe.nutrition.calories} kcal` },
                    { label: "지방", value: `${recipe.nutrition.fat}g` },
                    { label: "포화지방", value: `${recipe.nutrition.saturatedFat}g`, sub: true },
                    { label: "탄수화물", value: `${recipe.nutrition.carbs}g` },
                    { label: "당류", value: `${recipe.nutrition.sugar}g`, sub: true },
                    { label: "식이섬유", value: `${recipe.nutrition.fiber}g`, sub: true },
                    { label: "단백질", value: `${recipe.nutrition.protein}g` },
                  ].map((row, i, arr) => (
                    <div key={row.label} className={`flex justify-between py-2 ${i < arr.length - 1 ? "border-b border-stone-200" : ""} ${row.sub ? "pl-4" : ""}`}>
                      <span className={row.sub ? "text-xs text-stone-500" : "text-sm text-stone-900"}>{row.label}</span>
                      <span className={row.sub ? "text-xs text-stone-700" : "text-sm font-medium text-stone-900"}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          )}

          {/* 조리 순서 */}
          {recipe.steps.length > 0 && (
          <>
          <div className="relative left-1/2 -ml-[50vw] w-screen border-t border-black my-[60px]" />
          <section className="mb-[60px]">
            <h2 className="text-[22px] font-semibold text-stone-900 mb-8">조리 순서</h2>
            <div>
              {recipe.steps.map((step, idx) => (
                <div key={step.step}>
                  <h3 className="text-[20px] font-semibold text-stone-900 mb-3">
                    {String(step.step).padStart(2, "0")}. {step.title}
                  </h3>
                  <hr className="mb-4 border-t border-black" />

                  {step.image && (
                    <div className="mb-4 bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.image} alt={`${step.title} 이미지`} className="w-full h-auto object-cover" loading="lazy" />
                    </div>
                  )}

                  <div className="mb-4">
                    {step.instructions.map((inst, i) => (
                      <div key={i}>
                        <p className="text-base text-stone-700 leading-relaxed">{inst}</p>
                        {i < step.instructions.length - 1 && <hr className="my-3 border-t border-black" />}
                      </div>
                    ))}
                  </div>

                  {step.tip && (
                    <div className="mt-4 pt-4 border-t border-black">
                      <p className="text-sm text-stone-600">
                        <span className="font-medium text-stone-900">TIP:</span> {step.tip}
                      </p>
                    </div>
                  )}

                  {idx < recipe.steps.length - 1 && <div className="mt-8 mb-8 border-t-[3px] border-black" />}
                </div>
              ))}
            </div>
          </section>
          </>
          )}

          {/* 구분선 */}
          <div className="relative left-1/2 -ml-[50vw] w-screen border-t border-black my-[60px]" />

          {/* 요리 리뷰 CTA */}
          <section className="text-center mb-[60px]">
            <h2 className="text-[22px] font-semibold text-stone-900 mb-2">요리 리뷰 남기기</h2>
            <p className="text-sm text-stone-500 mb-6">이 레시피를 만들어보셨나요? 사진과 함께 후기를 남겨주세요!</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-medium hover:bg-stone-800 transition-colors shadow-lg">
              <Camera className="w-5 h-5" />
              요리 리뷰 남기기
            </button>
          </section>

          {/* 관련 레시피 */}
          {recipe.relatedRecipes && recipe.relatedRecipes.length > 0 && (
            <>
              <div className="relative left-1/2 -ml-[50vw] w-screen border-t border-black my-[60px]" />
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[22px] font-semibold text-stone-900">비슷한 재료로 만드는 레시피</h2>
                  <Link href="/recipe" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900 transition-colors">
                    더보기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[13px]">
                  {recipe.relatedRecipes.map((rel) => (
                    <Link key={rel.id} href={`/recipe/${rel.id}`} className="group">
                      <div className="aspect-square overflow-hidden mb-3 bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/menus/example.png`} alt={rel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                      </div>
                      <h3 className="font-medium text-stone-900 text-sm mb-1">{rel.title}</h3>
                      <p className="text-xs text-stone-500">{rel.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
