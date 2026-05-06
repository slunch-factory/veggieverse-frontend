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
      className={`tag${active ? " is-selected" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
