"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";

interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
}

const SAMPLE: WishlistProduct[] = [
  { id: 1, name: "볶음김치", price: 12000, category: "캔 제품", description: "젓갈이 들어가지 않은 비건 볶음김치" },
  { id: 2, name: "김치볶음밥", price: 12000, originalPrice: 15000, category: "밀키트", description: "비건 캔김치로 구성한 김치볶음밥 밀키트" },
  { id: 4, name: "블루베리 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "슬런치 팩토리 프리미엄 블루베리 타르트" },
  { id: 6, name: "잠봉뵈르", price: 8000, originalPrice: 12000, category: "밀키트", description: "슬런치 팩토리의 베스트 셀러" },
  { id: 3, name: "시금치 뇨끼", price: 18000, category: "밀키트", description: "신선한 시금치를 넣은 수제 뇨끼" },
  { id: 5, name: "비건 라자냐", price: 24000, category: "밀키트", description: "식물성 치즈로 만든 정통 이탈리안 라자냐" },
];

const CATEGORIES = ["전체", "밀키트", "베이커리", "캔 제품", "소스"];

export default function MyWishlistPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [wishlist, setWishlist] = useState<WishlistProduct[]>(SAMPLE);

  const filtered = selectedCategory === "전체"
    ? wishlist
    : wishlist.filter((p) => p.category === selectedCategory);

  const remove = (id: number) => setWishlist((prev) => prev.filter((p) => p.id !== id));

  return (
    <div>
      {/* 필터 — .tag 패턴 */}
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
          <Heart size={40} color="var(--neutral-stone)" className="inline-block mb-4" />
          <p className="t-small mb-4" style={{ color: "var(--ink-light)" }}>관심상품이 없습니다.</p>
          <Link
            href="/store"
            className="t-small"
            style={{ color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            상품 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {filtered.map((product) => (
            <div key={product.id} className="card relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(product.id);
                }}
                aria-label={`${product.name} 찜 목록에서 삭제`}
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

              <div onClick={() => router.push(`/store/product/${product.id}`)} className="cursor-pointer">
                <div className="card-img" style={{ aspectRatio: "1/1" }} />
                <div className="card-body">
                  <p className="t-caption mb-1" style={{ color: "var(--ink-light)" }}>{product.category}</p>
                  <p className="card-name">{product.name}</p>
                  <div className="card-price-row">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="card-orig" style={{ marginBottom: 0 }}>
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                    <span className="card-price">{product.price.toLocaleString()}원</span>
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
