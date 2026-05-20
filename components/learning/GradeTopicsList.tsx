"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Lock,
  RotateCcw,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { levelLabels, type Grade } from "@/data/physicsTopics";
import {
  getGradeLearningStates,
  type TopicLearningState,
} from "@/lib/learningProgress";

type GradeTopicsListProps = {
  grade: Grade;
  profileLevel?: string | null;
};

function getStatusLabel(state: TopicLearningState) {
  if (state.status === "completed") return "Аяқталды";
  if (state.status === "locked") return "Жабық";

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return "Қайта тапсыру керек";
  }

  if (state.attempts > 0) return "Жалғастыру";
  return "Бастауға дайын";
}

function getStatusClass(state: TopicLearningState) {
  if (state.status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (state.status === "locked") {
    return "border-slate-200 bg-slate-100 text-slate-500";
  }

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-[#ddd6ff] bg-[#f1efff] text-[#5b4ce6]";
}

function getIcon(state: TopicLearningState) {
  if (state.status === "completed") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (state.status === "locked") {
    return <Lock className="h-4 w-4" />;
  }

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return <RotateCcw className="h-4 w-4" />;
  }

  return <CircleDot className="h-4 w-4" />;
}

function getActionLabel(state: TopicLearningState) {
  if (state.status === "completed") return "Қайталау";
  if (state.status === "locked") return "Жабық";

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return "Қайта тапсыру";
  }

  if (state.attempts > 0) return "Жалғастыру";
  return "Бастау";
}

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

export function GradeTopicsList({ grade, profileLevel }: GradeTopicsListProps) {
  const [states, setStates] = useState<TopicLearningState[]>([]);

  useEffect(() => {
    setStates(getGradeLearningStates(grade, profileLevel));
  }, [grade, profileLevel]);

  const completedCount = states.filter(
    (state) => state.status === "completed"
  ).length;

  const totalCount = states.length;
  const gradeProgress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  if (states.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-500">
          Бұл сыныпқа тақырыптар әлі енгізілмеген.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Оқу реті</CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Тақырыптар ретімен ашылады. Келесі тақырыпты ашу үшін қазіргі
              тақырыпты кемінде 70% нәтижемен аяқтау керек.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-3 py-2">
            <p className="text-[11px] font-bold text-[#5b4ce6]">
              Сынып прогресі
            </p>
            <p className="text-sm font-black text-slate-950">
              {completedCount}/{totalCount}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">
              Аяқталған тақырыптар
            </span>
            <span className="font-black text-slate-800">
              {gradeProgress}%
            </span>
          </div>

          <ProgressBar value={gradeProgress} />
        </div>
      </Card>

      <div className="space-y-3">
        {states.map((state, index) => {
          const isLocked = state.status === "locked";

          return (
            <article
              key={state.topic.id}
              className={`rounded-[10px] border bg-white p-4 shadow-sm transition ${
                isLocked
                  ? "border-slate-200 opacity-75"
                  : "border-slate-200 hover:border-[#cfc6ff]"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                        state.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : isLocked
                            ? "bg-slate-100 text-slate-400"
                            : "bg-[#f1efff] text-[#5b4ce6]"
                      }`}
                    >
                      {state.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isLocked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-black">{index + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-black text-slate-950 sm:text-lg">
                          {state.topic.title}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
                            state
                          )}`}
                        >
                          {getIcon(state)}
                          {getStatusLabel(state)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {state.topic.unit}
                      </p>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {state.topic.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">
                        Берілетін деңгей
                      </p>
                      <p className="mt-1 text-sm font-black text-[#5b4ce6]">
                        {levelLabels[state.level]}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">
                        Соңғы нәтиже
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-950">
                        {state.lastPercent !== null
                          ? `${state.lastPercent}%`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-bold text-slate-500">
                        Тапсыру саны
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-950">
                        {state.attempts}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">
                        Тақырып прогресі
                      </span>
                      <span className="font-black text-slate-800">
                        {state.progressPercent}%
                      </span>
                    </div>

                    <ProgressBar value={state.progressPercent} />
                  </div>

                  {isLocked && state.lockReason ? (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-500">
                      {state.lockReason}
                    </div>
                  ) : null}

                  {!isLocked &&
                  state.attempts > 1 &&
                  (state.lastPercent ?? 0) < 70 ? (
                    <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">
                      Бұл тақырып бірнеше рет тапсырылды, бірақ 70%-дан төмен.
                      AI көмекші арқылы әлсіз жерлерді қарап, қайта тапсыру
                      ұсынылады.
                    </div>
                  ) : null}
                </div>

                <div className="w-full shrink-0 md:w-[180px]">
                  {isLocked ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-400"
                    >
                      <Lock className="mr-1.5 h-4 w-4" />
                      Жабық
                    </button>
                  ) : (
                    <Link
                      href={state.href}
                      className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
                    >
                      {getActionLabel(state)}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
