import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getLabs,
  getProjectTasks,
  getTopicBySlug,
  getTopicContents,
  getTopicObjectives,
} from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getBlockLabel(blockType: string) {
  if (blockType === "theory") return "Теория";
  if (blockType === "formula") return "Формула";
  if (blockType === "example") return "Мысал";
  if (blockType === "video") return "Видео";
  if (blockType === "ai_prompt") return "AI prompt";
  return "Ескерту";
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;

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

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding/interests");
  }

  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const [contents, objectives, labs, projects] = await Promise.all([
    getTopicContents(topic.id),
    getTopicObjectives(topic.id),
    getLabs(topic.grade),
    getProjectTasks(topic.grade),
  ]);

  const relatedLabs = labs.filter((lab) => lab.topic_id === topic.id);
  const relatedProjects = projects.filter((task) => task.topic_id === topic.id);

  return (
    <AppShell profile={profile} active="/learn">
      <div className="mb-4">
        <Link
          href={`/learn?grade=${topic.grade}`}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#5b3ee4]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {topic.grade}-сынып тақырыптарына қайту
        </Link>

        <section className="purple-gradient rounded-[18px] p-5 text-white shadow-lg shadow-[#5b3ee4]/20">
          <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  {topic.grade} сынып
                </span>

                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                  {topic.content_status === "ready"
                    ? "Дайын тақырып"
                    : "Placeholder"}
                </span>

                {topic.has_bjb ? (
                  <span className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-bold text-amber-100">
                    БЖБ белгісі бар
                  </span>
                ) : null}
              </div>

              <h1 className="max-w-3xl text-2xl font-black leading-tight">
                {topic.title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/82">
                {topic.description ||
                  "Бұл тақырып КТЖ бойынша базаға енгізілді. Теория, тапсырмалар және видео материалдар кейін толықтырылады."}
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-4 lg:block">
              <BookOpen className="mx-auto h-16 w-16 text-white/85" />
              <p className="mt-3 text-center text-xs font-bold text-white/80">
                Оқу материалы
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Оқу мақсаттары</CardTitle>
            </div>

            {objectives.length > 0 ? (
              <div className="space-y-2">
                {objectives.map((objective) => (
                  <div
                    key={objective.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs font-black text-[#5b3ee4]">
                      {objective.objective_code || "Оқу мақсаты"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">
                      {objective.objective_text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <CardText>
                Бұл тақырыптың оқу мақсаттары кейін енгізіледі.
              </CardText>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Теория және материалдар</CardTitle>
            </div>

            {contents.length > 0 ? (
              <div className="space-y-3">
                {contents.map((content) => (
                  <article
                    key={content.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f0edff] px-2.5 py-1 text-[11px] font-black text-[#5b3ee4]">
                        {getBlockLabel(content.block_type)}
                      </span>

                      {content.title ? (
                        <h2 className="text-sm font-black text-slate-950">
                          {content.title}
                        </h2>
                      ) : null}
                    </div>

                    {content.body ? (
                      <p className="text-sm leading-7 text-slate-700">
                        {content.body}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Материал кейін енгізіледі.
                      </p>
                    )}

                    {content.media_url ? (
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-500">
                          Медиа: {content.media_url}
                        </p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-sm font-bold text-slate-700">
                  Теория кейін толықтырылады
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Бұл placeholder тақырып. Қазір тек КТЖ skeleton ретінде
                  енгізілген.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>AI Tutor</CardTitle>
            </div>

            <div className="rounded-2xl border border-[#d7e3ff] bg-[#f0edff] p-4">
              <p className="text-sm font-black text-slate-950">
                Бұл тақырып бойынша AI көмекші кейін қосылады
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                AI Tutor оқушы деңгейін, диагностика нәтижесін және осы
                тақырыптың мақсатын ескеріп жауап береді.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="h-8 rounded-xl border border-[#ddd6ff] bg-white px-3 text-xs font-bold text-[#5b3ee4]">
                  Қарапайым тілмен түсіндір
                </button>
                <button className="h-8 rounded-xl border border-[#ddd6ff] bg-white px-3 text-xs font-bold text-[#5b3ee4]">
                  Формуламен түсіндір
                </button>
                <button className="h-8 rounded-xl border border-[#ddd6ff] bg-white px-3 text-xs font-bold text-[#5b3ee4]">
                  Тағы мысал келтір
                </button>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardTitle>Тақырып әрекеттері</CardTitle>
            <div className="mt-3 space-y-2">
              <Button href="/tasks" className="w-full">
                <ClipboardCheck className="mr-1.5 h-4 w-4" />
                Тапсырма орындау
              </Button>

              <Button href="/tests" variant="secondary" className="w-full">
                <PlayCircle className="mr-1.5 h-4 w-4" />
                Тест тапсыру
              </Button>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Байланысты зертханалар</CardTitle>
            </div>

            {relatedLabs.length > 0 ? (
              <div className="space-y-2">
                {relatedLabs.map((lab) => (
                  <Link
                    key={lab.id}
                    href="/labs"
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#5b3ee4]/40"
                  >
                    <p className="text-sm font-black text-slate-950">
                      {lab.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lab.content_status}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <CardText>
                Бұл тақырыпқа зертханалық жұмыс кейін байланыстырылады.
              </CardText>
            )}
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#5b3ee4]" />
              <CardTitle>Жобалық тапсырмалар</CardTitle>
            </div>

            {relatedProjects.length > 0 ? (
              <div className="space-y-2">
                {relatedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href="/tasks"
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#5b3ee4]/40"
                  >
                    <p className="text-sm font-black text-slate-950">
                      {project.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.content_status} • {project.max_score} ұпай
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <CardText>
                Бұл тақырыпқа жобалық тапсырма кейін қосылады.
              </CardText>
            )}
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}