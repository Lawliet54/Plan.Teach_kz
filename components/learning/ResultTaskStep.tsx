"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCw,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";

import { CardTitle } from "@/components/ui/Card";
import {
  type Grade,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import {
  clearTaskSession,
  saveTaskSession,
  type TaskSessionResult,
  type TaskSessionState,
} from "@/lib/taskSession";
import {
  buildTaskResultAiAdvice,
  calculateTaskSessionResult,
  createTaskResultHistoryItem,
  getTaskResultRecommendation,
  saveTaskResultHistory,
} from "@/lib/taskSessionResult";
import { saveAdaptiveAttemptRemote } from "@/lib/adaptiveEngine";
import { getNextTopicTargetInGrade } from "@/lib/learningProgress";

type ResultTaskStepProps = {
  grade: Grade;
  topic: PhysicsTopic;
  level: TopicLevel;
  profileLevel?: string | null;
  session: TaskSessionState;
  onSessionChange: (session: TaskSessionState) => void;
};

type RemoteSaveStatus = "idle" | "saving" | "saved" | "error";

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
  profileLevel,
  session,
  onSessionChange,
}: ResultTaskStepProps) {
  const didCalculateRef = useRef(false);
  const savingRef = useRef(false);

  const [result, setResult] = useState<TaskSessionResult | null>(
    session.result
  );

  const [remoteSaveStatus, setRemoteSaveStatus] =
    useState<RemoteSaveStatus>(
      session.adaptiveSavedAt
        ? "saved"
        : session.adaptiveSaveError
          ? "error"
          : "idle"
    );

  const [remoteSaveError, setRemoteSaveError] = useState<string | null>(
    session.adaptiveSaveError
  );

  const [progressVersion, setProgressVersion] = useState(0);

  useEffect(() => {
    if (didCalculateRef.current) return;

    didCalculateRef.current = true;

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

    const nextSession: TaskSessionState = {
      ...session,
      result: calculatedResult,
      completedAt,
      updatedAt: completedAt,
      adaptiveSavedAt: null,
      adaptiveSaveError: null,
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
  }, [level, onSessionChange, session, topic]);

  useEffect(() => {
    if (!result || !session.completedAt) return;

    if (session.adaptiveSavedAt) {
      setRemoteSaveStatus("saved");
      setRemoteSaveError(null);
      return;
    }

    if (session.adaptiveSaveError) {
      setRemoteSaveStatus("error");
      setRemoteSaveError(session.adaptiveSaveError);
      return;
    }

    if (savingRef.current) return;

    savingRef.current = true;
    setRemoteSaveStatus("saving");
    setRemoteSaveError(null);

    let active = true;

    void saveAdaptiveAttemptRemote({
      grade,
      topicSlug: topic.slug,
      level,
      percent: result.percent,
      correct: result.correct,
      total: result.total,
    })
      .then(() => {
        if (!active) return;

        const savedAt = new Date().toISOString();

        const nextSession: TaskSessionState = {
          ...session,
          result,
          adaptiveSavedAt: savedAt,
          adaptiveSaveError: null,
          updatedAt: savedAt,
        };

        saveTaskSession(nextSession);
        onSessionChange(nextSession);

        setRemoteSaveStatus("saved");
        setRemoteSaveError(null);
        setProgressVersion((value) => value + 1);
      })
      .catch((error: unknown) => {
        if (!active) return;

        const message =
          error instanceof Error
            ? error.message
            : "Нәтижені сақтау мүмкін болмады.";

        const nextSession: TaskSessionState = {
          ...session,
          result,
          adaptiveSavedAt: null,
          adaptiveSaveError: message,
          updatedAt: new Date().toISOString(),
        };

        saveTaskSession(nextSession);
        onSessionChange(nextSession);

        setRemoteSaveStatus("error");
        setRemoteSaveError(message);
      })
      .finally(() => {
        savingRef.current = false;
      });

    return () => {
      active = false;
    };
  }, [grade, level, onSessionChange, result, session, topic.slug]);

  const nextTarget = useMemo(() => {
    // Remote save completion increments this signal so the next-topic lookup is recalculated.
    void progressVersion;

    if (!result || result.percent < 70 || remoteSaveStatus !== "saved") {
      return null;
    }

    return getNextTopicTargetInGrade(grade, profileLevel);
  }, [grade, profileLevel, progressVersion, remoteSaveStatus, result]);

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

  function handleRemoteSaveRetry() {
    const nextSession: TaskSessionState = {
      ...session,
      adaptiveSaveError: null,
      adaptiveSavedAt: null,
      updatedAt: new Date().toISOString(),
    };

    savingRef.current = false;
    setRemoteSaveStatus("idle");
    setRemoteSaveError(null);

    saveTaskSession(nextSession);
    onSessionChange(nextSession);
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

      <section className="rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm">
        {remoteSaveStatus === "saving" ? (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-[#5b4ce6]" />
            Нәтиже базаға сақталып жатыр...
          </div>
        ) : null}

        {remoteSaveStatus === "saved" ? (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Нәтиже базаға сәтті сақталды.
          </div>
        ) : null}

        {remoteSaveStatus === "error" ? (
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-2 text-xs font-bold leading-5 text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{remoteSaveError || "Нәтижені сақтау мүмкін болмады."}</span>
            </div>

            <button
              type="button"
              onClick={handleRemoteSaveRetry}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Қайта сақтау
            </button>
          </div>
        ) : null}
      </section>

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
          <p className="text-sm font-black text-slate-950">{advice.title}</p>

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
          <p className="text-sm font-black text-slate-950">Келесі әрекет</p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Келесі тақырып нәтиже базаға сақталғаннан кейін ашылады.
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