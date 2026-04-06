"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Upload, Trophy } from "lucide-react";
import TopControlBar, { type TabItem } from "@/components/store/TopControlBar";
import { RECIPE_CATEGORIES, TOP_RECIPES, ALL_RECIPES, type RecipeCategory } from "../_data/recipes";
import { VEGAN_TYPES, SPIRIT_TAG_MAPPING, getSpiritCurationMessage } from "../_data/spirits";
import { RecipeCard } from "./RecipeCard";
import { RecipeSection } from "./RecipeSection";
import { HeroCarousel } from "./HeroCarousel";

const RECIPE_TABS: TabItem[] = [
  { id: "popular", label: "인기" },
  { id: "new", label: "신규" },
  { id: "lunch", label: "점심" },
  { id: "dessert", label: "디저트" },
  { id: "korean", label: "한식" },
  { id: "drink", label: "술안주" },
  { id: "date", label: "데이트" },
];

/* ─── 인기 레시피 그리드 ─── */
function PopularSection() {
  return (
    <section className="bg-[var(--cream)] pt-8">
      <div className="px-4 md:px-8 lg:px-16 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[12px] text-[#6B6B6B] uppercase tracking-[0.05em]">Popular</span>
            <h2 className="text-[20px] text-black mt-1">인기 레시피</h2>
          </div>
          <Link href="/recipe/hall-of-fame" className="text-[13px] text-[#6B6B6B] hover:underline hover:text-black transition-colors">
            전체보기 →
          </Link>
        </div>
      </div>
      <div className="px-4 md:px-8 lg:px-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TOP_RECIPES.map((recipe, idx) => (
            <RecipeCard key={recipe.id} recipe={recipe} rank={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 스피릿 진입 뷰 ─── */
function SpiritView({ spiritName, spiritType }: { spiritName: string; spiritType: string }) {
  const spiritInfo = VEGAN_TYPES.find((t) => t.mbti === spiritType);
  const spiritTags = SPIRIT_TAG_MAPPING[spiritType] || [];

  const filteredCategories = useMemo(() => {
    return RECIPE_CATEGORIES.map((cat) => ({
      ...cat,
      recipes: cat.recipes.filter((r) => r.tags.some((t) => spiritTags.includes(t))),
    })).filter((cat) => cat.recipes.length > 0);
  }, [spiritTags]);

  const spiritPicks = useMemo(() => {
    return ALL_RECIPES.filter((r) => r.tags.some((t) => spiritTags.includes(t)))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 6);
  }, [spiritTags]);

  if (!spiritInfo) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] overflow-x-hidden">
      {/* 히어로 */}
      <section className="w-full max-w-[1440px] mx-auto px-10 py-20 text-center" style={{ background: "#EEF2EB" }}>
        <div className="text-5xl mb-4">{spiritInfo.emoji}</div>
        <h1 className="text-[var(--font-size-h2)] text-stone-900 mb-2">{spiritName} 추천 레시피</h1>
        <p className="text-[16px] text-[#6B6B6B] max-w-2xl mx-auto">&ldquo;{spiritInfo.description}&rdquo;</p>
      </section>

      {/* 스피릿 PICK */}
      {spiritPicks.length > 0 && (
        <section className="w-full py-20 px-4 md:px-8 lg:px-16" style={{ background: "#EEF2EB" }}>
          <div className="max-w-[1440px] mx-auto">
            <span className="inline-block px-4 py-1.5 text-xs tracking-wide uppercase mb-3 bg-[#3D4A3A] text-white">스피릿 PICK</span>
            <h2 className="text-[var(--font-size-h2)] text-stone-900 mb-2">{spiritName} 스피릿이 좋아하는 레시피</h2>
            <p className="text-[16px] text-stone-600 mb-8">{spiritName}과 같은 스피릿들이 가장 많이 좋아한 레시피예요</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {spiritPicks.map((recipe, idx) => (
                <RecipeCard key={recipe.id} recipe={recipe} rank={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 큐레이션 섹션 */}
      <section className="w-full py-20">
        <div className="px-4 md:px-8 lg:px-16 max-w-[1440px] mx-auto mb-12">
          <h2 className="text-[var(--font-size-h2)] text-stone-900 mb-2">{spiritName}에게 어울리는 레시피</h2>
          <p className="text-[16px] text-stone-600">{getSpiritCurationMessage(spiritName)}</p>
        </div>
        {filteredCategories.map((cat, i) => (
          <RecipeSection key={cat.id} category={cat} index={i} />
        ))}
      </section>

      {/* 스피릿 미션 */}
      <section className="w-full py-20 border-t border-[rgba(0,0,0,0.06)]">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 mb-6">
            <Trophy className="w-5 h-5 text-emerald-700" />
            <span className="text-emerald-700 font-semibold">스피릿 미션</span>
          </div>
          <h3 className="text-[var(--font-size-h2)] text-stone-900 mb-3">이 레시피를 만들어보고 후기를 남겨주시면</h3>
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-4xl">{spiritInfo.emoji}</span>
            <span className="text-[var(--font-size-h2)] text-emerald-700">{spiritName}</span>
            <span className="text-4xl">배지를 드려요!</span>
          </div>
          <p className="text-[16px] text-stone-600">
            레시피를 따라 만들어보고 사진과 후기를 공유해주세요.
            <br />같은 스피릿 유저들과 함께 나누는 즐거움을 경험해보세요!
          </p>
        </div>
      </section>

      {/* 전체 카테고리 */}
      <section className="w-full py-20">
        {RECIPE_CATEGORIES.map((cat, i) => (
          <RecipeSection key={cat.id} category={cat} index={i} />
        ))}
      </section>
    </div>
  );
}

/* ─── 메인 레시피 페이지 ─── */
export function RecipeClient() {
  const searchParams = useSearchParams();
  const spiritName = searchParams.get("spirit");
  const spiritType = searchParams.get("spiritType");

  const [activeTab, setActiveTab] = useState("popular");

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "popular") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const section = document.getElementById(`recipe-section-${tabId}`);
      if (section) {
        const offset = section.offsetTop - 160;
        window.scrollTo({ top: offset, behavior: "smooth" });
      }
    }
  };

  // 스피릿 진입
  if (spiritName && spiritType) {
    return <SpiritView spiritName={spiritName} spiritType={spiritType} />;
  }

  // 일반 진입
  return (
    <div className="w-full min-h-screen bg-[var(--cream)]">
      <TopControlBar tabs={RECIPE_TABS} activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="w-full flex flex-col pt-[48px]">
        <HeroCarousel recipes={TOP_RECIPES} />
        {RECIPE_CATEGORIES.map((cat, i) => (
          <RecipeSection key={cat.id} category={cat} index={i} />
        ))}

        {/* 레시피 작성 CTA */}
        <div className="px-4 md:px-8 lg:px-16 py-16 bg-[var(--cream)]">
          <div className="text-center max-w-xl mx-auto">
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-5">
              <Plus className="w-6 h-6 text-[#6B6B6B]" />
            </div>
            <h3 className="text-[18px] text-black mb-2">나만의 레시피를 공유해보세요</h3>
            <p className="text-[14px] text-[#6B6B6B] mb-5 leading-[1.6]">당신의 특별한 비건 레시피를 슬런치 커뮤니티와 함께 나눠보세요.</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 text-[14px] bg-black text-white rounded-[4px] hover:opacity-80 transition-opacity">
              <Upload className="w-4 h-4" />
              레시피 작성하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
