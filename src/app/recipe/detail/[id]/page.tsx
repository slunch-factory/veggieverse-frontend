import { redirect } from "next/navigation";
interface Props { params: Promise<{ id: string }> }
export default async function RecipeDetailLegacy({ params }: Props) {
  const { id } = await params;
  redirect(`/recipe/${id}`);
}
