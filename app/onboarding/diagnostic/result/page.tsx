import { redirect } from "next/navigation";
import { BrainCircuit, CheckCircle2, TrendingUp } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getLevelLabel } from "@/lib/diagnostic";
import { buildLocalAiProfile, type LocalAiProfile } from "@/lib/local-ai";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

type ResultPageProps = {
  searchParams?: Promise<{
    attempt?: string;
  }>;
};

export default async function DiagnosticResultPage({
  searchParams,
}: ResultPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  const attemptId = params?.attempt;

  if (!attemptId) {
    redirect("/dashboard");
  }

  const supabase = await createSupabaseServerClient();

  const { data: result } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("attempt_id", attemptId)
    .eq("student_id", profile.id)
    .single();

  if (!result) {
    redirect("/dashboard");
  }

  const percent = Math.round((result.total_score / result.max_score) * 100);
  const weakTopics = (result.weak_topics as string[]) || [];
  const strongTopics = (result.strong_topics as string[]) || [];
  const aiProfile =
    (result.recommended_route as LocalAiProfile | null)?.parameter_count === 1000
      ? (result.recommended_route as LocalAiProfile)
      : buildLocalAiProfile({
          profile,
          totalScore: result.total_score,
          maxScore: result.max_score,
          level: result.level,
          gradeScores: result.grade_scores,
          strongTopics,
          weakTopics,
        });

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f0edff]">
            <BrainCircuit className="h-6 w-6 text-[#5b3ee4]" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b3ee4]">
            Диагностика нәтижесі
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Бастапқы деңгей анықталды
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Бұл нәтиже бойынша жүйе кейін жеке оқу маршрутын құрады.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <CardTitle>Жалпы нәтиже</CardTitle>
            </div>

            <p className="text-3xl font-black text-slate-950">
              {result.total_score}/{result.max_score}
            </p>

            <CardText>{percent}% дұрыс жауап</CardText>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Деңгей</CardTitle>
            </div>

            <p className="text-2xl font-black text-[#5b3ee4]">
              {getLevelLabel(result.level)}
            </p>

            <CardText>AI Tutor жауаптары осы деңгейге сай беріледі.</CardText>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>AI анализ</CardTitle>
            </div>

            <CardText>
              {result.ai_summary ||
                `Local AI ${aiProfile.parameter_count} параметрмен бейімделді.`}
            </CardText>
          </Card>
        </div>

        <Card className="mt-4">
          <CardTitle>Local AI бейімдеу профилі</CardTitle>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {[
              ["Параметр", aiProfile.parameter_count],
              ["Меңгеру", `${aiProfile.mastery_percent}%`],
              ["Жауап режимі", aiProfile.answer_depth],
              ["Стиль", aiProfile.learning_style],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {aiProfile.tutor_tone}
          </p>
        </Card>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardTitle>Мықты жақтар</CardTitle>

            <div className="mt-3 flex flex-wrap gap-2">
              {strongTopics.length > 0 ? (
                strongTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Әзірге нақты мықты жақ анықталмады.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Әлсіз тақырыптар</CardTitle>

            <div className="mt-3 flex flex-wrap gap-2">
              {weakTopics.length > 0 ? (
                weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700"
                  >
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Әлсіз тақырыптар анықталмады.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5 flex justify-center">
          <Button href="/onboarding/interests">Қызығатын тақырыптарды таңдау</Button>
        </div>
      </section>
    </main>
  );
}
