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
    <div className={`flex flex-col gap-1 ${className}`}>
      {originalPrice && originalPrice > price ? (
        <>
          <span className="line-through text-[14px] text-[#CCCCCC]">
            {originalPrice.toLocaleString()}원
          </span>
          <div className="flex items-center gap-2">
            {discountRate > 0 && (
              <span className="text-[16px] font-mono" style={{ color: "#87b5e1" }}>
                {discountRate}%
              </span>
            )}
            <span className="text-[18px] font-mono leading-[1.2] text-black">
              {price.toLocaleString()}원
            </span>
          </div>
        </>
      ) : (
        <span className="text-[18px] font-mono text-black">
          {price.toLocaleString()}원
        </span>
      )}
    </div>
  );
}
