import type { Metadata } from "next";
import { StoreClient } from "./_components/StoreClient";
import { getStoreProducts, type StoreSortParam } from "@/lib/api/store";

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

const VALID_SORTS: StoreSortParam[] = ["nameAsc", "nameDesc", "priceAsc", "popularDesc"];

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sort, search } = await searchParams;
  const currentSort = (VALID_SORTS.includes(sort as StoreSortParam) ? sort : "nameAsc") as StoreSortParam;
  const searchQuery = typeof search === "string" ? search : "";
  const products = await getStoreProducts(currentSort);

  return (
    <StoreClient
      initialProducts={products}
      currentSort={currentSort}
      searchQuery={searchQuery}
    />
  );
}
