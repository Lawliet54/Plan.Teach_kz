import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-44 flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-white px-4 py-6 text-center",
        className
      )}
    >
      {icon ? (
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--purple-soft)] text-[var(--primary)]">
          {icon}
        </div>
      ) : null}

      <h2 className="text-sm font-extrabold text-[var(--text)]">{title}</h2>

      {description ? (
        <p className="mt-1 max-w-md text-xs leading-5 text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}

      {actionLabel && actionHref ? (
        <Button href={actionHref} size="sm" className="mt-3">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}