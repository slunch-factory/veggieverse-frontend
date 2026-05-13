import type { Metadata } from "next";
import { FindPasswordClient } from "./_components/FindPasswordClient";

export const metadata: Metadata = {
  title: "비밀번호 찾기 - 슬런치 팩토리",
  description: "휴대폰 또는 이메일 인증을 통해 비밀번호를 재설정할 수 있습니다.",
};

export default function FindPasswordPage() {
  return <FindPasswordClient />;
}
