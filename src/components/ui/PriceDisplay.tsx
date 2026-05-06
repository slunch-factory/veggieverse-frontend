interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
}

export function PriceDisplay({ price, originalPrice, className = "" }: PriceDisplayProps) {
  const discountRate =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  return (
    <div className={className}>
      {originalPrice && originalPrice > price ? (
        <>
          <p className="card-orig">{originalPrice.toLocaleString()}원</p>
          <div className="card-price-row">
            {discountRate > 0 && (
              <span className="card-discount">{discountRate}%</span>
            )}
            <span className="card-price">{price.toLocaleString()}원</span>
          </div>
        </>
      ) : (
        <span className="card-price">{price.toLocaleString()}원</span>
      )}
    </div>
  );
}
