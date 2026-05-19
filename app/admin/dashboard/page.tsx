import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

export default async function AdminDashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return (
    <AppShell profile={profile} active="/admin/dashboard">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4f31d4]">
          Админ панель
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Жүйені басқару
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["Пайдаланушылар", "Role, profile және мұғалім байланыстарын басқару."],
          ["Контент", "КТЖ тақырыптары, диагностика және тапсырмалар."],
          ["Аналитика", "MVP-де dashboard placeholder, кейін метрикалар қосылады."],
        ].map(([title, text]) => (
          <Card key={title}>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#061426]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardText>{text}</CardText>
          </Card>
        ))}
      </div>

      <Card className="mt-3">
        <CardTitle>Админ MVP дайын</CardTitle>
        <CardText>
          Қазір негізгі shell және entry point бар. Толық CRUD кейін бөлек
          кезеңде қосылады.
        </CardText>
      </Card>
    </AppShell>
  );
}
