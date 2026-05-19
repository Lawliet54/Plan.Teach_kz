import Link from "next/link";
import { Atom, GraduationCap, UserRound } from "lucide-react";
import { signUpAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fc] px-4 py-8">
      <section className="w-full max-w-md">
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
            <h1 className="text-xl font-black text-slate-950">Тіркелу</h1>
            <p className="mt-1 text-xs text-slate-500">
              Рөліңізді таңдап, платформаға қосылыңыз.
            </p>
          </div>

          <AuthMessage error={params?.error} success={params?.success} />

          <form action={signUpAction} className="space-y-3">
            <Input
              id="full_name"
              name="full_name"
              label="Аты-жөніңіз"
              placeholder="Мысалы: Тұрсынбек Нұражанұлы"
              required
            />

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
              placeholder="Кемінде 6 таңба"
              required
            />

            <div>
              <p className="mb-2 text-xs font-medium text-slate-700">Рөл</p>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="cursor-pointer rounded-2xl border border-[#4f31d4]/25 bg-[#eef2ff] p-3">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    defaultChecked
                    className="sr-only"
                  />
                  <UserRound className="mb-2 h-4 w-4 text-[#4f31d4]" />
                  <p className="text-xs font-bold text-slate-950">Оқушы</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Диагностикадан өтіп, жеке маршрутпен оқиды.
                  </p>
                </label>

                <label className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-3">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    className="sr-only"
                  />
                  <GraduationCap className="mb-2 h-4 w-4 text-[#061426]" />
                  <p className="text-xs font-bold text-slate-950">Мұғалім</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    Оқушылардың прогресін бақылайды.
                  </p>
                </label>
              </div>

              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Админ аккаунт public тіркелу арқылы жасалмайды. Ол кейін бөлек
                беріледі.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Тіркелу
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Аккаунтыңыз бар ма?{" "}
            <Link href="/login" className="font-semibold text-[#4f31d4]">
              Кіру
            </Link>
          </p>
        </Card>
      </section>
    </main>
  );
}
