interface Props { params: Promise<{ categoryId: string }> }
export default async function RecipeCategoryPage({ params }: Props) {
  const { categoryId } = await params;
  return <div className="min-h-[60vh] bg-white p-8"><h1 className="text-2xl font-bold text-stone-800">카테고리: {categoryId}</h1></div>;
}
