import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  children: ReactNode;
  variant?: AlertVariant;
};

const variants: Record<AlertVariant, string> = {
  info: "border-[#bfdbfe] bg-[var(--blue-soft)] text-[#1d4ed8]",
  success: "border-[#bbf7d0] bg-[var(--green-soft)] text-[var(--success)]",
  warning: "border-[#fde68a] bg-[var(--yellow-soft)] text-[var(--warning)]",
  danger: "border-[#fecaca] bg-[var(--red-soft)] text-[var(--danger)]",
};

export function Alert({
  title,
  children,
  variant = "info",
  className,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border px-3 py-2.5 text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {title ? <p className="font-extrabold">{title}</p> : null}
      <div className={cn("leading-5", title && "mt-1")}>{children}</div>
    </div>
  );
}