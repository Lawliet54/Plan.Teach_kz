import {
  Award,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Flame,
  GraduationCap,
  Layers3,
  LineChart,
  Target,
} from "lucide-react";
import { getStudentInterests } from "@/lib/interests";
import { Button } from "@/components/ui/Button";
import { redirect } from "next/navigation";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { levelLabels } from "@/lib/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildLocalAiProfile,
  getLocalAiSummary,
  type LocalAiProfile,
} from "@/lib/local-ai";
import {
  grades,
  getTopicsByGrade,
  type Grade,
} from "@/data/physicsTopics";
import { ContinueLearningButton } from "@/components/learning/ContinueLearningButton";
import { LearningRouteOverview } from "@/components/learning/LearningRouteOverview";
import { GradeSelectionGrid } from "@/components/learning/GradeSelectionGrid";

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

export default async function DashboardPage() {
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

  const supabase = await createSupabaseServerClient();

  const [{ data: latestResult }, interests] = await Promise.all([
    supabase
      .from("diagnostic_results")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getStudentInterests(profile.id),
  ]);

  const aiProfile =
    (latestResult?.recommended_route as LocalAiProfile | null)
      ?.parameter_count === 1000
      ? (latestResult?.recommended_route as LocalAiProfile)
      : buildLocalAiProfile({
          profile,
          totalScore: latestResult?.total_score ?? 0,
          maxScore: latestResult?.max_score ?? 1,
          level: profile.level ?? "beginner",
          gradeScores: latestResult?.grade_scores,
          strongTopics:
            (latestResult?.strong_topics as string[] | undefined) ?? [],
          weakTopics:
            (latestResult?.weak_topics as string[] | undefined) ?? [],
          interests: interests.map((interest) => interest.title),
        });

  return (
    <AppShell profile={profile} active="/dashboard">
      <div className="space-y-3 sm:space-y-4">
        <section className="overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,#3021b8_0%,#4438ca_45%,#5b21b6_100%)] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Оқушы dashboard
              </p>

              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                Қош келдіңіз, {profile.full_name}!
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                Алдымен сыныбыңызды таңдаңыз. Әр сыныпта 5 бастапқы тақырып
                бар. Әр тақырып оқушы деңгейіне қарай базалық, орташа және
                күрделі форматта ашылады.
              </p>
            </div>

            <ContinueLearningButton profileLevel={profile.level} />
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              label: "Деңгей",
              value: profile.level
                ? levelLabels[profile.level]
                : "Бастапқы деңгей",
              icon: Target,
              color: "text-[#5b4ce6]",
            },
            {
              label: "Streak",
              value: "7 күн",
              icon: Flame,
              color: "text-orange-500",
            },
            {
              label: "Медаль",
              value: "3",
              icon: Award,
              color: "text-violet-500",
            },
            {
              label: "Прогресс",
              value: "24%",
              icon: LineChart,
              color: "text-emerald-500",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <p className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </p>
                </div>

                <p className="mt-2 text-lg font-black text-slate-950">
                  {item.value}
                </p>
              </Card>
            );
          })}
        </div>

        <LearningRouteOverview profileLevel={profile.level} />

        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.75fr]">
          <Card>
            <GradeSelectionGrid
              title="Сыныпты таңдаңыз"
              description="Қай сыныпты таңдасаңыз, сол сыныптың физика тақырыптары ашылады."
              compact
            />
          </Card>

          <div className="grid gap-3">
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#5b4ce6]" />
                <CardTitle>AI анализ</CardTitle>
              </div>

              <CardText>
                {latestResult?.ai_summary || getLocalAiSummary(aiProfile)}
              </CardText>

              <Button href="/ai" variant="secondary" className="mt-3 w-full">
                AI чатқа өту
              </Button>
            </Card>

            <Card>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
                <CardTitle>Қызығатын тақырыптар</CardTitle>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(interests.length > 0
                  ? interests.map((interest) => interest.title)
                  : ["Механика", "Оптика", "Электр"]
                ).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#ddd6ff] bg-[#f1efff] px-2.5 py-1 text-xs font-bold text-[#5b4ce6]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-2 flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-[#5b4ce6]" />
                <CardTitle>Оқу бағыты</CardTitle>
              </div>

              <div className="space-y-2 text-xs leading-5 text-slate-600">
                <p>
                  Әр тақырып оқушының диагностика нәтижесіне сай деңгейден
                  басталады және келесі тақырып алдыңғы нәтижеге қарай ашылады.
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-bold text-slate-800">
                  Базалық → Орташа → Күрделі
                </div>

                <p>
                  Келесі тақырыпты ашу үшін қазіргі тақырыпты кемінде 70%
                  нәтижемен аяқтау қажет.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
