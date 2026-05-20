import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { AdaptiveAiTutor } from "@/components/learning/AdaptiveAiTutor";

type AiPageProps = {
  searchParams?: Promise<{
    grade?: string;
    topic?: string;
    level?: string;
    q?: string;
  }>;
};

export default async function AiPage({ searchParams }: AiPageProps) {
  const profile = await getCurrentProfile();
  const params = await searchParams;

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
    <AppShell profile={profile} active="/ai">
      <AdaptiveAiTutor
        initialGrade={params?.grade}
        initialTopicSlug={params?.topic}
        initialLevel={params?.level}
      />
    </AppShell>
  );
}