import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginClient } from "./_components/LoginClient";

export const metadata: Metadata = {
  title: "로그인 - 슬런치 팩토리",
  description: "슬런치 팩토리 로그인",
};

export default function LoginPage() {
  // LoginClient가 useSearchParams(?email= prefill)를 사용하므로 Suspense 경계로 감싼다
  // (정적 prerender 시 CSR bailout 빌드 오류 방지 — signup 페이지와 동일 패턴).
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
