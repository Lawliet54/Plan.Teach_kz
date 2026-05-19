import { redirect } from "next/navigation";
import { AiChatClient } from "@/components/ai/AiChatClient";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile } from "@/lib/auth";
import { getStudentInterests } from "@/lib/interests";
import {
  buildLocalAiProfile,
  type LocalAiProfile,
} from "@/lib/local-ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AiPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AiPage({ searchParams }: AiPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role === "student" && !profile.teacher_id) {
    redirect("/onboarding/teacher-select");
  }
  if (profile.role === "student" && !profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }
  if (profile.role === "student" && !profile.onboarding_completed) {
    redirect("/onboarding/interests");
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: latestResult }, interests] =
    profile.role === "student"
      ? await Promise.all([
          supabase
            .from("diagnostic_results")
            .select("*")
            .eq("student_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          getStudentInterests(profile.id),
        ])
      : [{ data: null }, []];
  const aiProfile =
    (latestResult?.recommended_route as LocalAiProfile | null)?.parameter_count ===
    1000
      ? (latestResult?.recommended_route as LocalAiProfile)
      : buildLocalAiProfile({
          profile,
          totalScore: latestResult?.total_score ?? 0,
          maxScore: latestResult?.max_score ?? 1,
          level: profile.level ?? "beginner",
          gradeScores: latestResult?.grade_scores,
          strongTopics: (latestResult?.strong_topics as string[] | undefined) ?? [],
          weakTopics: (latestResult?.weak_topics as string[] | undefined) ?? [],
          interests: interests.map((interest) => interest.title),
        });

  return (
    <AppShell
      profile={profile}
      active="/ai"
      hideTopbar
      contentClassName="h-full max-w-none p-0 sm:p-0"
    >
      <AiChatClient
        aiProfile={aiProfile}
        displayName={profile.full_name || "Оқушы"}
        storageKey={`plan-teach-ai-chats:${profile.id}`}
        initialQuestion={params?.q}
      />
    </AppShell>
  );
}
