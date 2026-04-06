import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "./_data/articles";
import { ArticleGrid } from "./_components/ArticleGrid";

export const metadata: Metadata = {
  title: "뉴스레터 - 슬런치 팩토리",
  description:
    "건강, 음식, 문화, 라이프스타일에 대한 슬런치 팩토리의 뉴스레터. 비건 라이프에 영감을 주는 이야기를 만나보세요.",
  openGraph: {
    title: "뉴스레터 - 슬런치 팩토리",
    description:
      "건강, 음식, 문화, 라이프스타일에 대한 슬런치 팩토리의 뉴스레터.",
  },
};

export default function NewsletterPage() {
  const featured = ARTICLES[0];

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 - 최신 아티클 */}
      {featured && (
        <Link href={`/newsletter/${featured.id}`} className="block group">
          <div className="relative w-full aspect-[21/9] bg-[#E5E5E0] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featured.thumbnail}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
              <p className="text-[11px] uppercase tracking-[0.1em] mb-2 opacity-80">
                {featured.category} · {featured.date}
              </p>
              <h1 className="text-[24px] md:text-[32px] leading-[1.3] mb-2">
                {featured.title}
              </h1>
              <p className="text-[14px] opacity-80 max-w-[600px]">
                {featured.subtitle}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* 아티클 목록 */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <h2 className="text-[20px] mb-8">모든 글</h2>
        <ArticleGrid articles={ARTICLES} />
      </div>
    </div>
  );
}
