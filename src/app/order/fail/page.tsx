import { Suspense } from "react";
import type { Metadata } from "next";
import { FailClient } from "./_components/FailClient";

export const metadata: Metadata = {
  title: "결제 실패 - 슬런치 팩토리",
  description: "결제가 완료되지 못했습니다.",
};

export default function OrderFailPage() {
  return (
    <Suspense>
      <FailClient />
    </Suspense>
  );
}
