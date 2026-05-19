import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getDiagnosticQuestionsByGrade, groupQuestionsByGrade } from "@/lib/diagnostic";

export default async function TestsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleHomePath(profile.role));
  if (!profile.teacher_id) redirect("/onboarding/teacher-select");
  if (!profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (!profile.onboarding_completed) redirect("/onboarding/interests");

  const { questions } = await getDiagnosticQuestionsByGrade();
  const grouped = groupQuestionsByGrade(questions);

  return (
    <AppShell profile={profile} active="/tests">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Тесттер
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Диагностикалық тест базасы
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          MVP-де тесттер диагностика сұрақтарынан көрсетіледі.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {[7, 8, 9, 10, 11].map((grade) => (
          <Card key={grade}>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
              <ClipboardCheck className="h-5 w-5 text-[#5b4ce6]" />
            </div>
            <CardTitle>{grade}-сынып</CardTitle>
            <CardText>{grouped[grade]?.length || 0} сұрақ дайын.</CardText>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
