import { redirect } from "next/navigation";
import { BookOpen, FlaskConical, FolderKanban } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getLabs, getProjectTasks, getTopics } from "@/lib/content";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

const grades = [7, 8, 9, 10, 11];

export default async function ContentTestPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const allTopics = await getTopics();
  const allLabs = await getLabs();
  const allProjects = await getProjectTasks();

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b3ee4]">
            Content test
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">
            7–11 сынып КТЖ skeleton тексеру
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Бұл бет topics, labs және project_tasks кестелерінен барлық сынып бойынша дерек келіп тұрғанын тексереді.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Тақырыптар</CardTitle>
            </div>
            <p className="text-2xl font-black text-slate-950">
              {allTopics.length}
            </p>
            <CardText>КТЖ-дан алынған dedupe topic skeleton.</CardText>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Зертханалар</CardTitle>
            </div>
            <p className="text-2xl font-black text-slate-950">
              {allLabs.length}
            </p>
            <CardText>Индивидуалды lab/task ретінде берілетін жұмыстар.</CardText>
          </Card>

          <Card>
            <div className="mb-2 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Жобалық тапсырмалар</CardTitle>
            </div>
            <p className="text-2xl font-black text-slate-950">
              {allProjects.length}
            </p>
            <CardText>Практикалық жұмыстардан жасалған project tasks.</CardText>
          </Card>
        </div>

        <div className="mt-4 space-y-4">
          {grades.map((grade) => {
            const topics = allTopics.filter((topic) => topic.grade === grade);
            const labs = allLabs.filter((lab) => lab.grade === grade);
            const projects = allProjects.filter((task) => task.grade === grade);

            return (
              <Card key={grade}>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <CardTitle>{grade} сынып</CardTitle>
                    <CardText>
                      {topics.length} тақырып • {labs.length} зертхана •{" "}
                      {projects.length} жоба
                    </CardText>
                  </div>

                  <span className="rounded-full bg-[#f0edff] px-3 py-1 text-xs font-black text-[#5b3ee4]">
                    КТЖ
                  </span>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                      Тақырыптар
                    </p>
                    <div className="space-y-2">
                      {topics.slice(0, 8).map((topic) => (
                        <div
                          key={topic.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {topic.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {topic.content_status} • {topic.level}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                      Зертханалар
                    </p>
                    <div className="space-y-2">
                      {labs.slice(0, 5).map((lab) => (
                        <div
                          key={lab.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {lab.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {lab.content_status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-500">
                      Жобалық тапсырмалар
                    </p>
                    <div className="space-y-2">
                      {projects.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {task.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {task.content_status} • {task.submission_type}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}