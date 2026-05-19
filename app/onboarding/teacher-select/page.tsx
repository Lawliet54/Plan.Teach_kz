import { redirect } from "next/navigation";
import { GraduationCap, Search, UserRoundCheck } from "lucide-react";
import { selectTeacherAction } from "@/app/onboarding/actions";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getTeachersForSelect } from "@/lib/db";

type TeacherSelectPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function TeacherSelectPage({
  searchParams,
}: TeacherSelectPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  if (profile.teacher_id) {
    redirect("/onboarding/diagnostic");
  }

  const teachers = await getTeachersForSelect();

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-3xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-[#d7e3ff] bg-[#eef2ff]">
            <UserRoundCheck className="h-5 w-5 text-[#5b3ee4]" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b3ee4]">
            Мұғалім таңдау
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Өз мұғаліміңізді таңдаңыз
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Кейін мұғалім сіздің диагностика, тапсырма, зертхана және оқу
            аналитикаңызды көре алады.
          </p>
        </div>

        <AuthMessage error={params?.error} success={params?.success} />

        {teachers.length === 0 ? (
          <Card className="text-center">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-slate-100">
              <Search className="h-5 w-5 text-slate-500" />
            </div>

            <h2 className="text-base font-black text-slate-950">
              Әзірге мұғалім жоқ
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Supabase-та кемінде бір мұғалім аккаунты болуы керек. Мысалы:
              teacher@test.kz аккаунтын role = teacher қылып қойыңыз.
            </p>

            <div className="mt-4">
              <Button href="/db-test" variant="secondary">
                Database тексеру
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <form key={teacher.id} action={selectTeacherAction}>
                <input type="hidden" name="teacher_id" value={teacher.id} />

                <div className="compact-card flex items-center gap-3 p-4 transition hover:border-[#5b3ee4]/40 hover:shadow-md">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f0edff]">
                    <GraduationCap className="h-5 w-5 text-[#5b3ee4]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-black text-slate-950">
                      {teacher.full_name}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {teacher.email || "Физика пәні мұғалімі"}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-[#ddd6ff] bg-[#f0edff] px-3 text-xs font-black text-[#5b3ee4] transition hover:bg-[#e7e1ff]"
                  >
                    Таңдау
                  </button>
                </div>
              </form>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-slate-950">
            Бұл не үшін керек?
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Оқушы мұғалімді таңдағаннан кейін, мұғалім сол оқушының жеке
            прогресін, тапсырмаларын, зертханалық жұмыстарын және әлсіз
            тақырыптарын көре алады.
          </p>
        </div>
      </section>
    </main>
  );
}