"use client";

import { type CSSProperties } from "react";
import { Heart } from "lucide-react";
import { useWishlist, type WishlistItem } from "@/contexts/WishlistContext";
import { useToast } from "@/components/ui/Toast";

/**
 * 공용 찜(위시리스트) 토글 버튼.
 * 스토어 카드/상세, 구독 카드 어디서든 `item`만 넘기면 동작한다.
 * 카드 클릭(상세 이동)과 겹치는 위치에 쓰일 수 있어 클릭 전파를 막는다.
 */
export interface WishlistButtonProps {
  item: WishlistItem;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** 아이콘만 둘 때 배경/테두리 없는 고스트 스타일. */
  ghost?: boolean;
}

export function WishlistButton({
  item,
  size = 18,
  className,
  style,
  ghost = false,
}: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const wished = has(item.key);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const added = toggle(item);
    if (added) toast.success("관심상품에 담았어요.", { emoji: "❤️" });
    else toast.info("관심상품에서 뺐어요.");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={wished}
      aria-label={wished ? "관심상품 해제" : "관심상품 담기"}
      className={`flex items-center justify-center transition-colors ${className ?? ""}`}
      style={{
        width: size + 16,
        height: size + 16,
        borderRadius: "50%",
        background: ghost ? "transparent" : "var(--bg-white)",
        border: ghost ? "none" : "1px solid var(--neutral-stone)",
        color: wished ? "#e05555" : "var(--neutral-stone)",
        cursor: "pointer",
        ...style,
      }}
    >
      <Heart size={size} fill={wished ? "currentColor" : "none"} />
    </button>
  );
}
