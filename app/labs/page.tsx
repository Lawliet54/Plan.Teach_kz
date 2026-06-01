import Link from "next/link";
import { redirect } from "next/navigation";
import { FlaskConical, Timer, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile, getStudentEntryPath } from "@/lib/auth";
import { labs } from "@/data/labs";

export default async function LabsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const entryPath = getStudentEntryPath(profile);
  if (entryPath !== "/dashboard") {
    redirect(entryPath);
  }

  return (
    <AppShell profile={profile} active="/labs">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Зертханалар
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">Виртуалды зертхана</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
          Формулаларды тәжірибе арқылы бекітіңіз: параметрлерді өзгертіп, өлшеуді
          кестеге енгізіңіз және қорытынды жасаңыз.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab) => (
          <Link key={lab.slug} href={`/labs/${lab.slug}`} className="group block">
            <Card className="h-full transition group-hover:border-[#ddd6ff] group-hover:shadow-[0_12px_30px_rgba(91,76,230,0.08)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
                  <FlaskConical className="h-5 w-5 text-[#5b4ce6]" />
                </div>

                <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {lab.formula}
                </span>
              </div>

              <CardTitle>{lab.title}</CardTitle>
              <CardText className="mt-1">{lab.description}</CardText>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                  {lab.gradeLabels.join(" • ")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f1efff] px-2.5 py-1 text-[#5b4ce6]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {lab.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                  <Timer className="h-3.5 w-3.5" />
                  {lab.estimatedMinutes} мин
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
