"use client";

import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "dark" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "lg",
  href,
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `btn btn-${size} btn-${variant}${disabled ? " opacity-[0.32] pointer-events-none cursor-not-allowed" : ""} ${className}`.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
