import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Beaker,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  FlaskConical,
  Layers3,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getStudentPackAttempts,
  getTaskPacks,
  type TaskPack,
} from "@/lib/taskPacks";

type Props = {
  searchParams: Promise<{
    grade?: string;
  }>;
};

const grades = [7, 8, 9, 10, 11];

function parseGrade(value?: string) {
  const number = Number(value);

  return grades.includes(number) ? number : 7;
}

function getDifficultyMeta(difficulty: TaskPack["difficulty"]) {
  if (difficulty === "advanced") {
    return {
      label: "Күрделі",
      badgeVariant: "warning" as const,
      iconClass: "bg-[var(--yellow-soft)] text-[var(--warning)]",
      borderClass: "hover:border-[#e9c878]",
      accentClass: "bg-[var(--warning)]",
    };
  }

  if (difficulty === "basic") {
    return {
      label: "Базалық",
      badgeVariant: "success" as const,
      iconClass: "bg-[var(--green-soft)] text-[var(--success)]",
      borderClass: "hover:border-[#a9dec1]",
      accentClass: "bg-[var(--success)]",
    };
  }

  return {
    label: "Орта деңгей",
    badgeVariant: "primary" as const,
    iconClass: "bg-[var(--purple-soft)] text-[var(--primary)]",
    borderClass: "hover:border-[var(--border-accent)]",
    accentClass: "bg-[var(--primary)]",
  };
}

export default async function TasksPage({ searchParams }: Props) {
  const query = await searchParams;
  const selectedGrade = parseGrade(query.grade);

  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  if (!profile.teacher_id) {
    redirect("/onboarding/teacher-select");
  }

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding/interests");
  }

  const [packs, attempts] = await Promise.all([
    getTaskPacks(selectedGrade),
    getStudentPackAttempts(profile.id),
  ]);

  const completedItemIds = new Set(
    attempts.map((attempt) => attempt.item_id)
  );

  const completedPackIds = new Set(
    attempts.map((attempt) => attempt.pack_id)
  );

  const firstPackHref = packs[0]
    ? `/tasks/packs/${packs[0].slug}`
    : `/topics/${selectedGrade}`;

  const stats = [
    {
      icon: Layers3,
      label: "Кешенді жұмыс",
      value: packs.length,
      description: "Толық оқу циклі",
      iconClass: "bg-[var(--purple-soft)] text-[var(--primary)]",
    },
    {
      icon: ClipboardCheck,
      label: "Тест сұрағы",
      value: packs.length * 10,
      description: "Ұғым мен формула",
      iconClass: "bg-[var(--blue-soft)] text-[var(--blue)]",
    },
    {
      icon: Calculator,
      label: "Есеп шығару",
      value: packs.length * 5,
      description: "SI және есептеу",
      iconClass: "bg-[var(--yellow-soft)] text-[var(--warning)]",
    },
    {
      icon: FlaskConical,
      label: "Зертхана",
      value: packs.length,
      description: "Өлшеу мен қорытынды",
      iconClass: "bg-[var(--cyan-soft)] text-[var(--cyan)]",
    },
  ];

  return (
    <AppShell profile={profile} active="/tasks">
      <div className="page-stack">
        <PageHeader
          eyebrow="Жеке оқу тапсырмалары"
          title="Физика тапсырмалары"
          description="Сыныпты таңдаңыз. Әр кешеннің ішінде тест, есеп және зертханалық жұмыс бір оқу циклі ретінде беріледі."
          actions={
            <Button
              href="/topics"
              variant="secondary"
              size="sm"
            >
              <BookOpenCheck className="h-4 w-4" />
              Оқу бағдарламасы
            </Button>
          }
        />

        <section className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[linear-gradient(118deg,#5142cf_0%,#4043c7_48%,#282666_100%)] p-4 text-white shadow-[0_16px_36px_rgba(45,38,131,.18)] sm:p-5">
          <div className="absolute inset-0 physics-grid opacity-20" />
          <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-cyan-300/16 blur-3xl" />
          <div className="absolute right-48 top-4 h-28 w-28 rounded-full bg-indigo-200/14 blur-2xl" />

          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-white/16 bg-white/10 text-cyan-100">
                <Sparkles className="h-5 w-5" />
              </span>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/65">
                  Adaptive task system
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-.025em] text-white">
                  Жай тест емес — толық оқу циклі
                </h2>

                <p className="mt-2 max-w-3xl text-sm font-normal leading-6 text-white/72">
                  Тест негізгі ұғымды тексереді, есеп формуланы қолдануға
                  үйретеді, ал зертхана өлшеу, график және қорытынды жасау
                  дағдыларын дамытады.
                </p>
              </div>
            </div>

            <Link
              href={firstPackHref}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-white px-4 text-xs font-semibold text-[#5142cf] shadow-[0_10px_22px_rgba(18,19,71,.16)] transition hover:-translate-y-0.5 hover:bg-[#f8f7ff]"
            >
              Бірінші жұмысты ашу
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <Card className="p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-[var(--purple-soft)] text-[var(--primary)]">
                <Filter className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  Сыныпты таңдаңыз
                </p>

                <p className="mt-0.5 text-[11px] font-normal text-[var(--text-muted)]">
                  Қажетті сыныптың тапсырмаларын ашыңыз
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {grades.map((grade) => {
                const isSelected = grade === selectedGrade;

                return (
                  <Link
                    key={grade}
                    href={`/tasks?grade=${grade}`}
                    className={`inline-flex h-8 items-center rounded-[var(--radius-sm)] border px-3 text-xs font-semibold transition ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-[0_6px_14px_rgba(101,86,229,.2)]"
                        : "border-[var(--border)] bg-white text-[var(--text-soft)] hover:border-[var(--border-accent)] hover:bg-[var(--purple-soft-2)]"
                    }`}
                  >
                    {grade}-сынып
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className="relative overflow-hidden p-3 transition hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] ${stat.iconClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="text-2xl font-semibold tracking-[-.04em] text-[var(--text)]">
                    {stat.value}
                  </span>
                </div>

                <p className="mt-3 text-xs font-semibold text-[var(--text)]">
                  {stat.label}
                </p>

                <p className="mt-1 text-[11px] font-normal text-[var(--text-muted)]">
                  {stat.description}
                </p>
              </Card>
            );
          })}
        </section>

        <section>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="data-label text-[var(--primary)]">
                {selectedGrade}-сынып
              </p>

              <h2 className="mt-1 text-lg font-semibold tracking-[-.018em] text-[var(--text)]">
                Кешенді жұмыстар
              </h2>

              <p className="mt-1 text-xs font-normal leading-5 text-[var(--text-muted)]">
                Әр жұмыста 16 тапсырма бар: 10 тест, 5 есеп және 1 зертхана.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              {completedPackIds.size} жұмыс басталды
            </div>
          </div>

          {packs.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {packs.map((pack) => {
                const packAttempts = attempts.filter(
                  (attempt) => attempt.pack_id === pack.id
                );

                const completed = Math.min(
                  16,
                  new Set(
                    packAttempts.map((attempt) => attempt.item_id)
                  ).size
                );

                const progress = Math.round((completed / 16) * 100);
                const difficulty = getDifficultyMeta(pack.difficulty);

                return (
                  <Link
                    key={pack.slug}
                    href={`/tasks/packs/${pack.slug}`}
                    className="group"
                  >
                    <article
                      className={`relative h-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-xs)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-hover)] ${difficulty.borderClass}`}
                    >
                      <span
                        className={`absolute inset-y-0 left-0 w-1 ${difficulty.accentClass}`}
                      />

                      <div className="flex items-start justify-between gap-3 pl-1">
                        <div className="min-w-0">
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant={difficulty.badgeVariant}>
                              {difficulty.label}
                            </Badge>

                            <Badge>
                              <Timer className="mr-1 h-3 w-3" />
                              {pack.estimated_minutes} мин
                            </Badge>

                            <Badge variant="cyan">
                              {pack.source === "database"
                                ? "Қолжетімді"
                                : "Алдын ала көру"}
                            </Badge>
                          </div>

                          <h3 className="mt-3 text-[15px] font-semibold leading-6 tracking-[-.012em] text-[var(--text)] transition group-hover:text-[var(--primary)]">
                            {pack.order_index}. {pack.title}
                          </h3>

                          {pack.formula ? (
                            <p className="mt-1.5 inline-flex rounded-[var(--radius-xs)] bg-[var(--purple-soft)] px-2 py-1 text-xs font-semibold text-[var(--primary)]">
                              {pack.formula}
                            </p>
                          ) : null}
                        </div>

                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] ${difficulty.iconClass}`}
                        >
                          <Beaker className="h-5 w-5" />
                        </span>
                      </div>

                      <p className="mt-3 pl-1 text-sm font-normal leading-6 text-[var(--text-muted)]">
                        {pack.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5 pl-1">
                        <span className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-medium text-[var(--text-soft)]">
                          <ClipboardCheck className="h-3 w-3 text-[var(--primary)]" />
                          10 тест
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-medium text-[var(--text-soft)]">
                          <Calculator className="h-3 w-3 text-[var(--warning)]" />
                          5 есеп
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[11px] font-medium text-[var(--text-soft)]">
                          <FlaskConical className="h-3 w-3 text-[var(--cyan)]" />
                          1 зертхана
                        </span>
                      </div>

                      <div className="mt-4 border-t border-[var(--border-soft)] pt-3 pl-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">
                              Орындалуы
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-[var(--text)]">
                              {completed}/16 тапсырма
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-[var(--primary)]">
                            {progress}%
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),#7d70f2)] transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-[11px] font-normal text-[var(--text-muted)]">
                            Жұмысты кезең-кезеңімен орындаңыз
                          </span>

                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                            Жұмысты ашу
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed py-8 text-center">
              <Target className="mx-auto h-8 w-8 text-[var(--primary)]" />

              <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                Бұл сыныпқа арналған тапсырмалар әлі қосылмаған
              </p>

              <p className="mt-1 text-xs font-normal text-[var(--text-muted)]">
                Басқа сыныпты таңдаңыз немесе оқу бағдарламасына өтіңіз.
              </p>
            </Card>
          )}
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <Card className="bg-[linear-gradient(135deg,#fbfbff_0%,#f6f4ff_100%)]">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--purple-soft)] text-[var(--primary)]">
                <TrendingUp className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  Жеке прогресс
                </p>

                <p className="mt-1 text-xs font-normal leading-5 text-[var(--text-muted)]">
                  Қазірге дейін {completedItemIds.size} тапсырма орындалды.
                  Әр жауаптан кейін жүйе келесі тапсырманың деңгейін бейімдейді.
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-[linear-gradient(135deg,#fbfeff_0%,#f3fcff_100%)]">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--cyan-soft)] text-[var(--cyan)]">
                <FlaskConical className="h-4 w-4" />
              </span>

              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  Виртуалды зертханалар
                </p>

                <p className="mt-1 text-xs font-normal leading-5 text-[var(--text-muted)]">
                  Параметрлерді өзгертіңіз, өлшеулер жасаңыз және қорытындыны
                  тәжірибе арқылы бекітіңіз.
                </p>

                <Button
                  href="/labs"
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                >
                  Зертханаларға өту
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
