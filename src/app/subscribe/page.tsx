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
  return (
    <>
      <div
        role="status"
        className="w-full px-4 py-4 text-center"
        style={{ background: "var(--point)", color: "var(--ink)" }}
      >
        <p className="text-[16px] md:text-[18px] font-bold">
          구독 서비스는 현재 준비 중입니다 — 아직 이용하실 수 없어요. 곧 오픈할게요!
        </p>
      </div>
      <SubscribeClient menus={menus} />
    </>
  );
}
