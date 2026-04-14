import type { Metadata } from "next";
import { PRODUCTS } from "./_data/products";
import { StoreClient } from "./_components/StoreClient";

export const metadata: Metadata = {
  title: "스토어 - 슬런치 팩토리",
  description:
    "비건 밀키트, 베이커리, 소스 등 슬런치 팩토리의 식물성 제품을 만나보세요. 볶음김치, 시금치 뇨끼, 블루베리 타르트 외 다양한 비건 제품.",
  openGraph: {
    title: "스토어 - 슬런치 팩토리",
    description:
      "비건 밀키트, 베이커리, 소스 등 슬런치 팩토리의 식물성 제품을 만나보세요.",
  },
};

export default function StorePage() {
  return <StoreClient products={PRODUCTS} />;
}
