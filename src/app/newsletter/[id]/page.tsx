import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ARTICLES,
  AUTHOR_BIO,
  AUTHOR_AVATAR,
  getArticleById,
  getAdjacentArticles,
  type ContentBlock,
} from "../_data/articles";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ id: String(a.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = getArticleById(Number(id));
  if (!article) return { title: "뉴스레터 - 슬런치 팩토리" };

  return {
    title: `${article.title} - 슬런치 뉴스레터`,
    description: article.subtitle,
    openGraph: {
      title: article.title,
      description: article.subtitle,
      type: "article",
      images: [{ url: article.thumbnail }],
    },
  };
}

function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "heading" ? (
          <h3 key={i} className="text-[16px] font-normal text-black mt-10 mb-4">
            {block.text}
          </h3>
        ) : (
          <p key={i} className="mb-6 text-[14px] text-[#3D3D3D] leading-[1.8]">
            {block.text}
          </p>
        ),
      )}
    </>
  );
}

function ArticleImages({ images }: { images: { large?: string; small?: string[] } | undefined }) {
  if (!images) return null;
  return (
    <>
      {images.large && (
        <div className="my-[60px]">
          <div className="w-full aspect-[4/3] bg-[#E0E0E0] flex items-center justify-center">
            <span className="text-[#6B6B6B] text-[14px]">이미지 1</span>
          </div>
        </div>
      )}
    </>
  );
}

function SmallImages({ images }: { images: { small?: string[] } | undefined }) {
  if (!images?.small || images.small.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-[13px] my-[60px]">
      {images.small.slice(0, 2).map((_, idx) => (
        <div key={idx} className="aspect-square bg-[#E0E0E0] flex items-center justify-center">
          <span className="text-[#6B6B6B] text-[14px]">이미지 {idx + 2}</span>
        </div>
      ))}
    </div>
  );
}

function ImageOverlay({ article }: { article: { category: string; title: string; subtitle: string; author: string; date: string; thumbnail: string } }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={article.thumbnail}
        alt={`${article.title} - 커버 이미지`}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
    </>
  );
}

function AuthorInfo({ author, avatar, bio }: { author: string; avatar?: string; bio?: string }) {
  return (
    <div className="border-t border-black mt-[60px] pt-5">
      <div className="flex items-center gap-[13px]">
        {avatar && (
          <div className="w-[50px] h-[50px] rounded-full overflow-hidden bg-[#E5E5E0] shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={author} className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <p className="text-[14px] text-black mb-1">{author}</p>
          {bio && <p className="text-[13px] text-[#6B6B6B] leading-[1.5]">{bio.split("\n")[0]}</p>}
        </div>
      </div>
    </div>
  );
}

function ArticleNav({ prev, next }: { prev: { id: number } | null; next: { id: number } | null }) {
  return (
    <div className="flex justify-between mt-[60px] pt-5 border-t border-black">
      {prev ? (
        <Link href={`/newsletter/${prev.id}`} className="flex items-center gap-2 py-3 text-[14px] text-black">
          <ChevronLeft size={16} /><span>이전글</span>
        </Link>
      ) : <div />}
      <Link href="/newsletter" className="px-6 py-3 border border-black text-[14px] text-black">목록</Link>
      {next ? (
        <Link href={`/newsletter/${next.id}`} className="flex items-center gap-2 py-3 text-[14px] text-black">
          <span>다음글</span><ChevronRight size={16} />
        </Link>
      ) : <div />}
    </div>
  );
}

export default async function NewsletterDetailPage({ params }: Props) {
  const { id } = await params;
  const article = getArticleById(Number(id));
  if (!article) notFound();

  const { prev, next } = getAdjacentArticles(article.id);
  const authorBio = AUTHOR_BIO[article.author];
  const authorAvatar = AUTHOR_AVATAR[article.author];

  const titleOverlay = (
    <div className="absolute bottom-8 left-6 right-6 lg:bottom-10 lg:left-10 lg:right-10 z-10">
      <p className="text-[11px] text-white/80 tracking-[0.1em] uppercase mb-2">{article.category}</p>
      <h1 className="text-[28px] font-normal text-white leading-[1.3] mb-2">{article.title}</h1>
      <p className="text-[14px] text-white/80 leading-[1.5] mb-3">{article.subtitle}</p>
      <div className="flex items-center gap-2 text-[12px] text-white/60">
        <span>{article.author}</span><span>·</span><span>{article.date}</span>
      </div>
    </div>
  );

  const articleBody = (
    <>
      {article.quote && (
        <div className="border-t border-b border-black py-8 mb-[60px]">
          <p className="text-center text-[14px] text-[#6B6B6B] leading-[1.8] whitespace-pre-line">
            {article.quote}
          </p>
        </div>
      )}
      <article>
        <ContentBlocks blocks={article.contentBeforeImages} />
        <ArticleImages images={article.images} />
        <ContentBlocks blocks={article.contentAfterImages} />
        <SmallImages images={article.images} />
        <ContentBlocks blocks={article.contentAfterSmallImages} />
      </article>
      <AuthorInfo author={article.author} avatar={authorAvatar} bio={authorBio} />
      <ArticleNav prev={prev} next={next} />
    </>
  );

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      {/* 상단 네비게이션 */}
      <div
        className="fixed left-0 right-0 z-[45] bg-white border-b border-black"
        style={{ top: "var(--header-area-h, 72px)" }}
      >
        <div className="flex items-center h-12 max-w-[1440px] mx-auto px-5">
          <Link href="/newsletter" className="flex items-center gap-1.5 text-[14px] text-black">
            <ChevronLeft size={18} />
            뉴스레터 목록
          </Link>
        </div>
      </div>

      {/* ─── 모바일: 세로 스택 ─── */}
      <div className="lg:hidden px-6 pt-[60px]">
        <div className="h-[400px] w-full relative mb-8">
          <ImageOverlay article={article} />
          {titleOverlay}
        </div>
        <main className="pb-16">{articleBody}</main>
      </div>

      {/* ─── 데스크톱: 좌측 sticky + 우측 스크롤 ─── */}
      <div className="hidden lg:grid lg:grid-cols-2 pt-[60px]">
        {/* LEFT: sticky — 우측 스크롤 중 화면에 고정, 우측 끝나면 함께 풀림 */}
        <div>
          <aside
            className="sticky z-[40]"
            style={{
              top: "calc(var(--header-area-h, 72px) + 48px)",
              height: "calc(100vh - var(--header-area-h, 72px) - 48px)",
            }}
          >
            <div className="relative w-full h-full">
              <ImageOverlay article={article} />
              {titleOverlay}
            </div>
          </aside>
        </div>

        {/* RIGHT: 오른쪽 절반 스크롤 */}
        <main className="px-10 xl:px-16 pt-5 pb-16">
          {articleBody}
        </main>
      </div>
    </div>
  );
}
