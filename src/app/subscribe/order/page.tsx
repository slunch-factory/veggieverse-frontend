import type { Metadata } from "next";
import { OrderClient } from "./_components/OrderClient";

export const metadata: Metadata = {
  title: "주문 / 결제 - 슬런치 팩토리",
  description: "구성한 식단의 주문 및 결제 페이지",
};

export default function SubscribeOrderPage() {
  return <OrderClient />;
}
