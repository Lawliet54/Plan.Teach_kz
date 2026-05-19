import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function SupabaseTestPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const envReady =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <main className="min-h-screen px-4 py-8">
      <section className="mx-auto max-w-xl">
        <Card>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f31d4]">
            Supabase test
          </p>

          <CardTitle>Supabase байланысын тексеру</CardTitle>

          <CardText>
            Бұл бет `.env.local` және Supabase client дұрыс қосылғанын тексеруге
            арналған.
          </CardText>

          <div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Environment:</span>
              <span className={envReady ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                {envReady ? "дайын" : "толық емес"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">User:</span>
              <span className="font-bold text-slate-900">
                {user ? user.email : "кірмеген"}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Error:</span>
              <span className={error ? "font-bold text-rose-600" : "font-bold text-emerald-600"}>
                {error ? error.message : "жоқ"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Button href="/" variant="secondary">
              Басты бетке қайту
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}