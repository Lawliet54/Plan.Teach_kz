import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { roleLabels } from "@/lib/types";

export default async function DbTestPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, level, teacher_id")
    .limit(8);

  const { data: teachers, error: teachersError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("role", "teacher")
    .limit(8);

  return (
    <main className="min-h-screen bg-[#f6f8fc] px-4 py-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4f31d4]">
              Database test
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              Profiles және мұғалімдер кестесін тексеру
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Бұл бет 3-қадамдағы Supabase schema дұрыс қосылғанын тексереді.
            </p>
          </div>

          <Button href="/" variant="secondary">
            Басты бет
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardTitle>Auth user</CardTitle>
            <CardText>
              {user?.email ? user.email : "Қазір аккаунтқа кірмегенсіз"}
            </CardText>
          </Card>

          <Card>
            <CardTitle>Profiles</CardTitle>
            <CardText>
              {profilesError
                ? profilesError.message
                : `${profiles?.length ?? 0} жазба көрінді`}
            </CardText>
          </Card>

          <Card>
            <CardTitle>Teachers</CardTitle>
            <CardText>
              {teachersError
                ? teachersError.message
                : `${teachers?.length ?? 0} мұғалім табылды`}
            </CardText>
          </Card>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Card>
            <CardTitle>Profiles тізімі</CardTitle>

            <div className="mt-3 space-y-2">
              {profiles && profiles.length > 0 ? (
                profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                    <p className="mt-1 text-xs font-semibold text-[#4f31d4]">
                      {roleLabels[profile.role as keyof typeof roleLabels] ??
                        profile.role}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Әзірге profile көрінбейді. Алдымен user тіркеу керек.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <CardTitle>Мұғалімдер</CardTitle>

            <div className="mt-3 space-y-2">
              {teachers && teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-bold text-slate-950">
                      {teacher.full_name}
                    </p>
                    <p className="text-xs text-slate-500">{teacher.email}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Әзірге мұғалім жоқ. 4-қадамда тіркелу формасы арқылы мұғалім
                  аккаунтын жасаймыз.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}