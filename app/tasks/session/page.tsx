import { notFound, redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { LearningAccessGuard } from "@/components/learning/LearningAccessGuard";
import { TaskSessionWorkspace } from "@/components/learning/TaskSessionWorkspace";
import {
  getTopicBySlug,
  isValidGrade,
  type Grade,
  type TopicLevel,
} from "@/data/physicsTopics";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { normalizeProfileLevel } from "@/lib/learningProgress";

type PageProps = {
  searchParams: Promise<{
    grade?: string;
    topic?: string;
    level?: string;
    restart?: string;
  }>;
};

function isValidLevel(value?: string): value is TopicLevel {
  return value === "basic" || value === "medium" || value === "advanced";
}

export default async function TaskSessionPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const gradeParam = params.grade;
  const topicSlug = params.topic;
  const levelParam = params.level;

  if (!gradeParam || !isValidGrade(gradeParam) || !topicSlug) {
    notFound();
  }

  const grade = Number(gradeParam) as Grade;
  const topic = getTopicBySlug(grade, topicSlug);
  const restart = params.restart === "1";

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

  const level: TopicLevel = isValidLevel(levelParam)
    ? levelParam
    : normalizeProfileLevel(profile.level);

  return (
    <AppShell profile={profile} active="/tasks">
      <LearningAccessGuard
        grade={grade}
        topicSlug={topic.slug}
        level={level}
        mode="task"
        profileLevel={profile.level}
      >
        <TaskSessionWorkspace
          grade={grade}
          topic={topic}
          level={level}
          profileLevel={profile.level}
          restart={restart}
        />
      </LearningAccessGuard>
    </AppShell>
  );
}