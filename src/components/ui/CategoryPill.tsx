"use client";

interface CategoryPillProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export function CategoryPill({
  children,
  active = false,
  className = "",
  onClick,
}: CategoryPillProps) {
  return (
    <span
      className={`inline-block px-5 py-2.5 rounded-full text-[13px] cursor-pointer transition-all duration-150 ${
        active
          ? "bg-black text-white border border-transparent"
          : "bg-transparent text-black border border-[var(--gray-light)]"
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
