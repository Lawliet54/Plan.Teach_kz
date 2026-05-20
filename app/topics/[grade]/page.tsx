import { ArrowLeft, GraduationCap } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { GradeTopicsList } from "@/components/learning/GradeTopicsList";
import {
  getTopicsByGrade,
  isValidGrade,
  type Grade,
} from "@/data/physicsTopics";

type PageProps = {
  params: Promise<{
    grade: string;
  }>;
};

const gradeTitles: Record<Grade, string> = {
  7: "7-сынып физикасы",
  8: "8-сынып физикасы",
  9: "9-сынып физикасы",
  10: "10-сынып физикасы",
  11: "11-сынып физикасы",
};

const gradeDescriptions: Record<Grade, string> = {
  7: "Физикаға кіріспе, өлшеу, қозғалыс, күш және қысым тақырыптары.",
  8: "Жылу құбылыстары, электр тогы, Ом заңы және электр тізбектері.",
  9: "Динамика, энергия, импульс, электр өрісі және магнит өрісі.",
  10: "Кинематика, динамика, молекулалық физика және тұрақты ток заңдары.",
  11: "Электромагниттік индукция, айнымалы ток, оптика және кванттық физика.",
};

export default async function GradeTopicsPage({ params }: PageProps) {
  const { grade: gradeParam } = await params;

  if (!isValidGrade(gradeParam)) {
    notFound();
  }

  const grade = Number(gradeParam) as Grade;
  const topics = getTopicsByGrade(grade);

  if (topics.length === 0) {
    notFound();
  }

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

  return (
    <AppShell profile={profile} active="/topics">
      <div className="space-y-3 sm:space-y-4">
        <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <Button
            href="/topics"
            variant="ghost"
            className="mb-3 h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 hover:bg-white"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Сынып таңдауға қайту
          </Button>

          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
                Тақырыптар реті
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                {gradeTitles[grade]}
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {gradeDescriptions[grade]} Тақырыптар ретімен ашылады. Бір тақырыпты
            аяқтамай, келесі тақырыпқа өтуге болмайды.
          </p>
        </section>

        <GradeTopicsList grade={grade} />
      </div>
    </AppShell>
  );
}