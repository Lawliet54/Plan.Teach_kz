import { redirect } from "next/navigation";
import { BarChart3, UsersRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";
import { getMyStudents } from "@/lib/db";

export default async function TeacherAnalyticsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "teacher" && profile.role !== "admin") redirect("/dashboard");

  const students = await getMyStudents(profile.id);
  const completed = students.filter((student) => student.diagnostic_completed).length;

  return (
    <AppShell profile={profile} active="/teacher/analytics">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Аналитика
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Сынып аналитикасы
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <UsersRound className="mb-3 h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Оқушылар</CardTitle>
          <CardText>{students.length} оқушы тіркелген.</CardText>
        </Card>
        <Card>
          <BarChart3 className="mb-3 h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Диагностика</CardTitle>
          <CardText>{completed} оқушы бастапқы диагностиканы өтті.</CardText>
        </Card>
        <Card>
          <BarChart3 className="mb-3 h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Орташа прогресс</CardTitle>
          <CardText>MVP-де толық прогресс кейін қосылады.</CardText>
        </Card>
      </div>
    </AppShell>
  );
}
