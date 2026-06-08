import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Eye,
  FlaskConical,
  Home,
  LayoutGrid,
  LineChart,
  LockKeyhole,
  PlayCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";

const teacherPages = [
  {
    title: "Мұғалімнің басты беті",
    route: "/teacher/dashboard",
    description:
      "Оқушылар саны, белсенділік, әлсіз дағдылар және тексеруді күтетін жұмыстар.",
    icon: Home,
  },
  {
    title: "Оқушылар тізімі",
    route: "/teacher/students",
    description:
      "Оқушылардың профильдері, диагностикасы, прогресі және жеке нәтижелері.",
    icon: UsersRound,
  },
  {
    title: "Жұмыстарды тексеру",
    route: "/teacher/submissions",
    description:
      "Қолмен тексеруді қажет ететін тапсырмаларға балл және пікір беру.",
    icon: ClipboardCheck,
  },
  {
    title: "Мұғалім аналитикасы",
    route: "/teacher/analytics",
    description:
      "Сыныптың skill mastery картасы, зертханалар және adaptive сигналдар.",
    icon: BarChart3,
  },
  {
    title: "БЖБ / ТЖБ басқару",
    route: "/teacher/controls",
    description:
      "Бақылау жұмыстары мен бағалау материалдарын басқаруға арналған бөлім.",
    icon: BookOpen,
  },
];

const studentPages = [
  {
    title: "Оқушының басты беті",
    route: "/dashboard",
    description:
      "Жеке оқу бағыты, прогресс, ұсыныстар және оқуды жалғастыру батырмасы.",
    icon: Home,
  },
  {
    title: "Оқу бағдарламасы",
    route: "/topics",
    description:
      "7–11 сынып тақырыптары, бөлімдер және деңгейге сәйкес оқу материалдары.",
    icon: BookOpen,
  },
  {
    title: "Тапсырмалар",
    route: "/tasks",
    description:
      "Adaptive тапсырмалар, кешенді жұмыстар және орындалу тарихы.",
    icon: ClipboardCheck,
  },
  {
    title: "Зертханалар",
    route: "/labs",
    description:
      "2D симуляциялар, өлшеу кестелері, графиктер және қорытынды сақтау.",
    icon: FlaskConical,
  },
  {
    title: "Видео сабақтар",
    route: "/videos",
    description:
      "Сыныптарға бөлінген видео сабақтар және custom video player.",
    icon: PlayCircle,
  },
  {
    title: "Нәтижелер",
    route: "/results",
    description:
      "Тапсырма нәтижелері, зертханалар және соңғы оқу әрекеттері.",
    icon: LineChart,
  },
  {
    title: "Оқушы аналитикасы",
    route: "/analytics",
    description:
      "Жеке skill mastery, әлсіз бағыттар және қайталау кезегі.",
    icon: BarChart3,
  },
  {
    title: "AI көмекші",
    route: "/ai",
    description:
      "Оқушы контекстіне бейімделген физика бойынша AI чат.",
    icon: Sparkles,
  },
  {
    title: "Жеке кабинет",
    route: "/profile",
    description:
      "Профиль, рөл, деңгей және негізгі аккаунт деректері.",
    icon: Settings,
  },
];

export default async function AdminPagesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return (
    <AppShell profile={profile} active="/admin/pages">
      <div className="page-stack">
        <section className="relative overflow-hidden rounded-[9px] border border-white/10 bg-[var(--navy)] p-4 text-white shadow-[0_16px_40px_rgba(7,21,34,.18)] sm:p-5">
          <div className="absolute inset-0 physics-grid opacity-20" />
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#6556e5]/35 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#a9a1ff]">
              <LayoutGrid className="h-3.5 w-3.5" />
              Admin navigation center
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-[-.035em]">
              Платформа беттерінің толық картасы
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/62">
              Әкімші панелінде мұғалім және оқушы интерфейстерінің барлық
              негізгі беттері көрсетіледі. Мұғалім беттері тікелей ашылады.
              Оқушы беттері келесі кезеңде таңдалған оқушы контекстінде
              read-only preview режимінде ашылады.
            </p>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="data-label text-[var(--primary)]">Мұғалім интерфейсі</p>
              <h2 className="mt-1 text-lg font-black text-[var(--text)]">
                Мұғалім беттері
              </h2>
            </div>

            <Badge variant="success">Admin үшін қолжетімді</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {teacherPages.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.route} href={item.route} className="group">
                  <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-accent)] group-hover:shadow-[var(--shadow-sm)]">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--purple-soft)] text-[var(--primary)]">
                        <Icon className="h-5 w-5" />
                      </span>

                      <ArrowRight className="h-4 w-4 text-[var(--text-muted)] transition group-hover:text-[var(--primary)]" />
                    </div>

                    <CardTitle className="mt-3">{item.title}</CardTitle>

                    <CardText className="mt-1 text-xs">
                      {item.description}
                    </CardText>

                    <p className="mt-3 text-[11px] font-extrabold text-[var(--primary)]">
                      {item.route}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="student-pages">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="data-label text-[var(--primary)]">Оқушы интерфейсі</p>
              <h2 className="mt-1 text-lg font-black text-[var(--text)]">
                Оқушы беттері
              </h2>
            </div>

            <Badge variant="warning">Read-only preview дайындалады</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {studentPages.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.route} className="h-full">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--blue-soft)] text-[var(--blue)]">
                      <Icon className="h-5 w-5" />
                    </span>

                    <LockKeyhole className="h-4 w-4 text-[var(--warning)]" />
                  </div>

                  <CardTitle className="mt-3">{item.title}</CardTitle>

                  <CardText className="mt-1 text-xs">
                    {item.description}
                  </CardText>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-extrabold text-[var(--text-muted)]">
                      {item.route}
                    </p>

                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[var(--warning)]">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
