"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, X } from "lucide-react";

interface BookmarkedRecipe {
  id: number;
  title: string;
  description: string;
  category: string;
  author: string;
  likes: number;
}

const SAMPLE: BookmarkedRecipe[] = [
  { id: 1, title: "두부 스테이크", description: "크리미한 버섯 소스와 구운 채소를 곁들인", category: "점심", author: "비건셰프", likes: 2847 },
  { id: 2, title: "아보카도 포케", description: "신선한 아보카도와 퀴노아로 만든 건강한 한 끼", category: "점심", author: "헬시푸드", likes: 2634 },
  { id: 3, title: "레몬 파스타", description: "상큼한 지중해 풍미", category: "데이트", author: "파스타장인", likes: 2512 },
  { id: 4, title: "배추 된장국", description: "구수한 된장의 깊은 맛", category: "한식", author: "한식셰프", likes: 2398 },
  { id: 5, title: "망고 푸딩", description: "열대의 달콤함을 담아", category: "디저트", author: "디저트왕", likes: 2287 },
  { id: 6, title: "블루베리 오트밀", description: "건강한 아침 식사", category: "신규", author: "브런치러버", likes: 2156 },
];

const CATEGORIES = ["전체", "점심", "디저트", "한식", "데이트", "신규"];

export default function MyBookmarksPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [bookmarks, setBookmarks] = useState<BookmarkedRecipe[]>(SAMPLE);

  const filtered = selectedCategory === "전체"
    ? bookmarks
    : bookmarks.filter((b) => b.category === selectedCategory);

  const remove = (id: number) => setBookmarks((prev) => prev.filter((b) => b.id !== id));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`tag${selectedCategory === cat ? " is-selected" : ""}`}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark size={40} color="var(--neutral-stone)" className="inline-block mb-4" />
          <p className="t-small mb-4" style={{ color: "var(--ink-light)" }}>북마크한 레시피가 없습니다.</p>
          <Link
            href="/recipe"
            className="t-small"
            style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            레시피 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {filtered.map((recipe) => (
            <div key={recipe.id} className="card relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(recipe.id);
                }}
                aria-label={`${recipe.title} 북마크 삭제`}
                className="absolute top-2 right-2 z-10 flex items-center justify-center"
                style={{
                  width: 28,
                  height: 28,
                  background: "var(--bg-white)",
                  border: "1px solid var(--ink)",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                <X size={14} color="var(--ink)" />
              </button>

              <div onClick={() => router.push(`/recipe/${recipe.id}`)} className="cursor-pointer">
                <div className="card-img" style={{ aspectRatio: "1/1" }} />
                <div className="card-body">
                  <p className="t-caption mb-1" style={{ color: "var(--ink-light)" }}>{recipe.category}</p>
                  <p className="card-name">{recipe.title}</p>
                  <p className="card-desc">{recipe.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>
                      @{recipe.author}
                    </span>
                    <span className="t-caption" style={{ color: "var(--neutral-stone)" }}>
                      {recipe.likes.toLocaleString()} likes
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
