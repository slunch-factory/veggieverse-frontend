import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupClient } from "./_components/SignupClient";

export const metadata: Metadata = {
  title: "회원가입 - 슬런치 팩토리",
  description: "슬런치 팩토리 회원가입",
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupClient />
    </Suspense>
  );
}
