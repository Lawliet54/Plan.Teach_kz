import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Database, FlaskConical, Timer, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile, getStudentEntryPath } from "@/lib/auth";
import { getLabsDatabaseFirst } from "@/lib/labCatalog";

export default async function LabsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");

  const entryPath = getStudentEntryPath(profile);
  if (entryPath !== "/dashboard") redirect(entryPath);

  const labs = await getLabsDatabaseFirst();
  const readyCount = labs.filter((lab) => lab.databaseReady).length;

  return (
    <AppShell profile={profile} active="/labs">
      <PageHeader
        eyebrow="Зертханалар"
        title="Виртуалды физика зертханасы"
        description="Параметрді өзгертіңіз, өлшеу жүргізіңіз, график құрыңыз және физикалық заңды тәжірибемен дәлелдеңіз. Әр аяқталған жұмыс мұғалім аналитикасына жіберіледі."
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {[
          { label: "Белсенді модель", value: String(labs.length), icon: FlaskConical },
          { label: "Supabase каталогы", value: `${readyCount}/${labs.length}`, icon: Database },
          { label: "Орташа ұзақтық", value: "10–12 мин", icon: Timer },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="science-panel flex items-center gap-3 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--purple-soft)]">
              <Icon className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--text-faint)]">{label}</p>
              <p className="mt-0.5 text-base font-black text-[var(--text)]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {labs.map((lab, index) => (
          <Link key={lab.slug} href={`/labs/${lab.slug}`} className="group block">
            <Card className="relative h-full overflow-hidden transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[var(--border-accent)] group-hover:shadow-[var(--shadow-md)]">
              <div className="absolute right-0 top-0 h-20 w-20 bg-[linear-gradient(135deg,transparent_48%,rgba(92,76,230,.08)_49%)]" />
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--border-accent)] bg-[var(--purple-soft)]">
                  <FlaskConical className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <span className="rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono text-[10px] font-black text-[var(--text-soft)]">
                  EXP-{String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <CardTitle>{lab.title}</CardTitle>
              <CardText className="mt-1">{lab.description}</CardText>

              <div className="mt-3 border-y border-[var(--border-soft)] py-2 font-mono text-xs font-black text-[var(--primary)]">
                {lab.formula}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-[var(--radius-xs)] bg-[var(--surface-muted)] px-2 py-1 text-[var(--text-muted)]">
                  {lab.gradeLabels.join(" • ")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] bg-[var(--purple-soft)] px-2 py-1 text-[var(--primary)]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {lab.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] bg-[var(--surface-muted)] px-2 py-1 text-[var(--text-muted)]">
                  <Timer className="h-3.5 w-3.5" />
                  {lab.estimatedMinutes} мин
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[var(--border-soft)] pt-3 text-xs font-black text-[var(--primary)]">
                <span>{lab.databaseReady ? "Дерекқормен синхрондалған" : "Алдын ала көру режимі"}</span>
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
