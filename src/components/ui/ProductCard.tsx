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
  soldOut?: boolean;
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
  soldOut = false,
  href,
  onClick,
}: ProductCardProps) {
  const hasDiscount = originalPrice !== undefined && price !== undefined && originalPrice > price;
  const discountRate = hasDiscount
    ? Math.round(((originalPrice - price!) / originalPrice) * 100)
    : 0;

  const cardContent = (
    <div className={`card${soldOut ? " is-soldout" : ""}`} onClick={onClick}>
      <div className="card-img" style={{ aspectRatio: "1 / 1" }}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {badge && (
          <div className="card-badges">
            <Badge variant={badge} />
          </div>
        )}
      </div>
      <div className="card-body">
        <p className="card-name">{title}</p>
        {description && <p className="card-desc">{description}</p>}
        {price !== undefined && (
          <>
            {hasDiscount && (
              <p className="card-orig">{originalPrice!.toLocaleString()}원</p>
            )}
            <div className="card-price-row">
              {discountRate > 0 && (
                <span className="card-discount">{discountRate}%</span>
              )}
              <span className="card-price">{price.toLocaleString()}원</span>
            </div>
          </>
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
