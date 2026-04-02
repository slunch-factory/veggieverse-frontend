interface Props { params: Promise<{ id: string }> }
export default async function NewsletterDetailPage({ params }: Props) {
  const { id } = await params;
  return <div className="min-h-[60vh] bg-white p-8"><h1 className="text-2xl font-bold text-stone-800">뉴스레터 #{id}</h1></div>;
}
