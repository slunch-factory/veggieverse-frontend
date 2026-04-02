"use client";

interface OutlineTagProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function OutlineTag({ children, className = "", onClick }: OutlineTagProps) {
  return (
    <span
      className={`inline-block px-3.5 py-1.5 bg-transparent border border-black text-black text-[12px] rounded-[4px] cursor-pointer transition-all duration-150 hover:bg-[var(--primary-50)] hover:border-[var(--primary)] hover:text-[var(--primary-dark)] ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
