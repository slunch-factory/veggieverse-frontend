import type { Metadata } from "next";
import { Suspense } from "react";
import { PreparingBanner } from "@/components/common/PreparingBanner";
import { RecipeClient } from "./_components/RecipeClient";

export const metadata: Metadata = {
  title: "레시피 - 슬런치 팩토리",
  description:
    "슬런치 팩토리의 비건 레시피 모음. 인기 레시피, 신규 레시피, 점심 메뉴, 디저트까지 다양한 카테고리의 비건 레시피를 만나보세요.",
  openGraph: {
    title: "레시피 - 슬런치 팩토리",
    description: "비건 레시피 모음. 인기, 신규, 점심, 디저트 카테고리별 레시피.",
  },
};

export default function RecipePage() {
  return (
    <>
      <PreparingBanner />
      <Suspense>
        <RecipeClient />
      </Suspense>
    </>
  );
}
