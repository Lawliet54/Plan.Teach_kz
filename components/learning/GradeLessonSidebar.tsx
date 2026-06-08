"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Loader2,
  Lock,
  RefreshCw,
} from "lucide-react";

import {
  getTopicsByGrade,
  type Grade,
} from "@/data/physicsTopics";
import { cn } from "@/lib/utils";

type GradeLessonSidebarProps = {
  grade: Grade;
  activeTopicSlug: string;
};

type MiniTaskProgressRow = {
  topic_slug: string;
  is_completed: boolean;
};

const gradeDescriptions: Record<Grade, string> = {
  7: "Физикаға кіріспе және негізгі ұғымдар",
  8: "Жылу құбылыстары және электр",
  9: "Динамика және физикалық өрістер",
  10: "Механика және қазіргі заманғы физика негіздері",
  11: "Электромагнетизм, оптика және кванттық физика",
};

function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-[#5b4ce6] transition-all duration-500"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export function GradeLessonSidebar({
  grade,
  activeTopicSlug,
}: GradeLessonSidebarProps) {
  const topics = getTopicsByGrade(grade);

  const [progressRows, setProgressRows] = useState<MiniTaskProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/learning/mini-task?grade=${grade}`, {
        cache: "no-store",
      });

      const data = (await response.json()) as {
        progress?: MiniTaskProgressRow[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Тақырыптар прогресін жүктеу мүмкін болмады.");
      }

      setProgressRows(data.progress ?? []);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Тақырыптар прогресін жүктеу мүмкін болмады."
      );
    } finally {
      setLoading(false);
    }
  }, [grade]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    function handleProgressUpdate() {
      void loadProgress();
    }

    window.addEventListener(
      "lesson-mini-task-progress-updated",
      handleProgressUpdate
    );

    return () => {
      window.removeEventListener(
        "lesson-mini-task-progress-updated",
        handleProgressUpdate
      );
    };
  }, [loadProgress]);

  const completedSlugs = useMemo(() => {
    return new Set(
      progressRows
        .filter((row) => row.is_completed)
        .map((row) => row.topic_slug)
    );
  }, [progressRows]);

  const completedCount = completedSlugs.size;

  const progressPercent =
    topics.length === 0
      ? 0
      : Math.round((completedCount / topics.length) * 100);

  return (
    <aside className="self-start overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-black text-slate-950">
              {grade}-сынып физикасы
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {gradeDescriptions[grade]}
            </p>
          </div>

          <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-500">Прогресс</span>

            <span className="font-black text-slate-700">
              {completedCount}/{topics.length}
            </span>
          </div>

          <ProgressBar value={progressPercent} />
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          Тақырыптар
        </p>
      </div>

      <div className="small-scrollbar max-h-[520px] overflow-y-auto p-2">
        {loading ? (
          <div className="flex min-h-28 items-center justify-center gap-2 text-xs font-semibold text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-[#5b4ce6]" />
            Жүктеліп жатыр...
          </div>
        ) : null}

        {error ? (
          <div className="p-3 text-center">
            <p className="text-xs font-semibold leading-5 text-rose-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadProgress()}
              className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Қайта жүктеу
            </button>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="space-y-1">
            {topics.map((topic, index) => {
              const completed = completedSlugs.has(topic.slug);

              const unlocked =
                index === 0 || completedSlugs.has(topics[index - 1].slug);

              const active = topic.slug === activeTopicSlug;

              if (!unlocked) {
                return (
                  <div
                    key={topic.id}
                    className="flex min-h-10 cursor-not-allowed items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-400"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400">
                      <Lock className="h-3.5 w-3.5" />
                    </span>

                    <span className="min-w-0 flex-1 truncate">
                      {topic.title}
                    </span>

                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  </div>
                );
              }

              return (
                <Link
                  key={topic.id}
                  href={`/topics/${grade}/${topic.slug}`}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition",
                    active
                      ? "bg-[#5b4ce6] text-white shadow-sm"
                      : "text-slate-600 hover:bg-[#f1efff] hover:text-[#5b4ce6]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      completed
                        ? "bg-emerald-50 text-emerald-600"
                        : active
                          ? "bg-white/15 text-white"
                          : "bg-[#f1efff] text-[#5b4ce6]"
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-[11px] font-black">
                        {index + 1}
                      </span>
                    )}
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {topic.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
}