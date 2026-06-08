import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "dark"
  | "cyan";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  default:
    "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-soft)]",
  neutral:
    "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-soft)]",
  primary:
    "border-[var(--border-accent)] bg-[var(--purple-soft)] text-[var(--primary)]",
  success:
    "border-[#bcebd3] bg-[var(--green-soft)] text-[var(--success)]",
  warning:
    "border-[#f6daa0] bg-[var(--yellow-soft)] text-[var(--warning)]",
  danger:
    "border-[#facaca] bg-[var(--red-soft)] text-[var(--danger)]",
  dark:
    "border-[var(--navy)] bg-[var(--navy)] text-white",
  cyan:
    "border-[#bdebf3] bg-[var(--cyan-soft)] text-[#087e93]",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-xs)] border px-2 py-0.5 text-[11px] font-semibold leading-4",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
