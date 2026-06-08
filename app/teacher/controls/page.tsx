import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { AssessmentGeneratorWorkspace } from "@/components/teacher/AssessmentGeneratorWorkspace";
import { getCurrentProfile } from "@/lib/auth";

export default async function TeacherControlsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "teacher" && profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AppShell profile={profile} active="/teacher/controls">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
          Gemini AI · БЖБ / ТЖБ
        </p>

        <h1 className="mt-1 text-2xl font-black text-[var(--text)]">
          Бағалау материалдарының генераторы
        </h1>

        <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--text-muted)]">
          Бөлімді, сыныпты және оқу мақсаттарын енгізіңіз. AI тапсырмаларды,
          дескрипторларды, жауаптарды, балл қою кестесін және рубриканы
          автоматты түрде құрастырады.
        </p>
      </div>

      <AssessmentGeneratorWorkspace />
    </AppShell>
  );
}
