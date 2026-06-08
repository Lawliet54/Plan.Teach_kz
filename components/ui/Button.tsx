import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onClick" | "name" | "value" | "form"
>;

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--primary)] bg-[var(--primary)] text-white hover:border-[var(--primary-2)] hover:bg-[var(--primary-2)]",
  secondary:
    "border border-[var(--border-accent)] bg-[var(--purple-soft)] text-[var(--primary)] hover:bg-[#e9e6ff]",
  ghost:
    "border border-[var(--border)] bg-white text-[var(--text-soft)] hover:border-[var(--border-accent)] hover:bg-[var(--surface-muted)]",
  danger:
    "border border-[#facaca] bg-[var(--red-soft)] text-[var(--danger)] hover:bg-[#ffe7e9]",
  dark:
    "border border-[var(--navy)] bg-[var(--navy)] text-white hover:bg-[var(--navy-2)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 rounded-[var(--radius-sm)] px-2.5 text-xs",
  md: "h-9 rounded-[var(--radius-sm)] px-3 text-xs",
  lg: "h-10 rounded-[var(--radius-md)] px-4 text-sm",
};

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(101,86,229,.14)] disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
