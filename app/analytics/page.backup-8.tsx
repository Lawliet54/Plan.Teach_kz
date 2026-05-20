import { redirect } from "next/navigation";
import { BarChart3, BrainCircuit, Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getStudentInterests } from "@/lib/interests";

export default async function AnalyticsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleHomePath(profile.role));
  if (!profile.teacher_id) redirect("/onboarding/teacher-select");
  if (!profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (!profile.onboarding_completed) redirect("/onboarding/interests");

  const supabase = await createSupabaseServerClient();
  const [{ data: latestResult }, interests] = await Promise.all([
    supabase
      .from("diagnostic_results")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getStudentInterests(profile.id),
  ]);

  const weakTopics = (latestResult?.weak_topics as string[] | undefined) || [];
  const strongTopics = (latestResult?.strong_topics as string[] | undefined) || [];

  return (
    <AppShell profile={profile} active="/analytics">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Аналитика
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Оқу аналитикасы
        </h1>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <Target className="mb-3 h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Деңгей</CardTitle>
          <CardText>{profile.level || "beginner"}</CardText>
        </Card>
        <Card>
          <BarChart3 className="mb-3 h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Мықты тақырыптар</CardTitle>
          <CardText>{strongTopics.join(", ") || "Әзірге анықталмады"}</CardText>
        </Card>
        <Card>
          <BrainCircuit className="mb-3 h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Қызығушылықтар</CardTitle>
          <CardText>
            {interests.map((interest) => interest.title).join(", ") ||
              "Әзірге таңдалмады"}
          </CardText>
        </Card>
      </div>

      <Card className="mt-3">
        <CardTitle>Жұмыс істеу керек тақырыптар</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {(weakTopics.length ? weakTopics : ["Өлшем бірлік", "Формула қолдану"]).map(
            (topic) => (
              <span
                key={topic}
                className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
              >
                {topic}
              </span>
            )
          )}
        </div>
      </Card>
    </AppShell>
  );
}
