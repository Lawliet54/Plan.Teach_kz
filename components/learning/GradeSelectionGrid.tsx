import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpenCheck,
  Calculator,
  ClipboardCheck,
  FlaskConical,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

import {
  grades,
  getTopicsByGrade,
  type Grade,
} from "@/data/physicsTopics";

type GradeSelectionGridProps = {
  selectedGrade?: Grade;
  title?: string;
  description?: string;
  compact?: boolean;
};

type GradeCardInfo = {
  title: string;
  description: string;
  status: string;
  icon: LucideIcon;
  cardClassName: string;
  badgeClassName: string;
  iconClassName: string;
  buttonClassName: string;
};

const gradeInfo: Record<Grade, GradeCardInfo> = {
  7: {
    title: "Физикаға кіріспе және негізгі ұғымдар",
    description:
      "Өлшеу, тығыздық, қозғалыс, күш және қысым тақырыптарын меңгеріңіз.",
    status: "Бастапқы бағыт",
    icon: Atom,
    cardClassName:
      "border-violet-200 bg-[linear-gradient(135deg,#ffffff_0%,#faf8ff_100%)]",
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700",
    iconClassName: "bg-violet-100 text-violet-700",
    buttonClassName:
      "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
  },
  8: {
    title: "Жылу құбылыстары және электр",
    description:
      "Жылу, электр тогы, Ом заңы және электр тізбектерімен танысыңыз.",
    status: "Қолжетімді",
    icon: Lightbulb,
    cardClassName:
      "border-cyan-200 bg-[linear-gradient(135deg,#ffffff_0%,#f4fdff_100%)]",
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-700",
    iconClassName: "bg-cyan-100 text-cyan-700",
    buttonClassName:
      "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
  },
  9: {
    title: "Динамика және физикалық өрістер",
    description:
      "Ньютон заңдары, энергия, импульс, электр және магнит өрістерін зерттеңіз.",
    status: "Қолжетімді",
    icon: FlaskConical,
    cardClassName:
      "border-indigo-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7f8ff_100%)]",
    badgeClassName: "border-indigo-200 bg-indigo-50 text-indigo-700",
    iconClassName: "bg-indigo-100 text-indigo-700",
    buttonClassName:
      "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
  },
  10: {
    title: "Тереңдетілген физика",
    description:
      "Кинематика, динамика, молекулалық физика және ток заңдарын тереңдетіп оқыңыз.",
    status: "Қолжетімді",
    icon: Calculator,
    cardClassName:
      "border-fuchsia-200 bg-[linear-gradient(135deg,#ffffff_0%,#fff8ff_100%)]",
    badgeClassName: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
    iconClassName: "bg-fuchsia-100 text-fuchsia-700",
    buttonClassName:
      "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100",
  },
  11: {
    title: "Қазіргі физика",
    description:
      "Индукция, айнымалы ток, оптика, фотоэффект және ядролық физиканы қарастырыңыз.",
    status: "Қолжетімді",
    icon: ClipboardCheck,
    cardClassName:
      "border-sky-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fcff_100%)]",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700",
    iconClassName: "bg-sky-100 text-sky-700",
    buttonClassName:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
  },
};

export function GradeSelectionGrid({
  selectedGrade = 7,
  title = "Сыныпты таңдаңыз",
  description = "Әр сынып ішінде физика тақырыптары бөлімдерге бөлініп көрсетіледі.",
  compact = false,
}: GradeSelectionGridProps) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-3 shadow-[var(--shadow-xs)] sm:p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--purple-soft)] text-[var(--primary)]">
          <BookOpenCheck className="h-4 w-4" />
        </span>

        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--primary)]">
            Сыныптар
          </p>

          <h2 className="mt-0.5 text-base font-black text-[var(--text)] sm:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {grades.map((grade) => {
          const info = gradeInfo[grade];
          const Icon = info.icon;
          const topicCount = getTopicsByGrade(grade).length;
          const isSelected = grade === selectedGrade;

          return (
            <article
              key={grade}
              className={`flex flex-col rounded-[18px] border p-4 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] ${
                compact ? "min-h-[220px]" : "min-h-[252px]"
              } ${info.cardClassName}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[11px] font-bold ${
                    isSelected
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : info.badgeClassName
                  }`}
                >
                  {isSelected ? "Таңдалған" : info.status}
                </span>

                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-[14px] ${info.iconClassName}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-black text-[var(--text)]">
                  {grade}-сынып
                </h3>

                <p className="mt-1 text-sm font-bold leading-5 text-[var(--text-soft)]">
                  {info.title}
                </p>

                <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                  {info.description}
                </p>
              </div>

              <div className="mt-auto pt-4">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11px] font-bold text-[var(--text-soft)]">
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    {topicCount} тақырып
                  </span>
                </div>

                <Link
                  href={`/topics/${grade}`}
                  className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-xs font-bold transition ${info.buttonClassName}`}
                >
                  Тақырыптарды көру
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}