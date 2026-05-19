import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Route,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getSectionsWithTopics, getTopics } from "@/lib/content";
import { cn } from "@/lib/utils";

type LearnPageProps = {
  searchParams?: Promise<{
    grade?: string;
  }>;
};

const grades = [7, 8, 9, 10, 11];

function getStatusLabel(status: string) {
  if (status === "ready") return "Дайын";
  if (status === "partial") return "Жартылай";
  return "Кейін толтырылады";
}

function getLevelLabel(level: string) {
  if (level === "advanced") return "Жоғары";
  if (level === "intermediate") return "Орта";
  return "Бастапқы";
}

function getStatusStyle(status: string) {
  if (status === "ready") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "partial") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-slate-50 text-slate-500 border-slate-200";
}

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
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

  const selectedGrade = Number(params?.grade || profile.current_grade || 7);
  const safeGrade = grades.includes(selectedGrade) ? selectedGrade : 7;

  const sections = await getSectionsWithTopics(safeGrade);
  const allGradeTopics = await getTopics(safeGrade);

  const readyCount = allGradeTopics.filter(
    (topic) => topic.content_status === "ready"
  ).length;

  const placeholderCount = allGradeTopics.filter(
    (topic) => topic.content_status === "placeholder"
  ).length;

  return (
    <AppShell profile={profile} active="/learn">
      <div className="mb-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="purple-gradient overflow-hidden rounded-[18px] p-5 text-white shadow-lg shadow-[#5b3ee4]/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                <Route className="h-3.5 w-3.5" />
                Оқу траекториясы
              </p>

              <h1 className="text-2xl font-black leading-tight">
                {safeGrade}-сынып физика тақырыптары
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">
                Тақырыптар КТЖ файлдарынан алынды. Қайталанатын сабақтар
                біріктірілді, ал “Қайталау” және ТЖБ сабақ ретінде енгізілмеді.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-4 sm:block">
              <BookOpen className="h-12 w-12 text-white/85" />
            </div>
          </div>
        </section>

        <section className="compact-card p-4">
          <h2 className="text-base font-black text-slate-950">
            Контент статусы
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xl font-black text-slate-950">
                {allGradeTopics.length}
              </p>
              <p className="text-xs text-slate-500">тақырып</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xl font-black text-emerald-700">
                {readyCount}
              </p>
              <p className="text-xs text-emerald-700">дайын</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xl font-black text-slate-700">
                {placeholderCount}
              </p>
              <p className="text-xs text-slate-500">placeholder</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {grades.map((grade) => (
              <Link
                key={grade}
                href={`/learn?grade=${grade}`}
                className={cn(
                  "inline-flex h-8 items-center rounded-xl border px-3 text-xs font-black transition",
                  safeGrade === grade
                    ? "border-[#5b3ee4] bg-[#5b3ee4] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#5b3ee4]/40"
                )}
              >
                {grade} сынып
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.id} className="compact-card p-4">
            <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-black text-slate-950">
                  {section.title}
                </h2>

                {section.description ? (
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {section.description}
                  </p>
                ) : null}
              </div>

              <span className="w-fit rounded-full bg-[#f0edff] px-3 py-1 text-xs font-black text-[#5b3ee4]">
                {section.topics.length} тақырып
              </span>
            </div>

            {section.topics.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm font-bold text-slate-600">
                  Бұл бөлімге тақырыптар кейін қосылады.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {section.topics.map((topic, index) => {
                  const isReady = topic.content_status === "ready";

                  return (
                    <Link
                      key={topic.id}
                      href={`/learn/${topic.slug}`}
                      className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-[#5b3ee4]/45 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0edff]">
                          {isReady ? (
                            <CheckCircle2 className="h-4 w-4 text-[#5b3ee4]" />
                          ) : (
                            <Lock className="h-4 w-4 text-slate-400" />
                          )}
                        </div>

                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-black",
                            getStatusStyle(topic.content_status)
                          )}
                        >
                          {getStatusLabel(topic.content_status)}
                        </span>
                      </div>

                      <p className="text-sm font-black leading-5 text-slate-950 group-hover:text-[#5b3ee4]">
                        {index + 1}. {topic.title}
                      </p>

                      {topic.description ? (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {topic.description}
                        </p>
                      ) : (
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Бұл тақырыптың теориясы мен тапсырмалары кейін
                          толықтырылады.
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                          {getLevelLabel(topic.level)}
                        </span>

                        {topic.has_bjb ? (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                            БЖБ бар
                          </span>
                        ) : null}

                        {topic.ktz_order ? (
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                            КТЖ #{topic.ktz_order}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-[#d7e3ff] bg-[#f0edff] p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#5b3ee4]" />
          <div>
            <p className="text-sm font-black text-slate-950">
              Келесі кезеңде жеке маршрут автоматты құрылады
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Қазір тақырыптар КТЖ бойынша көрсетіледі. Кейін диагностика
              нәтижесі, қызығушылық және деңгей бойынша оқушыға жеке ретпен
              ашылады.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
