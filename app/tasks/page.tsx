import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getDifficultyClass, getDifficultyLabel, getTasks } from "@/lib/tasks";

const levels = [
  { key: "easy", title: "Базалық деңгей" },
  { key: "medium", title: "Орташа деңгей" },
  { key: "hard", title: "Жоғары деңгей" },
] as const;

export default async function TasksPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "student") redirect(getRoleHomePath(profile.role));
  if (!profile.teacher_id) redirect("/onboarding/teacher-select");
  if (!profile.diagnostic_completed) redirect("/onboarding/diagnostic");
  if (!profile.onboarding_completed) redirect("/onboarding/interests");

  const tasks = await getTasks();

  return (
    <AppShell profile={profile} active="/tasks">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Тапсырмалар
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Деңгейлік тапсырмалар
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          AI қосылғанша базалық, орташа және жоғары деңгейге дайын тапсырмалар
          қолданылады.
        </p>
      </div>

      <div className="space-y-4">
        {levels.map((level) => {
          const levelTasks = tasks.filter((task) => task.difficulty === level.key);

          return (
            <section key={level.key} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black text-slate-950">
                  {level.title}
                </h2>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${getDifficultyClass(
                    level.key
                  )}`}
                >
                  {levelTasks.length} тапсырма
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {levelTasks.map((task) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <Card className="h-full transition hover:-translate-y-0.5 hover:border-[#5b4ce6]/40 hover:shadow-[var(--shadow-hover)]">
                      <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
                        <ClipboardCheck className="h-5 w-5 text-[#5b4ce6]" />
                      </div>
                      <CardTitle>{task.title.replace("MVP: ", "")}</CardTitle>
                      <CardText>{task.body}</CardText>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span
                          className={`rounded-full border px-2.5 py-1 ${getDifficultyClass(
                            task.difficulty
                          )}`}
                        >
                          {getDifficultyLabel(task.difficulty)}
                        </span>
                        <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[#5b4ce6]">
                          {task.points} ұпай
                        </span>
                        {task.topic ? (
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                            {task.topic.title}
                          </span>
                        ) : null}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardTitle>Тапсырма әзірге жоқ</CardTitle>
          <CardText>
            Supabase-та `009_tasks_mvp_seed.sql` migration орындаңыз.
          </CardText>
        </Card>
      ) : null}
    </AppShell>
  );
}
