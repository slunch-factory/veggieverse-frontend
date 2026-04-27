import type { Metadata } from "next";
import { SubscribeClient } from "./_components/SubscribeClient";
import { getMenus } from "@/lib/api/subscription";

export const metadata: Metadata = {
  title: "구독 - 슬런치 팩토리",
  description:
    "나만의 식단을 설계하세요. 글로우, 웰니스, 밸런스, 라이트, 클린 5가지 식단 유형으로 1주·2주 구독이 가능합니다.",
  openGraph: {
    title: "구독 - 슬런치 팩토리",
    description: "나만의 식단을 설계하세요. 5가지 식단 유형, 30개 메뉴.",
  },
};

export default async function SubscribePage() {
  const menus = await getMenus();
  return <SubscribeClient menus={menus} />;
}
