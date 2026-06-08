import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  LayoutGrid,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return (
    <AppShell profile={profile} active="/admin/dashboard">
      <div className="page-stack">
        <section className="relative overflow-hidden rounded-[9px] border border-white/10 bg-[var(--navy)] p-4 text-white shadow-[0_16px_40px_rgba(7,21,34,.18)] sm:p-5">
          <div className="absolute inset-0 physics-grid opacity-20" />
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#6556e5]/35 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#a9a1ff]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin command center
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-[-.035em]">
              Жүйені басқару орталығы
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
              Мұғалім және оқушы интерфейстерін бір жерден бақылаңыз.
              Контентті, рөлдерді және негізгі платформалық бөлімдерді
              кезең-кезеңімен басқарыңыз.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button href="/admin/pages">
                <LayoutGrid className="h-4 w-4" />
                Барлық беттерді ашу
              </Button>

              <Button
                href="/teacher/dashboard"
                variant="ghost"
                className="border-white/15 bg-white/8 text-white hover:bg-white/14"
              >
                <UsersRound className="h-4 w-4" />
                Мұғалім көрінісі
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Link href="/admin/pages" className="group">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-accent)] group-hover:shadow-[var(--shadow-sm)]">
              <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--purple-soft)] text-[var(--primary)]">
                <LayoutGrid className="h-5 w-5" />
              </span>

              <CardTitle className="mt-3">Барлық беттер</CardTitle>

              <CardText className="mt-1">
                Мұғалім және оқушы интерфейстерінің толық каталогын ашыңыз.
              </CardText>

              <p className="mt-3 flex items-center gap-1 text-xs font-extrabold text-[var(--primary)]">
                Каталогты ашу
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Card>
          </Link>

          <Link href="/teacher/dashboard" className="group">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-accent)] group-hover:shadow-[var(--shadow-sm)]">
              <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--blue-soft)] text-[var(--blue)]">
                <UsersRound className="h-5 w-5" />
              </span>

              <CardTitle className="mt-3">Мұғалім панелі</CardTitle>

              <CardText className="mt-1">
                Мұғалім интерфейсінің dashboard және бақылау беттерін ашыңыз.
              </CardText>

              <p className="mt-3 flex items-center gap-1 text-xs font-extrabold text-[var(--primary)]">
                Мұғалім көрінісі
                <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </Card>
          </Link>

          <Card className="h-full">
            <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--yellow-soft)] text-[var(--warning)]">
              <BookOpen className="h-5 w-5" />
            </span>

            <div className="mt-3 flex items-center gap-2">
              <CardTitle>Оқушы preview</CardTitle>
              <Badge variant="warning">Келесі кезең</Badge>
            </div>

            <CardText className="mt-1">
              Таңдалған оқушы контекстінде интерфейсті read-only режимінде
              көру жүйесі қосылады.
            </CardText>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
