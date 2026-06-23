import type { Metadata } from "next";
import { UpdatePasswordClient } from "./_components/UpdatePasswordClient";

export const metadata: Metadata = {
  title: "비밀번호 재설정 - 슬런치 팩토리",
  description: "새 비밀번호를 입력해 재설정을 완료합니다.",
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordClient />;
}
