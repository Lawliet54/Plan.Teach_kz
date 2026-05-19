import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getLabs } from "@/lib/content";

export default async function LabsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleHomePath(profile.role));
  if (!profile.teacher_id) redirect("/onboarding/teacher-select");
  if (!profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (!profile.onboarding_completed) redirect("/onboarding/interests");

  const labs = await getLabs(profile.current_grade || 7);

  return (
    <AppShell profile={profile} active="/labs">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Симуляциялар
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Виртуалды зертхана
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          MVP-де зертханалық жұмыстар каталог ретінде ашылады.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab) => (
          <Card key={lab.id}>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
              <FlaskConical className="h-5 w-5 text-[#5b4ce6]" />
            </div>
            <CardTitle>{lab.title}</CardTitle>
            <CardText>{lab.description || "Зертхана нұсқаулығы кейін қосылады."}</CardText>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                {lab.grade} сынып
              </span>
              <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[#5b4ce6]">
                {lab.content_status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
