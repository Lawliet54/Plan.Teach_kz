import Link from "next/link";
import { Atom, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function PublicHeader() {
  return <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/92 backdrop-blur-xl">
    <div className="compact-container flex h-14 items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[4px] border border-[var(--border-accent)] bg-[var(--purple-soft)] text-[var(--primary)]"><Atom className="h-4.5 w-4.5" /></span>
        <span><span className="block text-sm font-black tracking-[-.02em] text-[var(--text)]">Plan.Teach_kz</span><span className="block text-[9px] font-black uppercase tracking-[.14em] text-[var(--text-muted)]">Adaptive Physics System</span></span>
      </Link>
      <nav className="hidden items-center gap-5 text-xs font-extrabold text-[var(--text-soft)] md:flex"><a href="#platform">Платформа</a><a href="#grades">Сыныптар</a><a href="#workflow">Оқу логикасы</a></nav>
      <div className="flex items-center gap-2"><Button href="/login" variant="ghost" size="sm">Кіру</Button><Button href="/register" size="sm" className="hidden sm:inline-flex">Бастау <ArrowRight className="h-3.5 w-3.5" /></Button></div>
    </div>
  </header>;
}
