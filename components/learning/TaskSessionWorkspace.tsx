"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react";
import {
  clearTaskSession,
  createTaskSession,
  getCurrentStep,
  getStepPercent,
  moveTaskSessionBack,
  moveTaskSessionNext,
  readTaskSession,
  saveTaskSession,
  taskSessionSteps,
  type TaskSessionState,
} from "@/lib/taskSession";
import { levelLabels, type Grade, type PhysicsTopic, type TopicLevel } from "@/data/physicsTopics";
import { TestTaskStep } from "@/components/learning/TestTaskStep";
import { isTestStepCompleted } from "@/lib/taskSessionTest";
import { FillBlankTaskStep } from "@/components/learning/FillBlankTaskStep";
import { isFillBlankStepCompleted } from "@/lib/taskSessionFillBlank";
import { MatchingTaskStep } from "@/components/learning/MatchingTaskStep";
import { isMatchingStepCompleted } from "@/lib/taskSessionMatching";
import { ResultTaskStep } from "@/components/learning/ResultTaskStep";

type TaskSessionWorkspaceProps = {
  grade: Grade;
  topic: PhysicsTopic;
  level: TopicLevel;
  profileLevel?: string | null;
  restart?: boolean;
};

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-[#5b4ce6]"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function StepIcon({
  isActive,
  isDone,
}: {
  isActive: boolean;
  isDone: boolean;
}) {
  if (isDone) {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (isActive) {
    return <CircleDot className="h-4 w-4" />;
  }

  return <CircleDot className="h-4 w-4" />;
}

function PlaceholderStep({
  stepId,
  title,
}: {
  stepId: string;
  title: string;
}) {
  const descriptions: Record<string, string> = {
    test: "Келесі 20-қадамда бұл жерде 5 тест сұрағы болады. Оқушы барлық сұраққа жауап беріп, кейін ғана келесі step-ке өтеді.",
    "fill-blank":
      "21-қадамда бұл жерде бос орындарды толтыру тапсырмасы болады.",
    matching:
      "22-қадамда бұл жерде әдемі визуалды сәйкестендіру тапсырмасы болады.",
    result:
      "23-қадамда бұл жерде жалпы нәтиже шығып, adaptive progress сақталады.",
  };

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
          {stepId === "result" ? (
            <FileText className="h-4 w-4" />
          ) : (
            <ClipboardCheck className="h-4 w-4" />
          )}
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">Task session step</p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#ddd6ff] bg-[#f8f7ff] p-4">
        <p className="text-sm font-semibold leading-6 text-slate-700">
          {descriptions[stepId] ?? "Бұл step келесі қадамда толықтырылады."}
        </p>
      </div>
    </section>
  );
}

export function TaskSessionWorkspace({
  grade,
  topic,
  level,
  profileLevel,
  restart = false,
}: TaskSessionWorkspaceProps) {
  const [session, setSession] = useState<TaskSessionState | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
  if (restart) {
    clearTaskSession({
      grade,
      topicSlug: topic.slug,
      level,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete("restart");
    window.history.replaceState({}, "", url.toString());
  }

  const stored = restart
        ? null
        : readTaskSession({
            grade,
            topicSlug: topic.slug,
            level,
        });

    const nextSession =
        stored ??
        createTaskSession({
        grade,
        topic,
        level,
        });

    setSession(nextSession);
    saveTaskSession(nextSession);
    setIsReady(true);
  }, [grade, topic, level, restart]);

  const currentStep = useMemo(() => {
    if (!session) return taskSessionSteps[0];
    return getCurrentStep(session);
  }, [session]);

  const stepPercent = session ? getStepPercent(session) : 0;

  function updateSession(nextSession: TaskSessionState) {
    setSession(nextSession);
    saveTaskSession(nextSession);
  }

  function handleNext() {
    if (!session) return;

    updateSession(moveTaskSessionNext(session));
  }

  function handleBack() {
    if (!session) return;

    updateSession(moveTaskSessionBack(session));
  }

  function handleRestart() {
    const ok = window.confirm("Осы тапсырма сессиясын басынан бастаймыз ба?");

    if (!ok) return;

    clearTaskSession({
      grade,
      topicSlug: topic.slug,
      level,
    });

    const fresh = createTaskSession({
      grade,
      topic,
      level,
    });

    updateSession(fresh);
  }

  if (!isReady || !session) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[10px] border border-slate-200 bg-white text-sm font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Тапсырма жүктеліп жатыр...
        </div>
      </div>
    );
  }

  const isFirstStep = session.currentStepIndex === 0;
  const isLastStep = session.currentStepIndex === taskSessionSteps.length - 1;
  const isCurrentStepReady =
    currentStep.id === "test"
        ? isTestStepCompleted({
            topic,
            level,
            answers: session.answers.test,
        })
        : currentStep.id === "fill-blank"
        ? isFillBlankStepCompleted({
            topic,
            level,
            answers: session.answers.fillBlank,
            })
        : currentStep.id === "matching"
            ? isMatchingStepCompleted({
                topic,
                level,
                answers: session.answers.matching,
            })
            : true;

  return (
    <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4">
      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <Link
              href={`/topics/${grade}/${topic.slug}?level=${level}`}
              className="mb-3 inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 transition hover:bg-white"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Теорияға қайту
            </Link>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
              {grade}-сынып · {levelLabels[level]}
            </p>

            <h1 className="mt-1 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {topic.title}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Тапсырмалар кезең-кезеңмен орындалады. Бір кезең аяқталған соң
              келесі кезеңге өтесіз.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex h-9 w-fit items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Басынан бастау
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">Сессия прогресі</span>
            <span className="font-black text-slate-800">{stepPercent}%</span>
          </div>

          <ProgressBar value={stepPercent} />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {taskSessionSteps.map((step, index) => {
            const isActive = index === session.currentStepIndex;
            const isDone = index < session.currentStepIndex;

            return (
              <div
                key={step.id}
                className={`rounded-xl border p-2.5 ${
                  isActive
                    ? "border-[#ddd6ff] bg-[#f1efff]"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`mb-2 flex items-center gap-2 text-xs font-black ${
                    isActive
                      ? "text-[#5b4ce6]"
                      : isDone
                        ? "text-emerald-700"
                        : "text-slate-500"
                  }`}
                >
                  <StepIcon isActive={isActive} isDone={isDone} />
                  {index + 1}-қадам
                </div>

                <p className="text-[13px] font-black text-slate-950">
                  {step.title}
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {currentStep.id === "test" ? (
        <TestTaskStep
            topic={topic}
            level={level}
            session={session}
            onSessionChange={updateSession}
        />
        ) : currentStep.id === "fill-blank" ? (
        <FillBlankTaskStep
            topic={topic}
            level={level}
            session={session}
            onSessionChange={updateSession}
        />
        ) : currentStep.id === "matching" ? (
        <MatchingTaskStep
            topic={topic}
            level={level}
            session={session}
            onSessionChange={updateSession}
        />
        ) : currentStep.id === "result" ? (
        <ResultTaskStep
            grade={grade}
            topic={topic}
            level={level}
            profileLevel={profileLevel}
            session={session}
            onSessionChange={updateSession}
        />
        ) : (
        <PlaceholderStep stepId={currentStep.id} title={currentStep.title} />
      )}

    
    
      {!isCurrentStepReady ? (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-3 text-center text-xs font-bold text-amber-700">
            Келесі кезеңге өту үшін осы кезеңдегі барлық тапсырманы орындаңыз.
        </div>
      ) : null}

      {currentStep.id !== "result" ? (
        <section className="flex flex-col justify-between gap-2 rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
            <button
            type="button"
            onClick={handleBack}
            disabled={isFirstStep}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Артқа
            </button>

            <div className="text-center text-xs font-semibold text-slate-500">
            {currentStep.title} · {session.currentStepIndex + 1}/
            {taskSessionSteps.length}
            </div>

            <button
            type="button"
            onClick={handleNext}
            disabled={isLastStep || !isCurrentStepReady}
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
            Келесі
            <ArrowRight className="ml-1.5 h-4 w-4" />
            </button>
        </section>
      ) : null}
    </div>
  );
}
