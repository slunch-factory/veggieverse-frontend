"use client";

interface BadgeProps {
  variant: "NEW" | "BEST" | "SOLD_OUT" | "SALE" | "LIMITED";
  children?: React.ReactNode;
  className?: string;
}

const variantMap: Record<BadgeProps["variant"], string> = {
  NEW:      "badge-new",
  BEST:     "badge-best",
  SOLD_OUT: "badge-sold",
  SALE:     "badge-sale",
  LIMITED:  "badge-limited",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  const label = children ?? (variant === "SOLD_OUT" ? "SOLD\nOUT" : variant);

  return (
    <span
      className={`badge ${variantMap[variant]} ${className}`}
      style={{ whiteSpace: "pre-line" }}
    >
      {label}
    </span>
  );
}
