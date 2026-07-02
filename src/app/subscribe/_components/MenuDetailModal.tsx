"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { DisplayMenuData, ExcludeCategory, MenuNutrition } from "../_data/subscription";
import { EXCLUDE_CATEGORIES } from "../_data/subscription";
import { MealImage } from "./MealImage";
import { ImageCarousel } from "@/components/ImageCarousel";
import { Modal } from "@/components/ui/Modal";
import { WishlistButton } from "@/components/ui/WishlistButton";

interface MenuDetailModalProps {
  meal: DisplayMenuData | null;
  onClose: () => void;
  onAdd: (meal: DisplayMenuData) => void;
}

/* admin SubscribePreview 카드와 동일한 타이포 토큰 */
const sf = "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
const mono = "'Courier New', Courier, monospace";

const DUMMY_NUTRITION: MenuNutrition = { kcal: 520, protein: 18, carbs: 24, fat: 17 };

/* mono 섹션 헤더 (INGREDIENTS / NUTRITION / DESCRIPTION) */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8, fontSize: 9, letterSpacing: 3, color: "rgba(0,0,0,0.35)", fontFamily: mono }}>
      {children}
    </div>
  );
}

const DIVIDER = <div style={{ margin: "24px 0", height: 1, background: "#c9bcbe" }} />;

/**
 * 식단 상세 모달 — admin `SubscribePreview` 카드 디자인 1:1 포트.
 * 어드민에서 편집하는 미리보기와 동일한 레이아웃을 소비자에서도 렌더한다(최종적으로 admin→veggieverse 동기화 목표).
 * 모바일에서는 사진이 위로, 상세 설명이 그 아래로 노출된다. +/× 버튼·담기·ESC 등 모달 상호작용은 유지.
 */
export function MenuDetailModal({ meal, onClose, onAdd }: MenuDetailModalProps) {
  // 닫힘 애니메이션 동안에도 마지막 식단을 렌더하기 위해 보존한다
  // (부모가 meal=null로 닫아도 종료 트랜지션이 끝날 때까지 내용 유지).
  // 렌더 중 파생 상태 조정 — React 공식 패턴(이전 prop 기억), effect 불필요.
  const [displayMeal, setDisplayMeal] = useState<DisplayMenuData | null>(meal);
  if (meal && meal !== displayMeal) {
    setDisplayMeal(meal);
  }

  const renderMeal = meal ?? displayMeal;

  return (
    <Modal
      isOpen={meal != null}
      onClose={onClose}
      labelledBy="mm-name"
      wrapperClassName="max-lg:items-end max-lg:p-0"
      className={[
        "w-full overflow-hidden bg-[#fcfaf8] flex",
        "lg:flex-row lg:max-w-[900px] lg:max-h-[90dvh] lg:rounded-[20px]",
        "lg:border lg:border-black",
        "max-lg:flex-col max-lg:h-[88dvh] max-lg:rounded-t-[16px]",
        "max-lg:border-t max-lg:border-black",
      ].join(" ")}
    >
      {renderMeal && <MenuDetailContent meal={renderMeal} onClose={onClose} onAdd={onAdd} />}
    </Modal>
  );
}

function MenuDetailContent({
  meal,
  onClose,
  onAdd,
}: {
  meal: DisplayMenuData;
  onClose: () => void;
  onAdd: (meal: DisplayMenuData) => void;
}) {
  const allergyTags = meal.excludable
    .filter((e) => e !== "spicy")
    .map((e) => EXCLUDE_CATEGORIES[e as ExcludeCategory]?.label)
    .filter(Boolean);

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

  const ingredients = meal.ingredients ?? [];
  // images 배열이 있으면 슬라이드, 없으면 단일 image 1장(빈 값이면 MealImage placeholder)
  const detailImages = meal.images?.length ? meal.images : [meal.image ?? ""];

  const description = meal.description?.trim();
  const sellingPoints = (meal.sellingPoints ?? []).filter((s) => s && s.title);
  const cookingTip = meal.cookingTip?.trim();
  const productInfo = (meal.productInfo ?? []).filter((r) => r && (r.label || r.value));

  const pill = (key: string, label: string, danger = false) => (
    <span
      key={key}
      style={{
        display: "inline-block",
        padding: "3px 10px",
        border: `1px solid ${danger ? "#e6863f" : "#111"}`,
        borderRadius: 100,
        fontSize: 10.5,
        fontWeight: 500,
        color: danger ? "#e6863f" : "#250a00",
        fontFamily: sf,
      }}
    >
      {label}
    </span>
  );

  const descriptionBlock = description ? (
    <div data-field-id="field-description">
      <SectionLabel>DESCRIPTION</SectionLabel>
      <div style={{ fontSize: 12.5, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: sf }}>
        {description}
      </div>
    </div>
  ) : null;

  return (
    <>
          {/* LEFT: 이미지 (어두운 배경, 여러 장이면 슬라이드)
              ※ 로고는 이미지 자체에 워터마크로 포함되어 있어 별도 오버레이를 그리지 않는다(중복 방지). */}
          <div className="relative overflow-hidden bg-[#250a00] lg:w-[44%] lg:shrink-0 max-lg:w-full max-lg:shrink-0 max-lg:h-[30vh] max-lg:max-h-[280px]">
            <ImageCarousel
              images={detailImages.map((url) => ({ url }))}
              className="w-full max-lg:h-full"
              frameClassName="relative w-full max-lg:h-full"
              renderImage={(img) => (
                <MealImage src={img.url} alt={meal.displayName} full className="block w-full lg:h-auto max-lg:h-full max-lg:object-cover" />
              )}
            />
          </div>

          {/* RIGHT: 본문
              데스크톱: 모달 높이를 왼쪽 이미지(자연 높이)에 맞추기 위해 본문은 absolute로 띄워
                        칼럼 자체 높이에 기여하지 않게 하고, 내부에서만 스크롤한다.
              모바일: 일반 흐름 + 스크롤. */}
          <div
            className="flex-1 min-w-0 lg:relative max-lg:overflow-y-auto max-lg:min-h-0"
            style={{ fontFamily: sf }}
          >
          <div className="lg:absolute lg:inset-0 lg:overflow-y-auto lg:px-9 lg:pt-5 lg:pb-10 max-lg:px-[22px] max-lg:py-7">
            {/* 찜 / 담기 / 닫기 버튼 */}
            <div className="flex flex-row items-center justify-end gap-[10px] mb-3">
              <WishlistButton
                size={16}
                style={{ width: 36, height: 36, border: "1px solid #111", background: "#fcfaf8" }}
                item={{
                  key: `subscribe:${meal.id}`,
                  kind: "subscribe",
                  name: meal.displayName,
                  imageUrl: meal.image,
                  href: "/subscribe",
                  price: meal.price,
                }}
              />
              <button
                type="button"
                onClick={() => { onAdd(meal); onClose(); }}
                aria-label="식단에 담기"
                title="식단에 담기"
                className="inline-flex items-center gap-1 h-9 max-lg:h-10 px-4 shrink-0 border border-black rounded-full bg-[#dfff4f] text-black text-[13px] font-medium leading-none hover:bg-black hover:text-[#dfff4f] transition-colors"
              >
                <Plus size={15} strokeWidth={2.2} />
                담기
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="w-9 h-9 max-lg:w-10 max-lg:h-10 shrink-0 border border-black rounded-full bg-[#fcfaf8] text-[#3d3d3d] flex items-center justify-center text-[18px] leading-none font-light hover:bg-black hover:text-[#dfff4f] transition-colors"
              >
                ×
              </button>
            </div>

            {/* 모바일: 이미지 바로 아래에 상세 설명 */}
            {description && (
              <div className="lg:hidden" style={{ marginBottom: 4 }}>
                {descriptionBlock}
                {DIVIDER}
              </div>
            )}

            {/* 제품명 */}
            <div
              id="mm-name"
              style={{ fontSize: 26, fontWeight: 700, color: "#250a00", lineHeight: 1.25, letterSpacing: -0.5, fontFamily: sf }}
            >
              {meal.displayName}
            </div>

            {/* 태그라인 */}
            {meal.tagline && (
              <div style={{ marginTop: 8, fontSize: 12, color: "rgba(0,0,0,0.5)", lineHeight: 1.55, fontFamily: sf }}>
                {meal.tagline}
              </div>
            )}

            {/* 뱃지 */}
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {meal.diet && pill("diet", meal.diet)}
              {pill("cat", categoryLabel)}
              {isSpicy && pill("spicy", "매운맛")}
              {allergyTags.map((tag) => pill(`al-${tag}`, `Allergy · ${tag}`, true))}
            </div>

            {/* 가격 */}
            <div style={{ marginTop: 18, fontSize: 21, fontWeight: 700, color: "#250a00", letterSpacing: -0.4, fontFamily: sf }}>
              {meal.price.toLocaleString()}원
            </div>

            {DIVIDER}

            {/* SELLING POINTS */}
            {sellingPoints.length > 0 && (
              <>
                <div>
                  <SectionLabel>SELLING POINTS</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {sellingPoints.map((s, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 18,
                              height: 18,
                              background: "#250a00",
                              color: "#fff",
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 700,
                              flexShrink: 0,
                              fontFamily: sf,
                            }}
                          >
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#250a00", fontFamily: sf, lineHeight: 1.3 }}>
                            {s.title}
                          </span>
                        </div>
                        {s.desc && (
                          <div style={{ fontSize: 11.5, color: "rgba(0,0,0,0.55)", lineHeight: 1.55, paddingLeft: 26, fontFamily: sf }}>
                            {s.desc}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {DIVIDER}
              </>
            )}

            {/* INGREDIENTS */}
            {ingredients.length > 0 && (
              <>
                <div>
                  <SectionLabel>INGREDIENTS</SectionLabel>
                  {ingredients.map((ing) => (
                    <div
                      key={ing.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        padding: "9px 0",
                        borderBottom: "1px solid #e8e2e2",
                      }}
                    >
                      <span style={{ fontSize: 12.5, color: "#250a00", fontFamily: sf }}>{ing.name}</span>
                      <span style={{ fontSize: 11.5, color: "rgba(0,0,0,0.38)", fontFamily: sf, marginLeft: 12, flexShrink: 0 }}>
                        {ing.amountText ?? (ing.amountG ? `${ing.amountG}g` : "")}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 24 }} />
              </>
            )}

            {/* NUTRITION */}
            <SectionLabel>NUTRITION</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${nutritionCells.length},1fr)`,
                gap: 1,
                background: "#c9bcbe",
                border: "1px solid #c9bcbe",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {nutritionCells.map(([val, label]) => (
                <div key={label} style={{ background: "#fff", padding: "14px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#250a00", fontFamily: sf, lineHeight: 1.2 }}>{val}</div>
                  <div style={{ fontSize: 9, color: "rgba(0,0,0,0.4)", marginTop: 4, fontFamily: sf, letterSpacing: 0.3 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* DESCRIPTION (데스크톱 — 모바일은 이미지 바로 아래에서 이미 노출) */}
            {description && (
              <div className="max-lg:hidden">
                {DIVIDER}
                {descriptionBlock}
              </div>
            )}

            {/* COOKING TIP */}
            {cookingTip && (
              <>
                {DIVIDER}
                <div data-field-id="field-cooking-tip">
                  <SectionLabel>COOKING TIP</SectionLabel>
                  <div style={{ fontSize: 12.5, color: "#444", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: sf }}>
                    {cookingTip}
                  </div>
                </div>
              </>
            )}

            {/* PRODUCT INFO */}
            {productInfo.length > 0 && (
              <>
                {DIVIDER}
                <div>
                  <SectionLabel>PRODUCT INFO</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {productInfo.map((row) => (
                      <div
                        key={row.label}
                        style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #e8e2e2" }}
                      >
                        <span style={{ flex: "0 0 34%", fontSize: 11.5, color: "rgba(0,0,0,0.45)", fontFamily: sf }}>
                          {row.label}
                        </span>
                        <span style={{ flex: 1, fontSize: 11.5, color: "#250a00", lineHeight: 1.6, fontFamily: sf, whiteSpace: "pre-wrap" }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
    </>
  );
}
