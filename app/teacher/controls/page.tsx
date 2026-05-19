import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";

export default async function TeacherControlsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "teacher" && profile.role !== "admin") redirect("/dashboard");

  return (
    <AppShell profile={profile} active="/teacher/controls">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          БЖБ / ТЖБ
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Бағалау материалдары
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {["БЖБ генерациясы", "ТЖБ генерациясы"].map((title) => (
          <Card key={title}>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
              <BookOpen className="h-5 w-5 text-[#5b4ce6]" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardText>
              MVP-де бұл бөлім дайын. Кейін өткен тақырыптар бойынша автоматты
              тапсырма құрастыру қосылады.
            </CardText>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
