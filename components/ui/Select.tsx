import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Select({
  label,
  error,
  hint,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-medium text-[var(--text-soft)]">
          {label}
        </span>
      ) : null}

      <select
        id={id}
        className={cn(
          "focus-ring h-9 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-3 text-sm font-normal text-[var(--text)] outline-none transition disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]",
          error && "border-[#fca5a5] focus:border-[var(--danger)]",
          className
        )}
        {...props}
      >
        {children}
      </select>

      {error ? (
        <span className="mt-1 block text-xs font-medium text-[var(--danger)]">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
