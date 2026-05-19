import Link from "next/link";
import { Atom, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <div className="compact-container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#07182c]">
            <Atom className="h-4 w-4 text-white" />
          </span>

          <span className="text-sm font-black tracking-tight text-slate-950 sm:text-base">
            Plan.Teach_kz
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-xs font-semibold text-slate-600 md:flex">
          <a href="#features" className="hover:text-[#5b3ee4]">
            Мүмкіндіктер
          </a>
          <a href="#roles" className="hover:text-[#5b3ee4]">
            Рөлдер
          </a>
          <a href="#ai" className="hover:text-[#5b3ee4]">
            AI Tutor
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button href="/login" variant="ghost" className="hidden sm:inline-flex">
            Кіру
          </Button>

          <Button href="/register" className="gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            Бастау
          </Button>
        </div>
      </div>

      <div className="h-1 w-full bg-gradient-to-r from-[#5b3ee4] via-[#6048f2] to-[#6c4cf6]" />
    </header>
  );
}
