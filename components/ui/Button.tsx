import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#5b3ee4] text-white hover:bg-[#4e32cf] border border-[#5b3ee4]",
  secondary:
    "bg-[#f0edff] text-[#5b3ee4] hover:bg-[#e7e1ff] border border-[#ddd6ff]",
  ghost:
    "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200",
  danger:
    "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",
  dark:
    "bg-[#07182c] text-white hover:bg-[#0b2038] border border-[#07182c]",
};

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  className,
  disabled,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}