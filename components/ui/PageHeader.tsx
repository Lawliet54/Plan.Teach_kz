import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--primary)]">
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-1 text-xl font-semibold tracking-[-.02em] text-[var(--text)] sm:text-2xl">
          {title}
        </h1>

        {description ? (
          <p className="mt-1 max-w-3xl text-sm font-normal leading-6 text-[var(--text-muted)]">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
