import { redirect } from "next/navigation";
import {
  BarChart3,
  ClipboardCheck,
  Medal,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile } from "@/lib/auth";

export default async function TeacherDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "teacher" && profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <AppShell profile={profile} active="/teacher/dashboard">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5b3ee4]">
          Мұғалім панелі
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Қош келдіңіз, {profile.full_name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Оқушылардың прогресін, тапсырмаларын және аналитикасын бақылаңыз.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Оқушылар", "0", UsersRound],
          ["Тексерілетін жұмыс", "0", ClipboardCheck],
          ["Орташа прогресс", "—", TrendingUp],
          ["Марапаттар", "0", Medal],
        ].map(([title, value, Icon]) => (
          <section key={title as string} className="compact-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#5b3ee4]" />
              <p className="text-xs font-bold text-slate-500">{title as string}</p>
            </div>
            <p className="text-2xl font-black text-slate-950">{value as string}</p>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="compact-card p-4">
          <h2 className="text-base font-black text-slate-950">
            Маған тіркелген оқушылар
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            5-қадамда оқушы мұғалімді таңдағанда осы жерде тізім пайда болады.
          </p>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <UsersRound className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-bold text-slate-700">
              Әзірге оқушы жоқ
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Оқушы тіркеліп, сізді мұғалім ретінде таңдағаннан кейін осында көрінеді.
            </p>
          </div>
        </section>

        <section className="compact-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#5b3ee4]" />
            <h2 className="text-base font-black text-slate-950">
              Жүйе статусы
            </h2>
          </div>

          <div className="space-y-3">
            {[
              ["Auth", "Қосылды"],
              ["Profiles", "Қосылды"],
              ["Диагностика", "Келесі қадам"],
              ["Оқушы аналитикасы", "Кейін"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-600">{label}</span>
                <span className="font-black text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}