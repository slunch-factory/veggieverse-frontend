import type { Metadata } from "next";
import { ErrorView } from "@/components/ErrorView";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 - 슬런치 팩토리",
};

export default function NotFound() {
  return (
    <ErrorView
      title="페이지를 찾을 수 없습니다"
      description="주소가 변경되었거나 삭제된 페이지일 수 있습니다."
      homeHref="/"
      homeLabel="홈으로"
    />
  );
}
