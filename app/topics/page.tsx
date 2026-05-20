import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { GradeSelectionGrid } from "@/components/learning/GradeSelectionGrid";

export default async function TopicsPage() {
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
      <div className="space-y-3 sm:space-y-4">
        <GradeSelectionGrid />
      </div>
    </AppShell>
  );
}