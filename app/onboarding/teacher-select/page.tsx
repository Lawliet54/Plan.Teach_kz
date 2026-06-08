import { redirect } from "next/navigation";
import { GraduationCap, Search } from "lucide-react";

import { selectTeacherAction } from "@/app/onboarding/actions";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getTeachersForSelect } from "@/lib/db";

type TeacherSelectPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function TeacherSelectPage({
  searchParams,
}: TeacherSelectPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  if (profile.teacher_id) {
    redirect("/onboarding/diagnostic");
  }

  const teachers = await getTeachersForSelect();

  return (
    <OnboardingShell
      currentStep="teacher"
      title="Өз мұғаліміңізді таңдаңыз"
      description="Мұғалім сіздің оқу прогресіңізді, диагностика нәтижеңізді және тапсырмаларыңызды көре алады."
    >
      <AuthMessage error={params?.error} success={params?.success} />

      {teachers.length === 0 ? (
        <EmptyState
          icon={<Search className="h-5 w-5" />}
          title="Әзірге мұғалім табылмады"
          description="Жүйе әкімшісі кемінде бір мұғалім аккаунтын қосуы керек."
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {teachers.map((teacher) => (
            <form key={teacher.id} action={selectTeacherAction}>
              <input type="hidden" name="teacher_id" value={teacher.id} />

              <div className="flex h-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 transition hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-sm)]">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--purple-soft)] text-[var(--primary)]">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-extrabold text-[var(--text)]">
                    {teacher.full_name}
                  </h2>

                  <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                    {teacher.email || "Физика пәні мұғалімі"}
                  </p>
                </div>

                <Button type="submit" size="sm" variant="secondary">
                  Таңдау
                </Button>
              </div>
            </form>
          ))}
        </div>
      )}
    </OnboardingShell>
  );
}