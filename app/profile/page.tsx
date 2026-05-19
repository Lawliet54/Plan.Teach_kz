import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";
import { roleLabels, levelLabels } from "@/lib/types";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");

  return (
    <AppShell profile={profile} active="/profile">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Жеке кабинет
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Профиль
        </h1>
      </div>

      <Card>
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#f1efff]">
          <User className="h-7 w-7 text-[#5b4ce6]" />
        </div>
        <CardTitle>{profile.full_name}</CardTitle>
        <CardText>{profile.email || "Email көрсетілмеген"}</CardText>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Рөл</p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {roleLabels[profile.role]}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Деңгей</p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {profile.level ? levelLabels[profile.level] : "Әлі анықталмады"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Диагностика</p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {profile.diagnostic_completed ? "Өтілді" : "Күтілуде"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Onboarding</p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {profile.onboarding_completed ? "Аяқталды" : "Аяқталмаған"}
            </p>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
