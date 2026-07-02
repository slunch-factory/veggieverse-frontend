"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { MenuData, ExcludeCategory, MenuNutrition } from "@/app/subscribe/_data/subscription";
import { EXCLUDE_CATEGORIES } from "@/app/subscribe/_data/subscription";
import { MealImage } from "@/app/subscribe/_components/MealImage";
import { ImageCarousel } from "@/components/ImageCarousel";
import { WishlistButton } from "@/components/ui/WishlistButton";

const DUMMY_NUTRITION: MenuNutrition = { kcal: 520, protein: 18, carbs: 24, fat: 17 };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[9px] tracking-[3px] uppercase" style={{ color: "rgba(0,0,0,0.35)" }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-6 h-px" style={{ background: "#e8e2e2" }} />;
}

function Pill({ label, danger = false }: { label: string; danger?: boolean }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-[3px] text-[10.5px] font-medium"
      style={{
        border: `1px solid ${danger ? "#e6863f" : "#111"}`,
        color: danger ? "#e6863f" : "#250a00",
      }}
    >
      {label}
    </span>
  );
}

export function SubscribeDetailClient({ meal }: { meal: MenuData | null }) {
  const router = useRouter();

  if (!meal) {
    return (
      <div className="mx-auto flex max-w-[600px] flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="t-body" style={{ color: "var(--ink)" }}>
          메뉴 정보를 찾을 수 없습니다.
        </p>
        <Link href="/subscribe" className="btn btn-dark btn-sm">
          구독 메뉴 보러가기
        </Link>
      </div>
    );
  }

  const allergyTags = meal.excludable
    .filter((e) => e !== "spicy")
    .map((e) => EXCLUDE_CATEGORIES[e as ExcludeCategory]?.label)
    .filter(Boolean) as string[];
  const isSpicy = meal.excludable.includes("spicy");
  const categoryLabel = meal.category === "protein" ? "고단백" : "저칼로리";

  const nut = meal.nutrition ?? DUMMY_NUTRITION;
  const nutritionCells: [string | number, string][] = [
    [nut.kcal ?? 0, "kcal"],
    [`${nut.protein ?? 0}g`, "단백질"],
    [`${nut.carbs ?? 0}g`, "탄수화물"],
    [`${nut.fat ?? 0}g`, "지방"],
  ];
  if (nut.sodium != null) nutritionCells.push([`${nut.sodium}mg`, "나트륨"]);

  const images = meal.images?.length ? meal.images : [meal.image ?? ""];
  const description = meal.description?.trim();
  const sellingPoints = (meal.sellingPoints ?? []).filter((s) => s && s.title);
  const ingredients = meal.ingredients ?? [];
  const cookingTip = meal.cookingTip?.trim();
  const productInfo = (meal.productInfo ?? []).filter((r) => r && (r.label || r.value));

  return (
    <div className="mx-auto w-full max-w-[1000px] px-4 py-8 md:py-12">
      {/* 백 링크 */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1 t-small"
        style={{ color: "var(--ink-light)", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
      >
        <ChevronLeft size={16} />
        뒤로
      </button>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* 이미지 */}
        <div className="lg:w-[44%] lg:shrink-0">
          <div className="overflow-hidden rounded-2xl bg-[#250a00]">
            <ImageCarousel
              images={images.map((url) => ({ url }))}
              className="w-full"
              frameClassName="relative w-full"
              renderImage={(img) => <MealImage src={img.url} alt={meal.name} full className="block w-full" />}
            />
          </div>
        </div>

        {/* 본문 */}
        <div className="min-w-0 flex-1">
          <h1 className="t-h2" style={{ color: "var(--ink)", letterSpacing: "-0.5px" }}>
            {meal.name}
          </h1>
          {meal.tagline && (
            <p className="mt-2 text-[13px] leading-[1.55]" style={{ color: "rgba(0,0,0,0.5)" }}>
              {meal.tagline}
            </p>
          )}

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {meal.diet && <Pill label={meal.diet} />}
            <Pill label={categoryLabel} />
            {isSpicy && <Pill label="매운맛" />}
            {allergyTags.map((tag) => (
              <Pill key={tag} label={`Allergy · ${tag}`} danger />
            ))}
          </div>

          <div className="mt-4 t-h2" style={{ color: "var(--ink)" }}>
            {meal.price.toLocaleString()}원
          </div>

          {/* CTA */}
          <div className="mt-5 flex items-center gap-2.5">
            <Link href="/subscribe" className="btn btn-dark btn-lg flex-1 text-center">
              이 메뉴로 구독 구성하기
            </Link>
            <WishlistButton
              size={18}
              style={{ width: 48, height: 48, border: "1px solid var(--ink)", borderRadius: "var(--r-btn)", background: "var(--bg-white)" }}
              item={{
                key: `subscribe:${meal.id}`,
                kind: "subscribe",
                name: meal.name,
                imageUrl: meal.image,
                href: `/subscribe/detail/${meal.id}`,
                price: meal.price,
              }}
            />
          </div>

          <Divider />

          {sellingPoints.length > 0 && (
            <>
              <SectionLabel>Selling Points</SectionLabel>
              <div className="flex flex-col gap-3.5">
                {sellingPoints.map((s, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: "var(--ink)" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-[12.5px] font-bold leading-[1.3]" style={{ color: "var(--ink)" }}>
                        {s.title}
                      </span>
                    </div>
                    {s.desc && (
                      <p className="pl-[26px] text-[11.5px] leading-[1.55]" style={{ color: "rgba(0,0,0,0.55)" }}>
                        {s.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Divider />
            </>
          )}

          {ingredients.length > 0 && (
            <>
              <SectionLabel>Ingredients</SectionLabel>
              <div>
                {ingredients.map((ing) => (
                  <div
                    key={ing.name}
                    className="flex items-baseline justify-between py-[9px]"
                    style={{ borderBottom: "1px solid #e8e2e2" }}
                  >
                    <span className="text-[12.5px]" style={{ color: "var(--ink)" }}>{ing.name}</span>
                    <span className="ml-3 shrink-0 text-[11.5px]" style={{ color: "rgba(0,0,0,0.38)" }}>
                      {ing.amountText ?? (ing.amountG ? `${ing.amountG}g` : "")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-6" />
            </>
          )}

          <SectionLabel>Nutrition</SectionLabel>
          <div
            className="grid overflow-hidden rounded-lg"
            style={{ gridTemplateColumns: `repeat(${nutritionCells.length},1fr)`, gap: 1, background: "#c9bcbe", border: "1px solid #c9bcbe" }}
          >
            {nutritionCells.map(([val, label]) => (
              <div key={label} className="bg-white px-2 py-3.5 text-center">
                <div className="text-[14.5px] font-bold leading-[1.2]" style={{ color: "var(--ink)" }}>{val}</div>
                <div className="mt-1 text-[9px]" style={{ color: "rgba(0,0,0,0.4)", letterSpacing: "0.3px" }}>{label}</div>
              </div>
            ))}
          </div>

          {description && (
            <>
              <Divider />
              <SectionLabel>Description</SectionLabel>
              <p className="whitespace-pre-wrap text-[12.5px] leading-[1.7]" style={{ color: "#444" }}>
                {description}
              </p>
            </>
          )}

          {cookingTip && (
            <>
              <Divider />
              <SectionLabel>Cooking Tip</SectionLabel>
              <p className="whitespace-pre-wrap text-[12.5px] leading-[1.7]" style={{ color: "#444" }}>
                {cookingTip}
              </p>
            </>
          )}

          {productInfo.length > 0 && (
            <>
              <Divider />
              <SectionLabel>Product Info</SectionLabel>
              <div className="flex flex-col">
                {productInfo.map((row) => (
                  <div key={row.label} className="flex gap-3 py-2" style={{ borderBottom: "1px solid #e8e2e2" }}>
                    <span className="shrink-0 basis-[34%] text-[11.5px]" style={{ color: "rgba(0,0,0,0.45)" }}>{row.label}</span>
                    <span className="flex-1 whitespace-pre-wrap text-[11.5px] leading-[1.6]" style={{ color: "var(--ink)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
