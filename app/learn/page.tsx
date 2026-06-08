import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { GradeSelectionGrid } from "@/components/learning/GradeSelectionGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import type { Grade } from "@/data/physicsTopics";

function normalizeSelectedGrade(value?: number | null): Grade {
  if (
    value === 7 ||
    value === 8 ||
    value === 9 ||
    value === 10 ||
    value === 11
  ) {
    return value;
  }

  return 7;
}

export default async function LearnPage() {
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
    <AppShell profile={profile} active="/topics">
      <div className="space-y-4">
        <PageHeader
          eyebrow="Оқу бағдарламасы"
          title="Физика тақырыптары"
          description="7–11 сыныптардың оқу бағдарламасын қарап, қажетті сыныпты таңдаңыз."
        />

        <GradeSelectionGrid
          selectedGrade={normalizeSelectedGrade(profile.current_grade)}
        />
      </div>
    </AppShell>
  );
}