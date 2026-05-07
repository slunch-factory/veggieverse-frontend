import type { Metadata } from "next";
import { SubscriptionDetailClient } from "./_components/SubscriptionDetailClient";

export const metadata: Metadata = {
  title: "구독 상세 - 슬런치 팩토리",
  description: "구독 내역 상세 정보",
};

export default function SubscriptionDetailPage() {
  return <SubscriptionDetailClient />;
}
