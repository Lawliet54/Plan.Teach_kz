"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Flame,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import {
  levelLabels,
  physicsTopics,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import {
  getAdaptiveStorageKey,
  readAdaptiveProgress,
  resetAdaptiveProgress,
  type StoredAdaptiveProgress,
} from "@/lib/adaptiveEngine";
import { Card, CardTitle } from "@/components/ui/Card";

type TopicProgressView = {
  topic: PhysicsTopic;
  progress: StoredAdaptiveProgress | null;
};

function getLevelBadgeClass(level: TopicLevel) {
  if (level === "advanced") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (level === "medium") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-[#ddd6ff] bg-[#f1efff] text-[#5b4ce6]";
}

function getDecisionText(progress: StoredAdaptiveProgress | null) {
  if (!progress?.decision) return "Әзірге шешім жоқ";

  if (progress.decision.type === "level_up") return "Деңгей көтерілді";
  if (progress.decision.type === "level_down") return "Деңгей төмендетілді";
  if (progress.decision.type === "mastered") return "Тақырып меңгерілді";
  if (progress.decision.type === "practice_more") return "Қайталау керек";

  return "Деңгей сақталды";
}

export function AdaptiveProgressOverview() {
  const [items, setItems] = useState<TopicProgressView[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const nextItems = physicsTopics.map((topic) => ({
      topic,
      progress: readAdaptiveProgress(topic.grade, topic.slug),
    }));

    setItems(nextItems);
  }, [refreshKey]);

  const startedItems = useMemo(
    () => items.filter((item) => item.progress),
    [items]
  );

  const stats = useMemo(() => {
    const totalAttempts = startedItems.reduce(
      (sum, item) => sum + (item.progress?.attempts ?? 0),
      0
    );

    const averagePercent =
      startedItems.length === 0
        ? 0
        : Math.round(
            startedItems.reduce(
              (sum, item) => sum + (item.progress?.lastPercent ?? 0),
              0
            ) / startedItems.length
          );

    const mediumCount = startedItems.filter(
      (item) => item.progress?.currentLevel === "medium"
    ).length;

    const advancedCount = startedItems.filter(
      (item) => item.progress?.currentLevel === "advanced"
    ).length;

    const masteredCount = startedItems.filter(
      (item) => item.progress?.decision?.type === "mastered"
    ).length;

    return {
      totalStarted: startedItems.length,
      totalAttempts,
      averagePercent,
      mediumCount,
      advancedCount,
      masteredCount,
    };
  }, [startedItems]);

  const recentItems = useMemo(() => {
    return [...startedItems]
      .sort((a, b) => {
        const dateA = a.progress?.lastCompletedAt
          ? new Date(a.progress.lastCompletedAt).getTime()
          : 0;
        const dateB = b.progress?.lastCompletedAt
          ? new Date(b.progress.lastCompletedAt).getTime()
          : 0;

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [startedItems]);

  function handleResetAll() {
    const ok = window.confirm(
      "Барлық adaptive localStorage нәтижелерін өшіреміз бе?"
    );

    if (!ok) return;

    physicsTopics.forEach((topic) => {
      window.localStorage.removeItem(getAdaptiveStorageKey(topic.grade, topic.slug));
    });

    setRefreshKey((current) => current + 1);
  }

  function handleResetOne(grade: number, topicSlug: string) {
    resetAdaptiveProgress(grade, topicSlug);
    setRefreshKey((current) => current + 1);
  }

  return (
    <section className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
            <p className="text-xs font-semibold text-slate-500">
              Басталған тақырып
            </p>
          </div>

          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.totalStarted}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-semibold text-slate-500">
              Тапсыру саны
            </p>
          </div>

          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.totalAttempts}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <p className="text-xs font-semibold text-slate-500">
              Орташа нәтиже
            </p>
          </div>

          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.averagePercent}%
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-semibold text-slate-500">
              Күрделі деңгей
            </p>
          </div>

          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.advancedCount}
          </p>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Adaptive прогресс</CardTitle>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Бұл жерде оқушы тапсырма орындаған тақырыптардың деңгейі
                көрсетіледі.
              </p>
            </div>

            {startedItems.length > 0 ? (
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Барлығын тазалау
              </button>
            ) : null}
          </div>

          {startedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm font-bold text-slate-700">
                Әзірге adaptive нәтиже жоқ
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Тақырыпқа кіріп, тапсырма орындағаннан кейін нәтиже осы жерде
                пайда болады.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {startedItems.map(({ topic, progress }) => {
                const level = progress?.currentLevel ?? "basic";

                return (
                  <div
                    key={topic.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-black text-slate-950">
                            {topic.grade}-сынып · {topic.title}
                          </p>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getLevelBadgeClass(
                              level
                            )}`}
                          >
                            {levelLabels[level]}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {getDecisionText(progress)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                          <p className="text-[11px] font-bold text-slate-500">
                            Соңғы нәтиже
                          </p>
                          <p className="text-sm font-black text-slate-950">
                            {progress?.lastPercent ?? 0}%
                          </p>
                        </div>

                        <div className="rounded-xl bg-white px-3 py-2 text-right shadow-sm">
                          <p className="text-[11px] font-bold text-slate-500">
                            Серия
                          </p>
                          <p className="text-sm font-black text-[#5b4ce6]">
                            {progress?.goodStreak ?? 0}/3
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleResetOne(topic.grade, topic.slug)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                          title="Осы тақырып нәтижесін тазалау"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <CardTitle>Соңғы белсенділік</CardTitle>
          </div>

          {recentItems.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Әзірге белсенділік жоқ.
            </p>
          ) : (
            <div className="space-y-2">
              {recentItems.map(({ topic, progress }) => (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm font-black text-slate-950">
                    {topic.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {topic.grade}-сынып · {progress?.lastPercent ?? 0}% ·{" "}
                    {levelLabels[progress?.currentLevel ?? "basic"]}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-2xl border border-[#ddd6ff] bg-[#f1efff] p-3 text-xs font-bold leading-5 text-[#5b4ce6]">
            3 рет 80%+ нәтиже көрсетсе, жүйе тақырып деңгейін автоматты түрде
            көтереді.
          </div>
        </Card>
      </div>
    </section>
  );
}