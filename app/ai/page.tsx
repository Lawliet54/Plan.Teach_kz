import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { AiChatWorkspace } from "@/components/learning/AiChatWorkspace";
import { getStudentInterests } from "@/lib/interests";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    grade?: string;
    topic?: string;
    level?: string;
    q?: string;
  }>;
};

export default async function AiPage({ searchParams }: PageProps) {
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

  return (
    <AppShell profile={profile} active="/ai">
      <AiChatWorkspace
        initialGrade={params.grade}
        initialTopicSlug={params.topic}
        initialLevel={params.level}
        initialQuestion={params.q}
        studentContext={{
          studentName: profile.full_name,
          profileLevel: profile.level,
          interests: interests.map((interest) => interest.title),
          diagnosticSummary: latestResult?.ai_summary ?? null,
          strongTopics:
            (latestResult?.strong_topics as string[] | null | undefined) ?? [],
          weakTopics:
            (latestResult?.weak_topics as string[] | null | undefined) ?? [],
        }}
      />
    </AppShell>
  );
}