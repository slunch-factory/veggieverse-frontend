import type { Metadata } from "next";
import { FindIdClient } from "./_components/FindIdClient";

export const metadata: Metadata = {
  title: "아이디 찾기 - 슬런치 팩토리",
  description: "휴대폰 또는 이메일 인증을 통해 아이디를 찾을 수 있습니다.",
};

export default function FindIdPage() {
  return <FindIdClient />;
}
