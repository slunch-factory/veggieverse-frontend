import type { Metadata } from "next";
import { OrderDetailClient } from "./_components/OrderDetailClient";

export const metadata: Metadata = {
  title: "주문 상세 - 슬런치 팩토리",
  description: "주문 내역 상세 정보",
};

export default function OrderDetailPage() {
  return <OrderDetailClient />;
}
