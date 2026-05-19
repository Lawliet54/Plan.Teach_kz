import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { submitTaskAction } from "@/app/tasks/actions";
import { AppShell } from "@/components/layout/AppShell";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getDifficultyClass,
  getDifficultyLabel,
  getLatestTaskAttempt,
  getTaskById,
  type TaskOption,
} from "@/lib/tasks";

type TaskPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function isTaskOption(value: unknown): value is TaskOption {
  return (
    typeof value === "object" &&
    value !== null &&
    "key" in value &&
    "text" in value
  );
}

export default async function TaskPage({ params, searchParams }: TaskPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleHomePath(profile.role));
  if (!profile.teacher_id) redirect("/onboarding/teacher-select");
  if (!profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (!profile.onboarding_completed) redirect("/onboarding/interests");

  const task = await getTaskById(id);

  if (!task) {
    redirect("/tasks");
  }

  const latestAttempt = await getLatestTaskAttempt(task.id, profile.id);
  const options = Array.isArray(task.options)
    ? task.options.filter(isTaskOption)
    : [];

  return (
    <AppShell profile={profile} active="/tasks">
      <Link
        href="/tasks"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#5b4ce6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Тапсырмаларға қайту
      </Link>

      <div className="grid gap-3 lg:grid-cols-[1fr_340px]">
        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${getDifficultyClass(
                    task.difficulty
                  )}`}
                >
                  {getDifficultyLabel(task.difficulty)}
                </span>
                <span className="rounded-full bg-[#f1efff] px-3 py-1 text-xs font-black text-[#5b4ce6]">
                  {task.points} ұпай
                </span>
                {task.topic ? (
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                    {task.topic.title}
                  </span>
                ) : null}
              </div>

              <h1 className="text-2xl font-black text-slate-950">
                {task.title.replace("MVP: ", "")}
              </h1>
            </div>

            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f1efff]">
              <ClipboardCheck className="h-5 w-5 text-[#5b4ce6]" />
            </div>
          </div>

          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {task.body}
          </p>

          <AuthMessage error={query?.error} success={query?.success} />

          <form action={submitTaskAction} className="mt-4 space-y-3">
            <input type="hidden" name="task_id" value={task.id} />

            {task.answer_type === "multiple_choice" && options.length > 0 ? (
              <div className="grid gap-2">
                {options.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm transition hover:border-[#5b4ce6]/50"
                  >
                    <input
                      type="radio"
                      name="answer_text"
                      value={option.key}
                      className="mt-1"
                      required
                    />
                    <span>
                      <span className="mr-1 font-black text-[#5b4ce6]">
                        {option.key}.
                      </span>
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                name="answer_text"
                rows={5}
                required
                placeholder="Жауабыңызды жазыңыз..."
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 outline-none transition focus:border-[#5b4ce6]"
              />
            )}

            <Button type="submit">
              Жауапты тексеру / сақтау
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardTitle>Соңғы жауап</CardTitle>
            {latestAttempt ? (
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>
                  Статус:{" "}
                  <span className="font-black text-slate-950">
                    {latestAttempt.status}
                  </span>
                </p>
                <p>
                  Нәтиже:{" "}
                  <span className="font-black text-slate-950">
                    {latestAttempt.is_correct === null
                      ? "Мұғалім/AI тексереді"
                      : latestAttempt.is_correct
                        ? "Дұрыс"
                        : "Қате"}
                  </span>
                </p>
                {latestAttempt.auto_feedback ? (
                  <p className="rounded-xl bg-slate-50 p-3">
                    {latestAttempt.auto_feedback}
                  </p>
                ) : null}
              </div>
            ) : (
              <CardText>Бұл тапсырмаға әлі жауап бермедіңіз.</CardText>
            )}
          </Card>

          <Card>
            <CardTitle>Шешім үлгісі</CardTitle>
            <CardText>{task.solution || task.explanation || "Кейін қосылады."}</CardText>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
