"use client";

interface BadgeProps {
  variant: "NEW" | "BEST" | "SOLD_OUT";
  children?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeProps["variant"], string> = {
  NEW: "bg-[#87b5e1] text-white",
  BEST: "bg-[var(--primary)] text-white",
  SOLD_OUT: "bg-[var(--muted)] text-white",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  const label = children || (variant === "SOLD_OUT" ? "SOLD\nOUT" : variant);

  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 text-[9px] tracking-[0.02em] leading-[1.1] text-center whitespace-pre-line rounded-full ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
}
