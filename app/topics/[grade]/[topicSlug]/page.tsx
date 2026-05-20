import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getTopicBySlug,
  isValidGrade,
  levelLabels,
  type Grade,
  type TopicLevel,
} from "@/data/physicsTopics";
import { LearningAccessGuard } from "@/components/learning/LearningAccessGuard";
import { TopicAiAskBox } from "@/components/learning/TopicAiAskBox";
import { TopicContentSection } from "@/components/learning/TopicContentSection";
import { normalizeProfileLevel } from "@/lib/learningProgress";


type PageProps = {
  params: Promise<{
    grade: string;
    topicSlug: string;
  }>;
  searchParams: Promise<{
    level?: string;
  }>;
};

function isValidTopicLevel(value?: string): value is TopicLevel {
  return value === "basic" || value === "medium" || value === "advanced";
}

export default async function TopicDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { grade: gradeParam, topicSlug } = await params;
  const query = await searchParams;

  if (!isValidGrade(gradeParam)) {
    notFound();
  }

  const grade = Number(gradeParam) as Grade;
  const topic = getTopicBySlug(grade, topicSlug);

  if (!topic) {
    notFound();
  }

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

  const currentLevel = isValidTopicLevel(query.level)
    ? query.level
    : normalizeProfileLevel(profile.level);

  const content = topic.levels[currentLevel];

  return (
    <AppShell profile={profile} active="/topics">
      <LearningAccessGuard
        grade={grade}
        topicSlug={topic.slug}
        level={currentLevel}
        mode="topic"
        profileLevel={profile.level}
      >
        <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4">
          <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <Button
              href={`/topics/${grade}`}
              variant="ghost"
              className="mb-3 h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 hover:bg-white"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {grade}-сынып тақырыптарына қайту
            </Button>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
                      {grade}-сынып · {topic.unit}
                    </p>

                    <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                      {topic.title}
                    </h1>
                  </div>
                </div>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  {topic.description}
                </p>
              </div>

              <div className="w-fit shrink-0 rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-3 py-2">
                <p className="text-[11px] font-bold text-[#5b4ce6]">
                  Берілетін деңгей
                </p>
                <p className="mt-0.5 text-sm font-black text-slate-950">
                  {levelLabels[currentLevel]}
                </p>
              </div>
            </div>
          </section>

          <TopicContentSection content={content} level={currentLevel} />

          <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-black text-slate-950">
                  14. Тапсырмаға өту
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Енді осы тақырып бойынша тапсырмаға өтіңіз. Келесі тақырыпты ашу
                  үшін кемінде 70% нәтиже жинау қажет.
                </p>
              </div>

              <Button
                href={`/tasks/session?grade=${grade}&topic=${topic.slug}&level=${currentLevel}`}
                className="w-full sm:w-fit"
              >
                Тапсырмаға өту
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </section>

          <TopicAiAskBox
            grade={grade}
            topicSlug={topic.slug}
            topicTitle={topic.title}
            level={currentLevel}
          />
        </div>
    </LearningAccessGuard>
  </AppShell>
);
}
