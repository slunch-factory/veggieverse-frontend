import { Suspense } from "react";
import type { Metadata } from "next";
import { BillingClient } from "./_components/BillingClient";

export const metadata: Metadata = {
  title: "구독 결제 처리 중 - 슬런치 팩토리",
  description: "구독 결제를 확인하고 있습니다.",
};

export default function SubscribeBillingPage() {
  return (
    <Suspense>
      <BillingClient />
    </Suspense>
  );
}
