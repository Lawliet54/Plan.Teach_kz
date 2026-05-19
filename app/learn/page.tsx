import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import {
  getCoreReadyTopics,
  getStudentLevelLabel,
} from "@/lib/content";
import { Button } from "@/components/ui/Button";

export default async function LearnPage() {
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

  const topics = await getCoreReadyTopics();
  const levelLabel = getStudentLevelLabel(profile.level);

  return (
    <AppShell profile={profile} active="/learn">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="purple-gradient rounded-[18px] p-5 text-white shadow-lg shadow-[#5b3ee4]/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                <BookOpen className="h-3.5 w-3.5" />
                Оқу траекториясы
              </p>

              <h1 className="text-2xl font-black leading-tight">
                Физиканың негізгі 5 тақырыбы
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                Бұл бөлімде тақырыптар сыныпқа бөлінбейді. Әр тақырып сіздің
                қазіргі деңгейіңізге сай түсіндіріледі.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-4 sm:block">
              <BrainCircuit className="h-14 w-14 text-white/85" />
            </div>
          </div>
        </section>

        <section className="compact-card p-4">
          <h2 className="text-base font-black text-slate-950">
            Сіздің оқу деңгейіңіз
          </h2>

          <div className="mt-3 rounded-2xl border border-[#ddd6ff] bg-[#f0edff] p-4">
            <p className="text-2xl font-black text-[#5b3ee4]">
              {levelLabel}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Тақырып ішіндегі теория, мысал және түсіндіру осы деңгейге сай
              көрсетіледі.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xl font-black text-slate-950">
                {topics.length}
              </p>
              <p className="text-xs text-slate-500">дайын тақырып</p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xl font-black text-emerald-700">AI</p>
              <p className="text-xs text-emerald-700">көмекші дайын</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-4 compact-card p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Қолжетімді тақырыптар
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Алдымен осы 5 тақырып толық жұмыс істейді. Кейін қалған КТЖ
              тақырыптары осы форматпен толтырылады.
            </p>
          </div>

          <span className="rounded-full bg-[#f0edff] px-3 py-1 text-xs font-black text-[#5b3ee4]">
            5 тақырып
          </span>
        </div>

        {topics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-bold text-slate-700">
              Әзірге тақырып жоқ
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supabase SQL seed орындалғанын тексеріңіз.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic, index) => (
              <Link
                key={topic.id}
                href={`/learn/${topic.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#5b3ee4]/45 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f0edff]">
                    <CheckCircle2 className="h-5 w-5 text-[#5b3ee4]" />
                  </div>

                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                    Дайын
                  </span>
                </div>

                <h3 className="text-sm font-black leading-5 text-slate-950 group-hover:text-[#5b3ee4]">
                  {index + 1}. {topic.title}
                </h3>

                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                  {topic.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                    {levelLabel}
                  </span>

                  <span className="rounded-full bg-[#f0edff] px-2.5 py-1 text-[11px] font-bold text-[#5b3ee4]">
                    Оқу
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-[#d7e3ff] bg-[#f0edff] p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#5b3ee4]" />
          <div>
            <p className="text-sm font-black text-slate-950">
              AI көмекші осы тақырыптармен жұмыс істейді
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Тақырып ішіне кірген соң AI-дан қарапайым түсіндіру, формула,
              мысал немесе есеп шығару жолын сұрай аласыз.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}