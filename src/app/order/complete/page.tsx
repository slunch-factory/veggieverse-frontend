import { Suspense } from "react";
import type { Metadata } from "next";
import { CompleteClient } from "./_components/CompleteClient";

export const metadata: Metadata = {
  title: "주문 완료 - 슬런치 팩토리",
  description: "주문이 완료되었습니다.",
};

export default function OrderCompletePage() {
  return (
    <Suspense>
      <CompleteClient />
    </Suspense>
  );
}
