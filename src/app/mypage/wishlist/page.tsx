"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/contexts/WishlistContext";

type KindFilter = "all" | "store" | "subscribe";

const FILTERS: { key: KindFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "store", label: "스토어" },
  { key: "subscribe", label: "구독" },
];

export default function MyWishlistPage() {
  const router = useRouter();
  const { items, remove } = useWishlist();
  const [filter, setFilter] = useState<KindFilter>("all");

  const filtered = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <div>
      {/* 필터 — .tag 패턴 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f.key === "all" ? items.length : items.filter((i) => i.kind === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`tag${filter === f.key ? " is-selected" : ""}`}
              type="button"
            >
              {f.label} {count}
            </button>
          );
        })}
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
          {filtered.map((item) => (
            <WishlistCard
              key={item.key}
              item={item}
              onRemove={() => remove(item.key)}
              onOpen={() => router.push(item.href)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({
  item,
  onRemove,
  onOpen,
}: {
  item: WishlistItem;
  onRemove: () => void;
  onOpen: () => void;
}) {
  const hasDiscount =
    typeof item.discountedPrice === "number" && item.discountedPrice < item.price;
  const shownPrice = item.discountedPrice ?? item.price;

  return (
    <div className="card relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label={`${item.name} 관심상품에서 삭제`}
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

      <div onClick={onOpen} className="cursor-pointer">
        <div className="card-img relative overflow-hidden" style={{ aspectRatio: "1/1" }}>
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0";
              }}
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[13px]" style={{ color: "var(--neutral-stone)" }}>
              IMG
            </span>
          )}
        </div>
        <div className="card-body">
          <p className="t-caption mb-1" style={{ color: "var(--ink-light)" }}>
            {item.kind === "subscribe" ? "구독 메뉴" : "스토어"}
          </p>
          <p className="card-name">{item.name}</p>
          <div className="card-price-row">
            {hasDiscount && (
              <span className="card-orig" style={{ marginBottom: 0 }}>
                {item.price.toLocaleString()}원
              </span>
            )}
            <span className="card-price">{shownPrice.toLocaleString()}원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
