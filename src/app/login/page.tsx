import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginClient } from "./_components/LoginClient";

export const metadata: Metadata = {
  title: "로그인 - 슬런치 팩토리",
  description: "슬런치 팩토리 로그인",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
