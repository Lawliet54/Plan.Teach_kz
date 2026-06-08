"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDot,
  Layers3,
  Loader2,
  Lock,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { levelLabels, type Grade } from "@/data/physicsTopics";
import {
  getGradeLearningStates,
  type TopicLearningState,
} from "@/lib/learningProgress";
import { fetchAdaptiveProgress } from "@/lib/adaptiveEngine";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";

type GradeTopicsListProps = {
  grade: Grade;
  profileLevel?: string | null;
};

type UnitGroup = {
  unit: string;
  states: TopicLearningState[];
};

function getStatusLabel(state: TopicLearningState) {
  if (state.status === "completed") return "Аяқталды";
  if (state.status === "locked") return "Жабық";

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return "Қайталау қажет";
  }

  if (state.attempts > 0) return "Жалғастыру";

  return "Бастауға дайын";
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

function getStatusClasses(state: TopicLearningState) {
  if (state.status === "completed") {
    return "border-[#bbf7d0] bg-[var(--green-soft)] text-[var(--success)]";
  }

  if (state.status === "locked") {
    return "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]";
  }

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return "border-[#fde68a] bg-[var(--yellow-soft)] text-[var(--warning)]";
  }

  return "border-[var(--border-accent)] bg-[var(--purple-soft)] text-[var(--primary)]";
}

function getTopicIcon(state: TopicLearningState, number: number) {
  if (state.status === "completed") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (state.status === "locked") {
    return <Lock className="h-4 w-4" />;
  }

  if (state.attempts > 0 && (state.lastPercent ?? 0) < 70) {
    return <RotateCcw className="h-4 w-4" />;
  }

  return <span className="text-xs font-black">{number}</span>;
}

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function TopicCard({
  state,
  number,
}: {
  state: TopicLearningState;
  number: number;
}) {
  const locked = state.status === "locked";

  return (
    <article
      className={cn(
        "rounded-[var(--radius-md)] border bg-white p-3 transition sm:p-4",
        locked
          ? "border-[var(--border)] opacity-75"
          : "border-[var(--border)] hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-xs)]"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)]",
            state.status === "completed"
              ? "bg-[var(--green-soft)] text-[var(--success)]"
              : locked
                ? "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                : state.attempts > 0 && (state.lastPercent ?? 0) < 70
                  ? "bg-[var(--yellow-soft)] text-[var(--warning)]"
                  : "bg-[var(--purple-soft)] text-[var(--primary)]"
          )}
        >
          {getTopicIcon(state, number)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black leading-5 text-[var(--text)] sm:text-base">
                {state.topic.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                {state.topic.description}
              </p>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-extrabold",
                getStatusClasses(state)
              )}
            >
              {state.status === "completed" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : state.status === "locked" ? (
                <Lock className="h-3 w-3" />
              ) : state.attempts > 0 && (state.lastPercent ?? 0) < 70 ? (
                <RotateCcw className="h-3 w-3" />
              ) : (
                <CircleDot className="h-3 w-3" />
              )}

              {getStatusLabel(state)}
            </span>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_92px_92px] sm:items-end">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold text-[var(--text-muted)]">
                  Тақырып прогресі
                </p>

                <p className="text-[10px] font-extrabold text-[var(--text-soft)]">
                  {state.progressPercent}%
                </p>
              </div>

              <ProgressBar value={state.progressPercent} />
            </div>

            <div className="rounded-[var(--radius-sm)] bg-[var(--surface-soft)] px-2 py-1.5">
              <p className="text-[10px] font-semibold text-[var(--text-muted)]">
                Деңгей
              </p>

              <p className="mt-0.5 truncate text-[11px] font-extrabold text-[var(--primary)]">
                {levelLabels[state.level]}
              </p>
            </div>

            <div className="rounded-[var(--radius-sm)] bg-[var(--surface-soft)] px-2 py-1.5">
              <p className="text-[10px] font-semibold text-[var(--text-muted)]">
                Соңғы нәтиже
              </p>

              <p className="mt-0.5 text-[11px] font-extrabold text-[var(--text)]">
                {state.lastPercent !== null ? `${state.lastPercent}%` : "—"}
              </p>
            </div>
          </div>

          {locked && state.lockReason ? (
            <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--surface-soft)] px-2.5 py-2 text-[11px] leading-4 text-[var(--text-muted)]">
              {state.lockReason}
            </p>
          ) : null}

          {!locked &&
          state.attempts > 0 &&
          (state.lastPercent ?? 0) < 70 ? (
            <p className="mt-3 rounded-[var(--radius-sm)] bg-[var(--yellow-soft)] px-2.5 py-2 text-[11px] font-semibold leading-4 text-[var(--warning)]">
              Қосымша түсіндіруді қарап, тапсырманы қайта орындаңыз.
            </p>
          ) : null}

          <div className="mt-3 flex justify-end">
            {locked ? (
              <button
                type="button"
                disabled
                className="inline-flex h-8 cursor-not-allowed items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-xs font-bold text-[var(--text-muted)]"
              >
                <Lock className="h-3.5 w-3.5" />
                Жабық
              </button>
            ) : (
              <Link
                href={state.href}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary)] px-3 text-xs font-bold text-white transition hover:bg-[var(--primary-2)]"
              >
                {getActionLabel(state)}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function GradeTopicsList({
  grade,
  profileLevel,
}: GradeTopicsListProps) {
  const [states, setStates] = useState<TopicLearningState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      await fetchAdaptiveProgress(grade);
      setStates(getGradeLearningStates(grade, profileLevel));
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Прогресті жүктеу мүмкін болмады."
      );
    } finally {
      setIsLoading(false);
    }
  }, [grade, profileLevel]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const unitGroups = useMemo<UnitGroup[]>(() => {
    const grouped = new Map<string, TopicLearningState[]>();

    states.forEach((state) => {
      const currentStates = grouped.get(state.topic.unit) ?? [];
      currentStates.push(state);
      grouped.set(state.topic.unit, currentStates);
    });

    return Array.from(grouped.entries()).map(([unit, groupedStates]) => ({
      unit,
      states: groupedStates,
    }));
  }, [states]);

  if (isLoading) {
    return (
      <Card className="grid min-h-[180px] place-items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
          Прогресс жүктеліп жатыр...
        </div>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="py-6 text-center">
        <p className="text-sm font-bold text-rose-700">{loadError}</p>

        <button
          type="button"
          onClick={() => void loadProgress()}
          className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Қайта жүктеу
        </button>
      </Card>
    );
  }

  if (states.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-[var(--text-muted)]">
          Бұл сыныпқа тақырыптар әлі енгізілмеген.
        </p>
      </Card>
    );
  }

  const completedCount = states.filter(
    (state) => state.status === "completed"
  ).length;

  const totalCount = states.length;

  const gradeProgress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  let globalTopicNumber = 0;

  return (
    <div className="space-y-3">
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Сынып бойынша прогресс</CardTitle>

            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              Аяқталған тақырыптар саны және жалпы оқу барысы.
            </p>
          </div>

          <Badge variant="primary">
            {completedCount}/{totalCount} тақырып
          </Badge>
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Жалпы прогресс
            </p>

            <p className="text-xs font-black text-[var(--text)]">
              {gradeProgress}%
            </p>
          </div>

          <ProgressBar value={gradeProgress} />
        </div>
      </Card>

      {unitGroups.map((group, unitIndex) => {
        const completedInUnit = group.states.filter(
          (state) => state.status === "completed"
        ).length;

        const unitProgress = Math.round(
          (completedInUnit / group.states.length) * 100
        );

        return (
          <section
            key={group.unit}
            className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[var(--shadow-xs)]"
          >
            <header className="border-b border-[var(--border-soft)] bg-[var(--surface-soft)] px-3 py-3 sm:px-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--purple-soft)] text-[var(--primary)]">
                    <Layers3 className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--primary)]">
                      {unitIndex + 1}-бөлім
                    </p>

                    <h2 className="mt-0.5 text-sm font-black text-[var(--text)] sm:text-base">
                      {group.unit}
                    </h2>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge>
                    <BookOpen className="h-3 w-3" />
                    {group.states.length} тақырып
                  </Badge>

                  <Badge variant={unitProgress === 100 ? "success" : "primary"}>
                    {unitProgress}%
                  </Badge>
                </div>
              </div>
            </header>

            <div className="space-y-2 p-2 sm:p-3">
              {group.states.map((state) => {
                globalTopicNumber += 1;

                return (
                  <TopicCard
                    key={state.topic.id}
                    state={state}
                    number={globalTopicNumber}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}