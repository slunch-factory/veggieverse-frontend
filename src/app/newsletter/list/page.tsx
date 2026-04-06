import type { Metadata } from "next";
import { ARTICLES } from "../_data/articles";
import { ArticleGrid } from "../_components/ArticleGrid";

export const metadata: Metadata = {
  title: "뉴스레터 목록 - 슬런치 팩토리",
  description:
    "슬런치 팩토리 뉴스레터 전체 목록. 건강, 음식, 문화, 라이프스타일 카테고리별로 둘러보세요.",
};

export default function NewsletterListPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <h1 className="text-[24px] mb-2">뉴스레터</h1>
        <p className="text-[14px] text-[#6B6B6B] mb-8">
          슬런치가 전하는 건강하고 느긋한 이야기
        </p>
        <ArticleGrid articles={ARTICLES} />
      </div>
    </div>
  );
}
