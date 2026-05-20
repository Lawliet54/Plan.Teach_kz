import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h2
      className={cn(
        "text-[15px] font-black leading-tight text-slate-950 sm:text-base",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardText({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p
      className={cn(
        "text-sm font-semibold leading-6 text-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}