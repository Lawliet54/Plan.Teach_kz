import { notFound, redirect } from "next/navigation";

import {
  getTopicsByGrade,
  isValidGrade,
  type Grade,
} from "@/data/physicsTopics";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { normalizeProfileLevel } from "@/lib/learningProgress";

type PageProps = {
  params: Promise<{
    grade: string;
  }>;
};

export default async function GradeTopicsPage({ params }: PageProps) {
  const { grade: gradeParam } = await params;

  if (!isValidGrade(gradeParam)) {
    notFound();
  }

  const grade = Number(gradeParam) as Grade;
  const topics = getTopicsByGrade(grade);

  if (topics.length === 0) {
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

  const taskLevel = normalizeProfileLevel(profile.level);
  const firstTopic = topics[0];

  redirect(`/topics/${grade}/${firstTopic.slug}?level=${taskLevel}`);
}