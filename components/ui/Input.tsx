import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-medium text-slate-700">
          {label}
        </span>
      ) : null}

      <input
        id={id}
        className={cn(
          "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#4f31d4] focus:ring-4 focus:ring-[#4f31d4]/10",
          className
        )}
        {...props}
      />
    </label>
  );
}