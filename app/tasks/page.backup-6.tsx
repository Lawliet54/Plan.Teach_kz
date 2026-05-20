import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getTopicBySlug,
  isValidGrade,
  type Grade,
  type TopicLevel,
} from "@/data/physicsTopics";
import { AdaptiveTopicTasks } from "@/components/learning/AdaptiveTopicTasks";

type PageProps = {
  searchParams: Promise<{
    grade?: string;
    topic?: string;
    level?: string;
  }>;
};

function isValidLevel(value?: string): value is TopicLevel {
  return value === "basic" || value === "medium" || value === "advanced";
}

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const gradeParam = params.grade;
  const topicSlug = params.topic;
  const levelParam = params.level;

  if (!gradeParam || !isValidGrade(gradeParam) || !topicSlug) {
    notFound();
  }

  const grade = Number(gradeParam) as Grade;
  const level: TopicLevel = isValidLevel(levelParam) ? levelParam : "basic";
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

  return (
    <AppShell profile={profile} active="/tasks">
      <AdaptiveTopicTasks grade={grade} topic={topic} level={level} />
    </AppShell>
  );
}