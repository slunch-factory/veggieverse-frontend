import type { Metadata } from "next";
import { CompleteClient } from "./_components/CompleteClient";

export const metadata: Metadata = {
  title: "결제 완료 - 슬런치 팩토리",
  description: "구독 식단 결제가 완료되었습니다.",
};

export default function OrderCompletePage() {
  return <CompleteClient />;
}
