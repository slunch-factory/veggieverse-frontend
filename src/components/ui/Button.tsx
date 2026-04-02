"use client";

import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-[var(--primary)] text-white border-none rounded-md hover:bg-[var(--primary-dark)]",
  secondary:
    "bg-transparent text-black border border-black rounded-md hover:bg-black hover:text-white",
  ghost:
    "bg-transparent text-[var(--warm-gray)] border-none hover:text-[var(--primary)] hover:underline hover:underline-offset-4",
};

const sizeClasses: Record<string, string> = {
  sm: "px-4 py-2 text-[12px]",
  md: "px-6 py-3 text-[13px]",
  lg: "px-8 py-4 text-sm",
  xl: "px-12 py-5 text-base",
};

export function Button({
  variant = "primary",
  size = "lg",
  href,
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base = variant === "ghost" ? "px-0 py-2" : sizeClasses[size];
  const classes = `inline-flex items-center justify-center transition-all duration-200 cursor-pointer ${base} ${variantClasses[variant]} ${
    disabled ? "!bg-[var(--gray-lighter)] !text-[var(--warm-gray)] !border-none cursor-not-allowed" : ""
  } ${className}`;

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
