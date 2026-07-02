import type { Metadata } from "next";
import { getSubscriptionProductDetail } from "@/lib/api/subscription";
import { SubscribeDetailClient } from "./_components/SubscribeDetailClient";

export const metadata: Metadata = {
  title: "구독 메뉴 상세 - 슬런치 팩토리",
  description: "구독 메뉴의 상세 정보 — 영양성분, 원재료, 조리 팁을 확인하세요.",
};

// 상세 응답은 공개 엔드포인트(GET /subscription/products/{id})라 서버에서 직접 조회한다.
export default async function SubscribeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meal = await getSubscriptionProductDetail(id);
  return <SubscribeDetailClient meal={meal} />;
}
