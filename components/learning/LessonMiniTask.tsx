"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Link2,
  ListChecks,
  Loader2,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";

import type {
  LessonMiniTask,
  LessonMiniTaskType,
} from "@/data/lessonMiniTasks";
import type { LessonMiniTaskAnswer } from "@/lib/lessonMiniTask";
import { cn } from "@/lib/utils";

type LessonMiniTaskProps = {
  task: LessonMiniTask;
  nextTopicHref: string;
  nextTopicLabel: string;
};

type ApiResult = {
  isCorrect: boolean;
  message: string;
  isCompleted: boolean;
  attempts: number;
};

type ApiProgressRow = {
  is_completed: boolean;
};

function getTaskTypeLabel(type: LessonMiniTaskType) {
  if (type === "single-choice") {
    return "Бір дұрыс жауап";
  }

  if (type === "multiple-choice") {
    return "Бірнеше дұрыс жауап";
  }

  return "Сәйкестендіру";
}

function getTaskTypeIcon(type: LessonMiniTaskType) {
  if (type === "matching") {
    return Link2;
  }

  if (type === "multiple-choice") {
    return ListChecks;
  }

  return CircleHelp;
}

export function LessonMiniTask({
  task,
  nextTopicHref,
  nextTopicLabel,
}: LessonMiniTaskProps) {
  const [selectedSingleOptionId, setSelectedSingleOptionId] = useState("");
  const [selectedMultipleOptionIds, setSelectedMultipleOptionIds] = useState<
    string[]
  >([]);
  const [matchingPairs, setMatchingPairs] = useState<Record<string, string>>(
    {}
  );

  const [result, setResult] = useState<ApiResult | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const TypeIcon = getTaskTypeIcon(task.type);
  const canGoNext = completed || result?.isCompleted === true;

  const loadProgress = useCallback(async () => {
    setLoadingProgress(true);

    try {
      const response = await fetch(
        `/api/learning/mini-task?grade=${task.grade}&topicSlug=${encodeURIComponent(
          task.topicSlug
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = (await response.json()) as {
        progress?: ApiProgressRow[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Mini-task прогресін оқу мүмкін болмады.");
      }

      setCompleted(Boolean(data.progress?.[0]?.is_completed));
    } catch (currentError) {
      setApiError(
        currentError instanceof Error
          ? currentError.message
          : "Mini-task прогресін оқу мүмкін болмады."
      );
    } finally {
      setLoadingProgress(false);
    }
  }, [task.grade, task.topicSlug]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  function clearResult() {
    setResult(null);
    setApiError(null);
  }

  function toggleMultipleOption(optionId: string) {
    clearResult();

    setSelectedMultipleOptionIds((currentIds) => {
      if (currentIds.includes(optionId)) {
        return currentIds.filter((id) => id !== optionId);
      }

      return [...currentIds, optionId];
    });
  }

  function updateMatchingPair(leftId: string, rightId: string) {
    clearResult();

    setMatchingPairs((currentPairs) => ({
      ...currentPairs,
      [leftId]: rightId,
    }));
  }

  function resetTask() {
    setSelectedSingleOptionId("");
    setSelectedMultipleOptionIds([]);
    setMatchingPairs({});
    setResult(null);
    setApiError(null);
  }

  function buildAnswer(): LessonMiniTaskAnswer {
    if (task.type === "single-choice") {
      return {
        type: "single-choice",
        selectedOptionId: selectedSingleOptionId,
      };
    }

    if (task.type === "multiple-choice") {
      return {
        type: "multiple-choice",
        selectedOptionIds: selectedMultipleOptionIds,
      };
    }

    return {
      type: "matching",
      pairs: matchingPairs,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setApiError(null);

    try {
      const response = await fetch("/api/learning/mini-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: task.grade,
          topicSlug: task.topicSlug,
          answer: buildAnswer(),
        }),
      });

      const data = (await response.json()) as ApiResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Жауапты тексеру мүмкін болмады.");
      }

      setResult(data);
      setCompleted(data.isCompleted);

      window.dispatchEvent(
        new CustomEvent("lesson-mini-task-progress-updated", {
          detail: {
            grade: task.grade,
            topicSlug: task.topicSlug,
          },
        })
      );
    } catch (currentError) {
      setApiError(
        currentError instanceof Error
          ? currentError.message
          : "Жауапты тексеру мүмкін болмады."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8f7ff_100%)] px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[#f1efff] text-[#5b4ce6]">
            <ClipboardCheck className="h-5 w-5" />
          </span>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#ddd6ff] bg-[#f1efff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#5b4ce6]">
                2-қадам: Тапсырма
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500">
                <TypeIcon className="h-3 w-3" />
                {getTaskTypeLabel(task.type)}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-black leading-tight text-slate-950">
              {task.title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {task.instruction}
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="px-4 py-4 sm:px-5">
          {task.type === "single-choice" ? (
            <div>
              <p className="text-sm font-black leading-6 text-slate-950">
                {task.question}
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {task.options.map((option, index) => {
                  const checked = selectedSingleOptionId === option.id;

                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition",
                        checked
                          ? "border-[#5b4ce6] bg-[#f8f7ff] shadow-sm"
                          : "border-slate-200 bg-white hover:border-[#cfc6ff] hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="radio"
                        name={`mini-task-${task.id}`}
                        value={option.id}
                        checked={checked}
                        onChange={() => {
                          clearResult();
                          setSelectedSingleOptionId(option.id);
                        }}
                        className="mt-1 accent-[#5b4ce6]"
                      />

                      <span className="text-sm font-semibold leading-6 text-slate-700">
                        <span className="mr-1 font-black text-[#5b4ce6]">
                          {index + 1}.
                        </span>

                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {task.type === "multiple-choice" ? (
            <div>
              <p className="text-sm font-black leading-6 text-slate-950">
                {task.question}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Бірнеше дұрыс жауап болуы мүмкін.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {task.options.map((option, index) => {
                  const checked = selectedMultipleOptionIds.includes(option.id);

                  return (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition",
                        checked
                          ? "border-[#5b4ce6] bg-[#f8f7ff] shadow-sm"
                          : "border-slate-200 bg-white hover:border-[#cfc6ff] hover:bg-slate-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        value={option.id}
                        checked={checked}
                        onChange={() => toggleMultipleOption(option.id)}
                        className="mt-1 accent-[#5b4ce6]"
                      />

                      <span className="text-sm font-semibold leading-6 text-slate-700">
                        <span className="mr-1 font-black text-[#5b4ce6]">
                          {index + 1}.
                        </span>

                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {task.type === "matching" ? (
            <div className="space-y-2">
              {task.leftItems.map((leftItem, index) => (
                <div
                  key={leftItem.id}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,0.85fr)_28px_minmax(0,1.15fr)] sm:items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f1efff] text-[11px] font-black text-[#5b4ce6]">
                      {index + 1}
                    </span>

                    <p className="text-sm font-bold leading-5 text-slate-800">
                      {leftItem.text}
                    </p>
                  </div>

                  <Link2 className="hidden h-4 w-4 text-slate-400 sm:block" />

                  <select
                    value={matchingPairs[leftItem.id] ?? ""}
                    onChange={(event) =>
                      updateMatchingPair(leftItem.id, event.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#5b4ce6] focus:ring-4 focus:ring-[#5b4ce6]/10"
                  >
                    <option value="">Жауапты таңдаңыз</option>

                    {task.rightItems.map((rightItem) => (
                      <option key={rightItem.id} value={rightItem.id}>
                        {rightItem.text}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ) : null}

          {loadingProgress ? (
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#5b4ce6]" />
              Прогресс жүктеліп жатыр...
            </div>
          ) : null}

          {apiError ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold leading-6 text-rose-700">
              {apiError}
            </div>
          ) : null}

          {result ? (
            <div
              className={cn(
                "mt-4 flex items-start gap-2.5 rounded-xl border p-3",
                result.isCorrect
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50"
              )}
            >
              {result.isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              )}

              <p
                className={cn(
                  "text-sm font-bold leading-6",
                  result.isCorrect ? "text-emerald-700" : "text-amber-700"
                )}
              >
                {result.message}
              </p>
            </div>
          ) : null}
        </div>

        <footer className="border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-slate-500">
              Жауапты таңдағаннан кейін тексеру батырмасын басыңыз.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={resetTask}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Тазалау
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#5b4ce6] px-4 text-xs font-bold text-white transition hover:bg-[#493dd6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ClipboardCheck className="h-3.5 w-3.5" />
                )}

                {saving ? "Тексеріліп жатыр..." : "Жауапты тексеру"}
              </button>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            {canGoNext ? (
              <Link
                href={nextTopicHref}
                className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#5b4ce6] px-4 text-sm font-black text-white transition hover:bg-[#493dd6]"
              >
                {nextTopicLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-slate-200 px-4 text-sm font-black text-slate-400"
              >
                <LockKeyhole className="h-4 w-4" />
                Келесі тақырып
              </button>
            )}
          </div>
        </footer>
      </form>
    </section>
  );
}