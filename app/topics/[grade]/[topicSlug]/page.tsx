import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  ListChecks,
  Target,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
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

function getLevelDescription(level: TopicLevel) {
  if (level === "basic") {
    return "Бұл деңгейде тақырып қарапайым тілмен түсіндіріледі. Негізгі ұғымдар, жеңіл мысалдар және бастапқы тапсырмалар беріледі.";
  }

  if (level === "medium") {
    return "Бұл деңгейде оқушы формуланы қолдануды, салыстыруды және есеп шығаруды тереңірек меңгереді.";
  }

  return "Бұл деңгейде оқушы тақырыпты күрделі есеп, талдау және қорытынды жасау арқылы меңгереді.";
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

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Оқу мақсаты</CardTitle>
            </div>

            <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] p-3">
              <p className="text-sm font-bold leading-6 text-slate-900">
                {content.shortGoal}
              </p>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {getLevelDescription(currentLevel)}
            </p>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>1. Теория</CardTitle>
            </div>

            <p className="text-sm leading-7 text-slate-700">{content.theory}</p>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>2. Қарапайым түсіндіру</CardTitle>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold leading-7 text-slate-800">
                {content.simpleExplanation}
              </p>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>3. Есте сақтау керек</CardTitle>
            </div>

            <div className="grid gap-2">
              {content.keyPoints.map((point, index) => (
                <div
                  key={`${point}-${index}`}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#f1efff] text-xs font-black text-[#5b4ce6]">
                    {index + 1}
                  </div>

                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {content.formula ? (
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[#5b4ce6]" />
                <CardTitle>4. Формула</CardTitle>
              </div>

              <div className="rounded-2xl border border-[#ddd6ff] bg-[#f8f7ff] p-5 text-center">
                <p className="font-mono text-2xl font-black text-slate-950">
                  {content.formula}
                </p>
              </div>
            </Card>
          ) : null}

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>5. Мысал</CardTitle>
            </div>

            <p className="text-sm leading-7 text-slate-700">{content.example}</p>
          </Card>

          <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-black text-slate-950">
                  Тақырыпты оқып болдыңыз ба?
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
