"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { CardTitle } from "@/components/ui/Card";
import { levelLabels, type Grade, type PhysicsTopic, type TopicLevel } from "@/data/physicsTopics";
import {
  clearTaskSession,
  saveTaskSession,
  type TaskSessionResult,
  type TaskSessionState,
} from "@/lib/taskSession";
import {
  calculateTaskSessionResult,
  createTaskResultHistoryItem,
  getTaskResultRecommendation,
  saveTaskResultHistory,
  buildTaskResultAiAdvice,
} from "@/lib/taskSessionResult";
import { saveAdaptiveAttempt } from "@/lib/adaptiveEngine";
import { getNextTopicTargetInGrade } from "@/lib/learningProgress";

type ResultTaskStepProps = {
  grade: Grade;
  topic: PhysicsTopic;
  level: TopicLevel;
  session: TaskSessionState;
  onSessionChange: (session: TaskSessionState) => void;
};

function getResultTheme(percent: number) {
  if (percent >= 90) {
    return {
      box: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
      title: "Өте жақсы!",
      icon: Trophy,
    };
  }

  if (percent >= 70) {
    return {
      box: "border-[#ddd6ff] bg-[#f1efff]",
      text: "text-[#5b4ce6]",
      title: "Тақырып өтті",
      icon: CheckCircle2,
    };
  }

  return {
    box: "border-amber-200 bg-amber-50",
    text: "text-amber-700",
    title: "Қайта тапсыру керек",
    icon: RotateCcw,
  };
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${
          safeValue >= 70 ? "bg-[#5b4ce6]" : "bg-amber-500"
        }`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export function ResultTaskStep({
  grade,
  topic,
  level,
  session,
  onSessionChange,
}: ResultTaskStepProps) {
  const didSaveRef = useRef(false);

  const [result, setResult] = useState<TaskSessionResult | null>(
    session.result
  );

  useEffect(() => {
    if (didSaveRef.current) return;

    didSaveRef.current = true;

    if (session.result && session.completedAt) {
      setResult(session.result);
      return;
    }

    const calculatedResult = calculateTaskSessionResult({
      topic,
      level,
      session,
    });

    const completedAt = new Date().toISOString();

    saveAdaptiveAttempt({
      grade,
      topicSlug: topic.slug,
      level,
      percent: calculatedResult.percent,
      correct: calculatedResult.correct,
      total: calculatedResult.total,
    });

    const nextSession: TaskSessionState = {
      ...session,
      result: calculatedResult,
      completedAt,
      updatedAt: completedAt,
    };

    saveTaskSession(nextSession);

    saveTaskResultHistory(
      createTaskResultHistoryItem({
        topic,
        level,
        result: calculatedResult,
        completedAt,
      })
    );

    setResult(calculatedResult);
    onSessionChange(nextSession);
  }, [grade, level, onSessionChange, session, topic]);

  const nextTarget = useMemo(() => {
    if (!result || result.percent < 70) return null;

    return getNextTopicTargetInGrade(grade);
  }, [grade, result]);

  if (!result) {
    return (
      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-semibold text-slate-500">
          Нәтиже есептеліп жатыр...
        </p>
      </section>
    );
  }

  const theme = getResultTheme(result.percent);
  const Icon = theme.icon;
  const passed = result.percent >= 70;
  const advice = buildTaskResultAiAdvice({
    topic,
    level,
    session,
    result,
  });

  function handleRetry() {
    clearTaskSession({
      grade,
      topicSlug: topic.slug,
      level,
    });

    window.location.href = `/tasks/session?grade=${grade}&topic=${topic.slug}&level=${level}`;
  }

  return (
    <section className="space-y-3">
      <div className={`rounded-[10px] border p-4 shadow-sm sm:p-5 ${theme.box}`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm">
              <Icon className={`h-5 w-5 ${theme.text}`} />
            </div>

            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.18em] ${theme.text}`}>
                Қорытынды нәтиже
              </p>

              <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                {theme.title}
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-700">
                {getTaskResultRecommendation(result.percent)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 text-left shadow-sm sm:text-right">
            <p className="text-[11px] font-bold text-slate-500">Жалпы нәтиже</p>
            <p className="text-2xl font-black text-slate-950 sm:text-3xl">
              {result.percent}%
            </p>
            <p className="text-xs font-bold text-slate-500">
              {result.correct}/{result.total} дұрыс
            </p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={result.percent} />
        </div>
      </div>

      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#5b4ce6]" />
          <CardTitle>Кезеңдер бойынша нәтиже</CardTitle>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {result.stepScores.map((step) => {
            const stepPassed = step.percent >= 70;

            return (
              <div
                key={step.stepId}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-950">
                    {step.title}
                  </p>

                  {stepPassed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <p className="text-2xl font-black text-slate-950">
                  {step.percent}%
                </p>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  {step.correct}/{step.total} дұрыс
                </p>

                <div className="mt-3">
                  <ProgressBar value={step.percent} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>AI кеңесі</CardTitle>
        </div>

        <div className="rounded-2xl border border-[#ddd6ff] bg-[#f8f7ff] p-3">
            <p className="text-sm font-black text-slate-950">
            {advice.title}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
            {advice.summary}
            </p>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Дамытатын тұстар
                </p>

                <div className="space-y-2">
                {advice.focusAreas.map((item, index) => (
                    <div
                    key={`${item}-${index}`}
                    className="flex gap-2 text-sm font-semibold leading-6 text-slate-700"
                    >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b4ce6]" />
                    <span>{item}</span>
                    </div>
                ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Қате тапсырмалар бойынша кеңес
                </p>

                <div className="space-y-2">
                {advice.mistakeHints.map((item, index) => (
                    <div
                    key={`${item}-${index}`}
                    className="rounded-xl bg-slate-50 p-2 text-sm font-semibold leading-6 text-slate-700"
                    >
                    {item}
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
      </section>

      <section className="flex flex-col gap-2 rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-950">
            Келесі әрекет
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Нәтиже тарихы “Нәтижелер” бетінде сақталады.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {passed && nextTarget ? (
            <Link
              href={nextTarget.href}
              className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
            >
              Келесі тақырыпқа өту
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          ) : null}

          {!passed ? (
            <Link
              href={`/topics/${grade}/${topic.slug}?level=${level}`}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Тақырыпты қайта оқу
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Қайта тапсыру
          </button>

          <Link
            href="/results"
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-4 text-sm font-bold text-[#5b4ce6] transition hover:bg-[#ebe7ff]"
          >
            Нәтижелер бетіне өту
          </Link>
        </div>
      </section>
    </section>
  );
}