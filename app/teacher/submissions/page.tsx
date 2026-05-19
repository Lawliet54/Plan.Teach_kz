import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";

export default async function TeacherSubmissionsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "teacher" && profile.role !== "admin") redirect("/dashboard");

  return (
    <AppShell profile={profile} active="/teacher/submissions">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Тексеру
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Тексерілетін жұмыстар
        </h1>
      </div>

      <Card>
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
          <ClipboardCheck className="h-5 w-5 text-[#5b4ce6]" />
        </div>
        <CardTitle>Жұмыс кезегі бос</CardTitle>
        <CardText>
          MVP-де бұл бөлім дайын placeholder. Оқушы тапсырма/сурет жібергенде
          осы жерге review queue қосылады.
        </CardText>
      </Card>
    </AppShell>
  );
}
