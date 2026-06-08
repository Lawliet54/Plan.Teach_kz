import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function Textarea({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextareaProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-semibold text-[var(--text-soft)]">
          {label}
        </span>
      ) : null}

      <textarea
        id={id}
        className={cn(
          "min-h-24 w-full resize-y rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 py-2 text-sm leading-6 text-[var(--text)] outline-none transition placeholder:text-slate-400 focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(91,76,230,0.12)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]",
          error && "border-[#fca5a5] focus:border-[var(--danger)] focus:ring-[rgba(220,38,38,0.1)]",
          className
        )}
        {...props}
      />

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