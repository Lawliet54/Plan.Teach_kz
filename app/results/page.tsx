import { redirect } from "next/navigation";
import { LineChart } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getLevelLabel } from "@/lib/diagnostic";

export default async function ResultsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleHomePath(profile.role));
  if (!profile.teacher_id) redirect("/onboarding/teacher-select");
  if (!profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (!profile.onboarding_completed) redirect("/onboarding/interests");

  const supabase = await createSupabaseServerClient();
  const { data: results } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("student_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <AppShell profile={profile} active="/results">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Нәтижелер
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Менің нәтижелерім
        </h1>
      </div>

      <div className="grid gap-3">
        {(results || []).map((result) => (
          <Card key={result.id}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <CardTitle>Диагностика нәтижесі</CardTitle>
                <CardText>
                  Деңгей: {getLevelLabel(result.level)}. Балл:{" "}
                  {result.total_score}/{result.max_score}.
                </CardText>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#f1efff]">
                <LineChart className="h-5 w-5 text-[#5b4ce6]" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!results?.length ? (
        <Card>
          <CardTitle>Нәтиже әзірге жоқ</CardTitle>
          <CardText>Диагностикадан өткеннен кейін нәтиже осында шығады.</CardText>
        </Card>
      ) : null}
    </AppShell>
  );
}
