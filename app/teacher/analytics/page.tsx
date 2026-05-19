import { redirect } from "next/navigation";
import { BarChart3, BrainCircuit, UsersRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";
import { getMyStudents } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildLocalAiProfile, type LocalAiProfile } from "@/lib/local-ai";

export default async function TeacherAnalyticsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "teacher" && profile.role !== "admin") redirect("/dashboard");

  const students = await getMyStudents(profile.id);
  const completed = students.filter((student) => student.diagnostic_completed).length;
  const supabase = await createSupabaseServerClient();
  const { data: diagnosticResults } = students.length
    ? await supabase
        .from("diagnostic_results")
        .select("*")
        .in(
          "student_id",
          students.map((student) => student.id)
        )
        .order("created_at", { ascending: false })
    : { data: [] };
  const latestResultByStudent = new Map<string, Record<string, unknown>>();

  (diagnosticResults || []).forEach((result) => {
    const studentId = String(result.student_id);

    if (!latestResultByStudent.has(studentId)) {
      latestResultByStudent.set(studentId, result as Record<string, unknown>);
    }
  });

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
          <CardText>
            {completed > 0
              ? `${Math.round(
                  (diagnosticResults || []).reduce(
                    (sum, result) =>
                      sum +
                      Number(result.max_score
                        ? (result.total_score / result.max_score) * 100
                        : 0),
                    0
                  ) / Math.max((diagnosticResults || []).length, 1)
                )}% диагностика бойынша`
              : "Диагностика күтілуде"}
          </CardText>
        </Card>
      </div>

      <Card className="mt-3">
        <div className="mb-3 flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-[#5b4ce6]" />
          <CardTitle>Оқушылардың AI диагностика профилі</CardTitle>
        </div>

        <div className="grid gap-3">
          {students.map((student) => {
            const result = latestResultByStudent.get(student.id);
            const aiProfile =
              (result?.recommended_route as LocalAiProfile | undefined)
                ?.parameter_count === 1000
                ? (result?.recommended_route as LocalAiProfile)
                : buildLocalAiProfile({
                    profile: student,
                    totalScore: Number(result?.total_score ?? 0),
                    maxScore: Number(result?.max_score ?? 1),
                    level: student.level ?? "beginner",
                    gradeScores: result?.grade_scores as
                      | Record<string, { correct: number; total: number }>
                      | undefined,
                    strongTopics: (result?.strong_topics as string[] | undefined) ?? [],
                    weakTopics: (result?.weak_topics as string[] | undefined) ?? [],
                  });

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {student.full_name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {result
                        ? String(result.ai_summary || "Local AI профилі дайын.")
                        : "Диагностика әлі тапсырылмаған."}
                    </p>
                  </div>

                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    {[
                      ["Параметр", aiProfile.parameter_count],
                      ["Меңгеру", `${aiProfile.mastery_percent}%`],
                      ["Режим", aiProfile.answer_depth],
                      ["Стиль", aiProfile.learning_style],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-bold text-slate-500">{label}</p>
                        <p className="mt-1 font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {aiProfile.weak_topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
                    >
                      Әлсіз: {topic}
                    </span>
                  ))}
                  {aiProfile.strong_topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                    >
                      Мықты: {topic}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {students.length === 0 ? (
          <CardText>Оқушы тіркелгеннен кейін диагностика AI профилі осы жерде көрінеді.</CardText>
        ) : null}
      </Card>
    </AppShell>
  );
}
