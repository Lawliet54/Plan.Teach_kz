import Link from "next/link";
import { Atom } from "lucide-react";
import { signInAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fc] px-4 py-8">
      <section className="w-full max-w-sm">
        <Link href="/" className="mb-5 flex items-center justify-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#061426]">
            <Atom className="h-4 w-4 text-white" />
          </span>
          <span className="text-base font-black text-slate-950">
            Plan.Teach_kz
          </span>
        </Link>

        <Card>
          <div className="mb-4 text-center">
            <h1 className="text-xl font-black text-slate-950">
              Аккаунтқа кіру
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Оқу маршрутыңызды жалғастыру үшін кіріңіз.
            </p>
          </div>

          <AuthMessage error={params?.error} success={params?.success} />

          <form action={signInAction} className="space-y-3">
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="example@mail.com"
              required
            />

            <Input
              id="password"
              name="password"
              label="Құпиясөз"
              type="password"
              placeholder="••••••••"
              required
            />

            <Button type="submit" className="w-full">
              Кіру
            </Button>
          </form>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">
              Тест аккаунт:
            </p>
            <p className="mt-1 text-xs text-slate-500">
              teacher@test.kz / 12345678
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Аккаунтыңыз жоқ па?{" "}
            <Link href="/register" className="font-semibold text-[#4f31d4]">
              Тіркелу
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
