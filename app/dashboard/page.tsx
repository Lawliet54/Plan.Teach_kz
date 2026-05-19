import {
  Award,
  BookOpen,
  BrainCircuit,
  Flame,
  LineChart,
  PlayCircle,
  Route,
  Target,
} from "lucide-react";
import { getStudentInterests } from "@/lib/interests";
import { Button } from "@/components/ui/Button";
import { redirect } from "next/navigation";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { levelLabels } from "@/lib/types";

const routeItems = [
  {
    title: "Физикалық шамалар",
    status: "Аяқталды",
  },
  {
    title: "Қозғалыс және жылдамдық",
    status: "Оқылып жатыр",
  },
  {
    title: "Күш және қысым",
    status: "Келесі",
  },
];

export default async function DashboardPage() {
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

  const interests = await getStudentInterests(profile.id);

  return (
    <AppShell profile={profile} active="/dashboard">
      <div className="space-y-3 sm:space-y-4">
        <section className="overflow-hidden rounded-[10px] bg-[linear-gradient(135deg,#3021b8_0%,#4438ca_45%,#5b21b6_100%)] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Оқушы dashboard
              </p>
              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
                Қош келдіңіз, {profile.full_name}!
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78">
                Бүгін физика маршрутыңызды жалғастырыңыз. Деңгейіңіз,
                прогрессіңіз және AI ұсыныстары осы жерде жиналады.
              </p>
            </div>

            <Button
              href="/learn"
              className="w-fit border-white/20 bg-white text-[#493dd6] hover:bg-white/95"
            >
              <PlayCircle className="mr-1.5 h-4 w-4" />
              Оқуды жалғастыру
            </Button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            {
              label: "Деңгей",
              value: profile.level ? levelLabels[profile.level] : "Бастапқы деңгей",
              icon: Target,
              color: "text-[#5b4ce6]",
            },
            {
              label: "Streak",
              value: "7 күн",
              icon: Flame,
              color: "text-orange-500",
            },
            {
              label: "Медаль",
              value: "3",
              icon: Award,
              color: "text-violet-500",
            },
            {
              label: "Прогресс",
              value: "24%",
              icon: LineChart,
              color: "text-emerald-500",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <p className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-lg font-black text-slate-950">
                  {item.value}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Route className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Жеке оқу маршруты</CardTitle>
            </div>

            <div className="space-y-2">
              {routeItems.map((item, index) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#f1efff] text-xs font-black text-[#5b4ce6]">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-950">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-3">
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#5b4ce6]" />
                <CardTitle>AI анализ</CardTitle>
              </div>
              <CardText>
                Сіз теорияны тез түсінесіз, бірақ есеп шығарғанда өлшем
                бірліктерді шатастыруыңыз мүмкін.
              </CardText>
            </Card>

            <Card>
              <div className="mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
                <CardTitle>Қызығатын тақырыптар</CardTitle>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(interests.length > 0
                  ? interests.map((interest) => interest.title)
                  : ["Механика", "Оптика", "Электр"]
                ).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#ddd6ff] bg-[#f1efff] px-2.5 py-1 text-xs font-bold text-[#5b4ce6]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
