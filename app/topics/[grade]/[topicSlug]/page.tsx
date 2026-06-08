import {
  ArrowLeft,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { GradeLessonSidebar } from "@/components/learning/GradeLessonSidebar";
import { LessonMiniTask } from "@/components/learning/LessonMiniTask";
import { TopicAiAskBox } from "@/components/learning/TopicAiAskBox";
import { TopicContentSection } from "@/components/learning/TopicContentSection";
import { Button } from "@/components/ui/Button";
import { getLessonMiniTask } from "@/data/lessonMiniTasks";
import {
  getTopicBySlug,
  getTopicsByGrade,
  isValidGrade,
  type Grade,
  type TopicLevel,
} from "@/data/physicsTopics";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getNormalizedTopicContent } from "@/lib/contentModel";
import { normalizeProfileLevel } from "@/lib/learningProgress";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  const taskLevel = isValidTopicLevel(query.level)
    ? query.level
    : normalizeProfileLevel(profile.level);

  const gradeTopics = getTopicsByGrade(grade);

  const currentTopicIndex = gradeTopics.findIndex(
    (item) => item.slug === topic.slug
  );

  if (currentTopicIndex === -1) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();

  const { data: completedRows } = await supabase
    .from("lesson_mini_task_progress")
    .select("topic_slug")
    .eq("student_id", profile.id)
    .eq("grade", grade)
    .eq("is_completed", true);

  const completedTopicSlugs = new Set(
    (completedRows ?? []).map((row) => row.topic_slug)
  );

  const firstIncompleteIndex = gradeTopics.findIndex(
    (item) => !completedTopicSlugs.has(item.slug)
  );

  const highestAvailableIndex =
    firstIncompleteIndex === -1
      ? gradeTopics.length - 1
      : firstIncompleteIndex;

  if (currentTopicIndex > highestAvailableIndex) {
    const availableTopic = gradeTopics[highestAvailableIndex];

    redirect(`/topics/${grade}/${availableTopic.slug}`);
  }

  const sharedContent = getNormalizedTopicContent(topic, "medium");
  const miniTask = getLessonMiniTask(grade, topic.slug);
  const nextTopic = gradeTopics[currentTopicIndex + 1];

  const nextTopicHref = nextTopic
    ? `/topics/${grade}/${nextTopic.slug}`
    : `/topics/${grade}`;

  const nextTopicLabel = nextTopic
    ? "Келесі тақырып"
    : "Сынып тақырыптарына қайту";

  return (
    <AppShell profile={profile} active="/topics">
      <div className="grid items-start gap-3 lg:grid-cols-[292px_minmax(0,1fr)]">
        <GradeLessonSidebar
          grade={grade}
          activeTopicSlug={topic.slug}
        />

        <main className="min-w-0 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
            <Button
              href="/learn"
              variant="ghost"
              className="mb-4 h-8 rounded-xl px-2.5 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Сынып таңдауға қайту
            </Button>

            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ddd6ff] bg-[#f1efff] px-3 py-1 text-[11px] font-bold text-[#5b4ce6]">
                <BookOpen className="h-3.5 w-3.5" />
                1-қадам: Теория
              </span>

              <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#5b4ce6]">
                Физика тақырыбы
              </p>

              <h1 className="mx-auto mt-2 max-w-4xl text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
                {topic.title}
              </h1>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {topic.description}
              </p>
            </div>
          </div>

          <div className="px-4 py-2 sm:px-6">
            <TopicContentSection content={sharedContent} />
          </div>

          <div className="border-t border-slate-200 px-4 py-4 sm:px-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#5b4ce6]" />

              <h2 className="text-sm font-black text-slate-950">
                AI көмекші
              </h2>
            </div>

            <TopicAiAskBox
              grade={grade}
              topicSlug={topic.slug}
              topicTitle={topic.title}
              level={taskLevel}
            />
          </div>

          {miniTask ? (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-5">
              <LessonMiniTask
                task={miniTask}
                nextTopicHref={nextTopicHref}
                nextTopicLabel={nextTopicLabel}
              />
            </div>
          ) : null}
        </main>
      </div>
    </AppShell>
  );
}