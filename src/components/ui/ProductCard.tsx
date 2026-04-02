"use client";

import Link from "next/link";
import { Badge } from "./Badge";

interface ProductCardProps {
  id: number;
  title: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  badge?: "NEW" | "BEST" | "SOLD_OUT";
  href?: string;
  onClick?: () => void;
}

export function ProductCard({
  title,
  description,
  price,
  originalPrice,
  image,
  badge,
  href,
  onClick,
}: ProductCardProps) {
  const cardContent = (
    <div
      className="bg-[var(--cream)] border border-black rounded-lg cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
      onClick={onClick}
    >
      {image && (
        <div className="relative w-full aspect-square overflow-hidden mb-[13px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
          {badge && (
            <div className="absolute top-2 left-2">
              <Badge variant={badge} />
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        <h3 className="text-[16px] leading-tight text-black mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-[var(--gray)] leading-relaxed mb-[13px]">{description}</p>
        )}
        {price !== undefined && (
          <div className="flex items-baseline gap-2">
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-[var(--gray-light)] line-through">
                {originalPrice.toLocaleString()}원
              </span>
            )}
            <span className="text-[15px] font-mono text-black">
              {price.toLocaleString()}원
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
