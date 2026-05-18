import { Suspense } from "react";
import type { Metadata } from "next";
import { SuccessClient } from "./_components/SuccessClient";

export const metadata: Metadata = {
  title: "결제 처리 중 - 슬런치 팩토리",
  description: "결제를 확인하고 있습니다.",
};

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}
