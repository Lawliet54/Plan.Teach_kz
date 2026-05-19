import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

export default async function AuthCheckPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = user
    ? await supabase
        .from("profiles")
        .select("id, email, full_name, role, teacher_id, diagnostic_completed, onboarding_completed")
        .eq("id", user.id)
        .single()
    : { data: null, error: null };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-2xl">
        <Card>
          <CardTitle>Auth тексеру</CardTitle>
          <CardText>
            Бұл бет session және profile дұрыс келіп тұрғанын тексереді.
          </CardText>

          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-black text-slate-950">User</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                {JSON.stringify(
                  {
                    email: user?.email ?? null,
                    id: user?.id ?? null,
                    error: userError?.message ?? null,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-black text-slate-950">Profile</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
                {JSON.stringify(
                  {
                    profile,
                    error: profileError?.message ?? null,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}