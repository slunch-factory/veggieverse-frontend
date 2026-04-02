import { redirect } from "next/navigation";
interface Props { params: Promise<{ id: string }> }
export default async function StoreDetailRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/store/product/${id}`);
}
