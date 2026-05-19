import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getDiagnosticQuestionsByGrade,
  groupQuestionsByGrade,
} from "@/lib/diagnostic";

type DiagnosticPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const optionLabels = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
} as const;

export default async function DiagnosticPage({
  searchParams,
}: DiagnosticPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  if (!profile.teacher_id) {
    redirect("/onboarding/teacher-select");
  }

  if (profile.diagnostic_completed) {
    redirect(
      profile.onboarding_completed
        ? "/dashboard"
        : "/onboarding/interests"
    );
  }

  const { questions, error } = await getDiagnosticQuestionsByGrade();
  const grouped = groupQuestionsByGrade(questions);

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b3ee4]">
              Диагностика
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950">
              Бастапқы деңгейіңізді анықтаймыз
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              7–11 сынып бойынша 50 сұраққа жауап беріңіз. Нәтиже бойынша жүйе
              сіздің деңгейіңізді анықтайды.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            Барлығы:{" "}
            <span className="font-black text-slate-950">
              {questions.length} сұрақ
            </span>
          </div>
        </div>

        <AuthMessage error={params?.error || error || undefined} />

        <form
          action="/onboarding/diagnostic/submit"
          method="post"
          className="space-y-4"
        >
          {[7, 8, 9, 10, 11].map((grade) => {
            const gradeQuestions = grouped[grade] ?? [];

            return (
              <Card key={grade}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      {grade} сынып
                    </h2>
                    <p className="text-xs text-slate-500">
                      {gradeQuestions.length} сұрақ
                    </p>
                  </div>

                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f0edff]">
                    <ClipboardList className="h-5 w-5 text-[#5b3ee4]" />
                  </div>
                </div>

                <div className="space-y-4">
                  {gradeQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-700">
                          {index + 1}-сұрақ
                        </span>

                        <span className="rounded-full bg-[#f0edff] px-2.5 py-1 text-[11px] font-bold text-[#5b3ee4]">
                          {question.topic}
                        </span>

                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          {question.difficulty === "easy"
                            ? "Жеңіл"
                            : question.difficulty === "medium"
                              ? "Орташа"
                              : "Күрделі"}
                        </span>
                      </div>

                      <p className="text-sm font-black leading-6 text-slate-950">
                        {question.question_text}
                      </p>

                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {[
                          ["A", question.option_a],
                          ["B", question.option_b],
                          ["C", question.option_c],
                          ["D", question.option_d],
                        ].map(([option, text]) => (
                          <label
                            key={option}
                            className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-[#5b3ee4]/50"
                          >
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value={option}
                              className="mt-1"
                            />

                            <span>
                              <span className="mr-1 font-black text-[#5b3ee4]">
                                {optionLabels[option as keyof typeof optionLabels]}.
                              </span>
                              <span className="text-slate-700">{text}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          <div className="sticky bottom-4 z-20 flex justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur">
              <Button type="submit" className="px-5">
                Диагностиканы аяқтау
              </Button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
