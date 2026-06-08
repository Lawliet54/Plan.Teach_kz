import { redirect } from "next/navigation";
import {
  BrainCircuit,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getLevelLabel } from "@/lib/diagnostic";
import { buildLocalAiProfile, type LocalAiProfile } from "@/lib/local-ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ResultPageProps = {
  searchParams?: Promise<{
    attempt?: string;
  }>;
};

export default async function DiagnosticResultPage({
  searchParams,
}: ResultPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  const attemptId = params?.attempt;

  if (!attemptId) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: result } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("attempt_id", attemptId)
    .eq("student_id", profile.id)
    .single();

  if (!result) {
    redirect("/dashboard");
  }

  const percent = Math.round((result.total_score / result.max_score) * 100);
  const weakTopics = (result.weak_topics as string[]) || [];
  const strongTopics = (result.strong_topics as string[]) || [];

  const aiProfile =
    (result.recommended_route as LocalAiProfile | null)?.parameter_count === 1000
      ? (result.recommended_route as LocalAiProfile)
      : buildLocalAiProfile({
          profile,
          totalScore: result.total_score,
          maxScore: result.max_score,
          level: result.level,
          gradeScores: result.grade_scores,
          strongTopics,
          weakTopics,
        });

  return (
    <OnboardingShell
      currentStep="diagnostic"
      title="Бастапқы деңгейіңіз анықталды"
      description="Жүйе диагностика нәтижесін сақтады. Енді қызығушылық бағыттарын таңдаңыз."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
            <CardTitle>Жалпы нәтиже</CardTitle>
          </div>

          <p className="mt-3 text-2xl font-black text-[var(--text)]">
            {result.total_score}/{result.max_score}
          </p>

          <CardText className="mt-1">{percent}% дұрыс жауап</CardText>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            <CardTitle>Бастапқы деңгей</CardTitle>
          </div>

          <p className="mt-3 text-lg font-black text-[var(--primary)]">
            {getLevelLabel(result.level)}
          </p>

          <CardText className="mt-1">
            Тапсырмалар осы деңгейден басталады.
          </CardText>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[var(--primary)]" />
            <CardTitle>AI бейімдеу</CardTitle>
          </div>

          <p className="mt-3 text-lg font-black text-[var(--text)]">
            {aiProfile.mastery_percent}%
          </p>

          <CardText className="mt-1">
            AI кеңестері нәтижеңізге сай беріледі.
          </CardText>
        </Card>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--success)]" />
            <CardTitle>Мықты тақырыптар</CardTitle>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {strongTopics.length > 0 ? (
              strongTopics.map((topic) => (
                <Badge key={topic} variant="success">
                  {topic}
                </Badge>
              ))
            ) : (
              <CardText>Әзірге нақты мықты тақырып анықталмады.</CardText>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[var(--danger)]" />
            <CardTitle>Қайталау қажет тақырыптар</CardTitle>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic) => (
                <Badge key={topic} variant="danger">
                  {topic}
                </Badge>
              ))
            ) : (
              <CardText>Қайталау қажет тақырыптар анықталмады.</CardText>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 flex justify-end">
        <Button href="/onboarding/interests">
          Қызығушылықтарды таңдау
        </Button>
      </div>
    </OnboardingShell>
  );
}