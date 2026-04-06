import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDetailedRecipe } from "../_data/recipeDetails";
import { ALL_RECIPES } from "../_data/recipes";
import { RecipeDetailClient } from "../_components/RecipeDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return ALL_RECIPES.map((r) => ({ id: String(r.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = getDetailedRecipe(Number(id));
  if (!recipe) return { title: "레시피 - 슬런치 팩토리" };

  return {
    title: `${recipe.title} - 슬런치 레시피`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [{ url: recipe.heroImage || recipe.image }],
    },
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = getDetailedRecipe(Number(id));

  if (!recipe) {
    notFound();
  }

  return <RecipeDetailClient recipe={recipe} />;
}
