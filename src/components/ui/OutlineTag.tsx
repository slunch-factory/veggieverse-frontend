"use client";

interface OutlineTagProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function OutlineTag({ children, className = "", onClick }: OutlineTagProps) {
  return (
    <span className={`tag ${className}`} onClick={onClick}>
      {children}
    </span>
  );
}
