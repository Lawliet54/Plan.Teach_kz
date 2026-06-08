import { redirect } from "next/navigation";

import { AuthMessage } from "@/components/auth/AuthMessage";
import { DiagnosticForm } from "@/components/onboarding/DiagnosticForm";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getDiagnosticQuestionsByGrade } from "@/lib/diagnostic";

type DiagnosticPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function DiagnosticPage({
  searchParams,
}: DiagnosticPageProps) {
  const params = await searchParams;
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

  if (profile.diagnostic_completed) {
    redirect(
      profile.onboarding_completed ? "/dashboard" : "/onboarding/interests"
    );
  }

  const { questions, error } = await getDiagnosticQuestionsByGrade();

  return (
    <OnboardingShell
      currentStep="diagnostic"
      title="Бастапқы деңгейіңізді анықтаймыз"
      description="Сұрақтарға кезекпен жауап беріңіз. Нәтиже бойынша сіздің бастапқы деңгейіңіз автоматты түрде анықталады."
    >
      <AuthMessage error={params?.error || error || undefined} />
      <DiagnosticForm questions={questions} />
    </OnboardingShell>
  );
}