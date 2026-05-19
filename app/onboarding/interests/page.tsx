import { redirect } from "next/navigation";
import {
  Atom,
  BrainCircuit,
  CheckCircle2,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { physicsInterests } from "@/data/physics-interests";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getStudentInterests } from "@/lib/interests";

type InterestsPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const icons = [
  Atom,
  FlaskConical,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
];

export default async function InterestsPage({
  searchParams,
}: InterestsPageProps) {
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

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  const savedInterests = await getStudentInterests(profile.id);
  const savedKeys = new Set(savedInterests.map((item) => item.interest_key));

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f0edff]">
            <BrainCircuit className="h-6 w-6 text-[#5b3ee4]" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b3ee4]">
            Қызығушылық бағыты
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Қай физика бағыттары сізге қызық?
          </h1>

          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Таңдаған бағыттарыңыз AI Tutor жауабына, жеке оқу маршрутына және
            ұсынылатын тапсырмаларға әсер етеді.
          </p>
        </div>

        <AuthMessage error={params?.error} />

        <form action="/onboarding/interests/submit" method="post">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {physicsInterests.map((interest, index) => {
              const Icon = icons[index % icons.length];

              return (
                <label
                  key={interest.key}
                  className="group cursor-pointer rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#5b3ee4]/45 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="interests"
                      value={interest.key}
                      defaultChecked={savedKeys.has(interest.key)}
                      className="mt-1 h-4 w-4 accent-[#5b3ee4]"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#f0edff]">
                        <Icon className="h-5 w-5 text-[#5b3ee4]" />
                      </div>

                      <p className="text-sm font-black text-slate-950">
                        {interest.title}
                      </p>

                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[#5b3ee4]">
                        {interest.category}
                      </p>

                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {interest.description}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="sticky bottom-4 z-20 mt-6 flex justify-center">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur">
              <Button type="submit" className="px-5">
                Таңдауды сақтау
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-slate-950">
            Бұл ақпарат қалай қолданылады?
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Мысалы, оқушы “Оптика” және “Есеп шығару” бағыттарын таңдаса, жүйе
            оған линза, жарықтың сынуы және формула қолдануға арналған
            тапсырмаларды көбірек ұсынады. AI Tutor да түсіндіру кезінде осы
            қызығушылықтарды ескереді.
          </p>
        </div>
      </section>
    </main>
  );
}
