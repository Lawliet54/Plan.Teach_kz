import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Atom,
  CheckCircle2,
  ClipboardCheck,
  Heart,
  UserRoundCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type OnboardingStep = "teacher" | "diagnostic" | "interests";

type OnboardingShellProps = {
  currentStep: OnboardingStep;
  title: string;
  description: string;
  children: React.ReactNode;
};

type StepItem = {
  key: OnboardingStep;
  title: string;
  description: string;
  icon: LucideIcon;
};

const steps: StepItem[] = [
  {
    key: "teacher",
    title: "Мұғалімді таңдау",
    description: "Өз мұғаліміңізге тіркеліңіз.",
    icon: UserRoundCheck,
  },
  {
    key: "diagnostic",
    title: "Диагностика",
    description: "Бастапқы деңгейіңізді анықтаңыз.",
    icon: ClipboardCheck,
  },
  {
    key: "interests",
    title: "Қызығушылықтар",
    description: "Өзіңізге қызық бағыттарды таңдаңыз.",
    icon: Heart,
  },
];

export function OnboardingShell({
  currentStep,
  title,
  description,
  children,
}: OnboardingShellProps) {
  const activeIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-3 py-3 sm:px-5 sm:py-5">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] w-full max-w-6xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[250px_1fr]">
        <aside className="bg-[var(--navy)] px-4 py-4 text-white sm:px-5 lg:py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] bg-[var(--primary)]">
              <Atom className="h-4 w-4" />
            </span>

            <span className="text-sm font-black">Plan.Teach_kz</span>
          </Link>

          <div className="mt-5 hidden lg:block">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/45">
              Алғашқы баптау
            </p>

            <h2 className="mt-2 text-lg font-black leading-tight">
              Жеке оқу бағытын дайындаймыз
            </h2>

            <p className="mt-2 text-xs leading-5 text-white/60">
              Бұл қадамдар тек алғашқы тіркелу кезінде бір рет орындалады.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 lg:mt-6 lg:grid-cols-1">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const completed = index < activeIndex;
              const active = step.key === currentStep;

              return (
                <div
                  key={step.key}
                  className={cn(
                    "rounded-[var(--radius-md)] border p-2 transition lg:flex lg:items-start lg:gap-2.5 lg:p-3",
                    active
                      ? "border-white/25 bg-white/12"
                      : completed
                        ? "border-white/10 bg-white/[0.06]"
                        : "border-white/10 bg-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)]",
                      active
                        ? "bg-[var(--primary)] text-white"
                        : completed
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white/55"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  <div className="mt-2 min-w-0 lg:mt-0">
                    <p
                      className={cn(
                        "truncate text-[10px] font-extrabold lg:text-xs",
                        active
                          ? "text-white"
                          : completed
                            ? "text-white/80"
                            : "text-white/55"
                      )}
                    >
                      {index + 1}. {step.title}
                    </p>

                    <p className="mt-1 hidden text-[11px] leading-4 text-white/50 lg:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-6">
          <div className="mb-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)]">
              {activeIndex + 1}-қадам / {steps.length}
            </p>

            <h1 className="mt-1 text-xl font-black tracking-[-0.02em] text-[var(--text)] sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
              {description}
            </p>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}