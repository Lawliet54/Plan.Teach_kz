import { redirect } from "next/navigation";
import {
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  UserRoundCheck,
} from "lucide-react";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

const steps = [
  {
    title: "Мұғалімді таңдау",
    text: "Оқушы тіркелгеннен кейін өз мұғалімін таңдайды.",
    icon: UserRoundCheck,
  },
  {
    title: "Диагностика",
    text: "7–11 сынып бойынша 50 сұрақтан тұратын бастапқы тексеру өтеді.",
    icon: ClipboardList,
  },
  {
    title: "AI анализ",
    text: "Жүйе оқушы деңгейін, әлсіз және мықты жақтарын анықтайды.",
    icon: BrainCircuit,
  },
];

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  if (!profile.teacher_id) {
    redirect("/onboarding/teacher-select");
  }

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8">
      <section className="mx-auto max-w-3xl">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl border border-[#d7e3ff] bg-[#eef2ff]">
            <CheckCircle2 className="h-5 w-5 text-[#5b3ee4]" />
          </div>

          <h1 className="text-2xl font-black text-slate-950">
            Оқуды бастамас бұрын
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Plan.Teach_kz алдымен сіздің деңгейіңізді анықтап, соған сай жеке
            оқу бағытын құрады.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.title}>
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl border border-[#d7e3ff] bg-[#eef2ff]">
                  <Icon className="h-4 w-4 text-[#5b3ee4]" />
                </div>

                <CardTitle>{step.title}</CardTitle>
                <CardText>{step.text}</CardText>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 flex justify-center">
          <Button href="/onboarding/teacher-select">Жалғастыру</Button>
        </div>
      </section>
    </main>
  );
}