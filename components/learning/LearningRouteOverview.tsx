"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  RotateCcw,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/Card";
import { levelLabels } from "@/data/physicsTopics";
import {
  getContinueLearningTarget,
  getGradeLearningStates,
  type TopicLearningState,
} from "@/lib/learningProgress";

type RouteSnapshot = {
  current: TopicLearningState;
  next: TopicLearningState | null;
  completedCount: number;
  totalCount: number;
  progressPercent: number;
};

function getStatusText(state: TopicLearningState) {
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

function getActionLabel(state: TopicLearningState) {
  if (state.status === "completed") return "Қайталау";
  if (state.status === "locked") return "Жабық";
  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return "Қайта тапсыру";
  }

  if (state.attempts > 0) return "Жалғастыру";
  return "Бастау";
}

function buildSnapshot(profileLevel?: string | null): RouteSnapshot | null {
  const target = getContinueLearningTarget(profileLevel);
  const states = getGradeLearningStates(target.topic.grade, profileLevel);

  const current =
    states.find((state) => state.topic.id === target.topic.id) ??
    states.find((state) => state.status === "current") ??
    states[0];

  if (!current) return null;

  const currentIndex = states.findIndex(
    (state) => state.topic.id === current.topic.id
  );

  const next = currentIndex >= 0 ? states[currentIndex + 1] ?? null : null;

  const completedCount = states.filter(
    (state) => state.status === "completed"
  ).length;

  const totalCount = states.length;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    current,
    next,
    completedCount,
    totalCount,
    progressPercent,
  };
}

function TopicProgressLine({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-bold text-slate-500">{label}</span>
        <span className="font-black text-slate-800">{safeValue}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#5b4ce6]"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

type LearningRouteOverviewProps = {
  profileLevel?: string | null;
};

export function LearningRouteOverview({
  profileLevel,
}: LearningRouteOverviewProps) {
  const [snapshot, setSnapshot] = useState<RouteSnapshot | null>(null);

  useEffect(() => {
    setSnapshot(buildSnapshot(profileLevel));
  }, [profileLevel]);

  if (!snapshot) {
    return null;
  }

  const current = snapshot.current;
  const next = snapshot.next;

  return (
    <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Қазіргі оқу тақырыбы</CardTitle>
          </div>

          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
              current
            )}`}
          >
            {getStatusText(current)}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500">
                {current.topic.grade}-сынып · {current.topic.unit}
              </p>

              <h3 className="mt-1 text-base font-black text-slate-950">
                {current.topic.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {current.topic.description}
              </p>
            </div>

            <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-left shadow-sm sm:text-right">
              <p className="text-[11px] font-bold text-slate-500">Деңгей</p>
              <p className="text-sm font-black text-[#5b4ce6]">
                {levelLabels[current.level]}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500">
                Соңғы нәтиже
              </p>
              <p className="text-sm font-black text-slate-950">
                {current.lastPercent !== null ? `${current.lastPercent}%` : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500">
                Тапсыру саны
              </p>
              <p className="text-sm font-black text-slate-950">
                {current.attempts}
              </p>
            </div>

            <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
              <p className="text-[11px] font-bold text-slate-500">
                Өту шарты
              </p>
              <p className="text-sm font-black text-slate-950">70%+</p>
            </div>
          </div>

          <div className="mt-3">
            <TopicProgressLine
              value={current.progressPercent}
              label="Тақырып прогресі"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={current.href}
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
          >
            {current.attempts > 0 && (current.lastPercent ?? 0) < 70 ? (
              <RotateCcw className="mr-1.5 h-4 w-4" />
            ) : (
              <PlayCircle className="mr-1.5 h-4 w-4" />
            )}
            {getActionLabel(current)}
          </Link>

          <Link
            href={`/topics/${current.topic.grade}`}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Барлық тақырыптар
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
          <CardTitle>Келесі тақырып</CardTitle>
        </div>

        {next ? (
          <div
            className={`rounded-2xl border p-3 ${
              next.canOpen
                ? "border-[#ddd6ff] bg-[#f1efff]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${
                  next.canOpen
                    ? "bg-white text-[#5b4ce6]"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {next.canOpen ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-500">
                  {next.topic.grade}-сынып · {levelLabels[next.level]}
                </p>

                <h3 className="mt-1 text-base font-black text-slate-950">
                  {next.topic.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {next.canOpen
                    ? "Бұл тақырып ашық. Қазіргі тақырып аяқталғаннан кейін осы тақырыпты жалғастырасыз."
                    : next.lockReason ??
                      "Алдымен алдыңғы тақырыпты аяқтау қажет."}
                </p>
              </div>
            </div>

            {next.canOpen ? (
              <Link
                href={next.href}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
              >
                Келесі тақырыпқа өту
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            ) : (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-bold leading-5 text-slate-500">
                Келесі тақырыпты ашу үшін қазіргі тақырыпты кемінде 70% нәтижемен
                аяқтау керек.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-black text-emerald-800">
              Бұл сыныптың барлық тақырыбы аяқталды
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-700">
              Келесі сыныпқа немесе қайталау тапсырмаларына өтуге болады.
            </p>
          </div>
        )}

        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500">
              Сынып бойынша прогресс
            </span>
            <span className="font-black text-slate-800">
              {snapshot.completedCount}/{snapshot.totalCount}
            </span>
          </div>

          <TopicProgressLine
            value={snapshot.progressPercent}
            label="Аяқталған тақырыптар"
          />
        </div>
      </Card>
    </section>
  );
}
