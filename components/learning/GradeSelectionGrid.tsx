import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import { grades, getTopicsByGrade, type Grade } from "@/data/physicsTopics";

const gradeInfo: Record<
  Grade,
  {
    title: string;
    subtitle: string;
    description: string;
    accent: string;
  }
> = {
  7: {
    title: "7-сынып",
    subtitle: "Физикаға кіріспе",
    description: "Өлшеу, тығыздық, жылдамдық, күш және қысым.",
    accent: "from-violet-500 to-blue-500",
  },
  8: {
    title: "8-сынып",
    subtitle: "Жылу және электр",
    description: "Жылу құбылыстары, электр тогы, Ом заңы және тізбектер.",
    accent: "from-blue-500 to-cyan-500",
  },
  9: {
    title: "9-сынып",
    subtitle: "Динамика және өрістер",
    description: "Ньютон заңдары, энергия, импульс, электр және магнит өрісі.",
    accent: "from-indigo-500 to-violet-500",
  },
  10: {
    title: "10-сынып",
    subtitle: "Тереңдетілген физика",
    description: "Кинематика, динамика, молекулалық физика және ток заңдары.",
    accent: "from-purple-500 to-fuchsia-500",
  },
  11: {
    title: "11-сынып",
    subtitle: "Қазіргі физика",
    description: "Индукция, айнымалы ток, оптика, фотоэффект және ядролық физика.",
    accent: "from-sky-500 to-indigo-500",
  },
};

type GradeSelectionGridProps = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function GradeSelectionGrid({
  title = "Сыныпты таңдаңыз",
  description = "Қай сыныпты таңдасаңыз, сол сыныптың физика тақырыптары ашылады.",
  compact = false,
}: GradeSelectionGridProps) {
  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
            <GraduationCap className="h-4 w-4" />
          </div>

          <div>
            <h1 className="text-lg font-black text-slate-950">{title}</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        <div className="w-fit rounded-full border border-[#ddd6ff] bg-[#f1efff] px-3 py-1 text-xs font-bold text-[#5b4ce6]">
          25 тақырып
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {grades.map((grade) => {
          const info = gradeInfo[grade];
          const topicCount = getTopicsByGrade(grade).length;

          return (
            <Link
              key={grade}
              href={`/topics/${grade}`}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#cfc6ff] hover:bg-white hover:shadow-sm"
            >
              <div
                className={`mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r ${info.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-950">
                    {info.title}
                  </h2>

                  <p className="mt-1 text-xs font-bold text-[#5b4ce6]">
                    {info.subtitle}
                  </p>
                </div>

                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm transition group-hover:text-[#5b4ce6]">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <p
                className={`mt-3 text-sm font-semibold leading-6 text-slate-700 ${
                  compact ? "min-h-[48px]" : "min-h-[58px]"
                }`}
              >
                {info.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {topicCount} тақырып
                </span>

                <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-bold text-[#5b4ce6]">
                  Деңгей adaptive
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}