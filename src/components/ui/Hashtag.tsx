"use client";

interface HashtagProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Hashtag({ children, className = "", onClick }: HashtagProps) {
  return (
    <span
      className={`px-[18px] py-2.5 bg-black text-white text-[13px] rounded-[4px] cursor-pointer transition-all duration-150 hover:bg-[var(--primary)] ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
