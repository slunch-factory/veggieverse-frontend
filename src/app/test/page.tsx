import type { Metadata } from "next";
import { FoodTest } from "./_components/FoodTest";

export const metadata: Metadata = {
  title: "음식 유형 테스트 - 슬런치 팩토리",
  description:
    "나에게 맞는 음식 유형을 찾아보세요. 식이유형, 영양 목표, 알레르기, 매운맛 선호도 4단계 테스트.",
};

export default function TestPage() {
  return <FoodTest />;
}
