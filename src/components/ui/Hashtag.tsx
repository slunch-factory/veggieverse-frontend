"use client";

interface HashtagProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Hashtag({ children, className = "", onClick }: HashtagProps) {
  return (
    <span className={`tag is-selected ${className}`} onClick={onClick}>
      {children}
    </span>
  );
}
