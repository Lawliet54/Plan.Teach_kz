import { redirect } from "next/navigation";

import { InterestsForm } from "@/components/onboarding/InterestsForm";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getStudentInterests } from "@/lib/interests";

type InterestsPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function InterestsPage({
  searchParams,
}: InterestsPageProps) {
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

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  const savedInterests = await getStudentInterests(profile.id);

  return (
    <OnboardingShell
      currentStep="interests"
      title="Қызығушылық бағыттарын таңдаңыз"
      description="AI кеңестері мен ұсынылатын тапсырмалар сіз таңдаған бағыттарға бейімделеді."
    >
      <AuthMessage error={params?.error} />

      <InterestsForm
        savedKeys={savedInterests.map((interest) => interest.interest_key)}
      />
    </OnboardingShell>
  );
}