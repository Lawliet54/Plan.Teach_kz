import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-xs)] sm:p-4", className)} {...props} />;
}
export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between", className)} {...props} />;
}
export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return <h2 className={cn("text-[15px] font-black leading-tight tracking-[-0.012em] text-[var(--text)] sm:text-base", className)} {...props}>{children}</h2>;
}
export function CardText({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return <p className={cn("text-sm font-medium leading-6 text-[var(--text-muted)]", className)} {...props}>{children}</p>;
}
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--border-soft)] pt-3", className)} {...props} />;
}
