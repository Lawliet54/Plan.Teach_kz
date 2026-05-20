"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  GraduationCap,
  Layers3,
  LineChart,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  grades,
  levelLabels,
  physicsTopics,
  type Grade,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import {
  getAdaptiveStorageKey,
  readAdaptiveProgress,
  resetAdaptiveProgress,
  type StoredAdaptiveProgress,
} from "@/lib/adaptiveEngine";

type AnalyticsItem = {
  topic: PhysicsTopic;
  progress: StoredAdaptiveProgress | null;
};

function getLevelColor(level: TopicLevel) {
  if (level === "advanced") return "bg-emerald-500";
  if (level === "medium") return "bg-blue-500";
  return "bg-[#5b4ce6]";
}

function getLevelBadgeClass(level: TopicLevel) {
  if (level === "advanced") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (level === "medium") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-[#ddd6ff] bg-[#f1efff] text-[#5b4ce6]";
}

function getDecisionLabel(progress: StoredAdaptiveProgress | null) {
  if (!progress?.decision) return "Шешім жоқ";

  if (progress.decision.type === "level_up") return "Деңгей көтерілді";
  if (progress.decision.type === "level_down") return "Деңгей төмендеді";
  if (progress.decision.type === "mastered") return "Меңгерілді";
  if (progress.decision.type === "practice_more") return "Қайталау керек";

  return "Сақталды";
}

function formatDate(value?: string) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("kk-KZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
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

export function AdaptiveAnalyticsPanel() {
  const [items, setItems] = useState<AnalyticsItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setItems(
      physicsTopics.map((topic) => ({
        topic,
        progress: readAdaptiveProgress(topic.grade, topic.slug),
      }))
    );
  }, [refreshKey]);

  const startedItems = useMemo(
    () => items.filter((item) => item.progress),
    [items]
  );

  const stats = useMemo(() => {
    const totalTopics = physicsTopics.length;
    const startedTopics = startedItems.length;

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

    const basicCount = startedItems.filter(
      (item) => item.progress?.currentLevel === "basic"
    ).length;

    const mediumCount = startedItems.filter(
      (item) => item.progress?.currentLevel === "medium"
    ).length;

    const advancedCount = startedItems.filter(
      (item) => item.progress?.currentLevel === "advanced"
    ).length;

    const masteredCount = startedItems.filter(
      (item) => item.progress?.decision?.type === "mastered"
    ).length;

    const weakCount = startedItems.filter((item) => {
      const progress = item.progress;
      if (!progress) return false;

      return (
        (progress.lastPercent ?? 0) < 60 ||
        progress.decision?.type === "practice_more" ||
        progress.decision?.type === "level_down"
      );
    }).length;

    return {
      totalTopics,
      startedTopics,
      totalAttempts,
      averagePercent,
      basicCount,
      mediumCount,
      advancedCount,
      masteredCount,
      weakCount,
      startedPercent:
        totalTopics === 0 ? 0 : Math.round((startedTopics / totalTopics) * 100),
    };
  }, [startedItems]);

  const gradeStats = useMemo(() => {
    return grades.map((grade) => {
      const gradeTopics = items.filter((item) => item.topic.grade === grade);
      const started = gradeTopics.filter((item) => item.progress);
      const average =
        started.length === 0
          ? 0
          : Math.round(
              started.reduce(
                (sum, item) => sum + (item.progress?.lastPercent ?? 0),
                0
              ) / started.length
            );

      return {
        grade,
        total: gradeTopics.length,
        started: started.length,
        average,
        percent:
          gradeTopics.length === 0
            ? 0
            : Math.round((started.length / gradeTopics.length) * 100),
      };
    });
  }, [items]);

  const weakTopics = useMemo(() => {
    return startedItems
      .filter((item) => {
        const progress = item.progress;
        if (!progress) return false;

        return (
          (progress.lastPercent ?? 0) < 60 ||
          progress.decision?.type === "practice_more" ||
          progress.decision?.type === "level_down"
        );
      })
      .sort((a, b) => {
        return (a.progress?.lastPercent ?? 0) - (b.progress?.lastPercent ?? 0);
      })
      .slice(0, 5);
  }, [startedItems]);

  const strongTopics = useMemo(() => {
    return startedItems
      .filter((item) => {
        const progress = item.progress;
        if (!progress) return false;

        return (
          (progress.lastPercent ?? 0) >= 80 ||
          progress.currentLevel === "advanced" ||
          progress.decision?.type === "mastered"
        );
      })
      .sort((a, b) => {
        return (b.progress?.lastPercent ?? 0) - (a.progress?.lastPercent ?? 0);
      })
      .slice(0, 5);
  }, [startedItems]);

  const recentHistory = useMemo(() => {
    return startedItems
      .flatMap((item) =>
        (item.progress?.history ?? []).map((history) => ({
          topic: item.topic,
          history,
        }))
      )
      .sort(
        (a, b) =>
          new Date(b.history.completedAt).getTime() -
          new Date(a.history.completedAt).getTime()
      )
      .slice(0, 8);
  }, [startedItems]);

  function handleResetAll() {
    const ok = window.confirm(
      "Барлық adaptive analytics нәтижелерін өшіреміз бе?"
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
    <div className="space-y-3 sm:space-y-4">
      <section className="rounded-[10px] bg-[linear-gradient(135deg,#3021b8_0%,#4438ca_45%,#5b21b6_100%)] p-4 text-white shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              Adaptive analytics
            </p>

            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
              Оқу нәтижелерінің аналитикасы
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
              Бұл бет оқушының adaptive тапсырмалардағы нәтижесін, тақырып
              деңгейін, әлсіз және мықты бағыттарын көрсетеді.
            </p>
          </div>

          {startedItems.length > 0 ? (
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex h-10 w-fit items-center justify-center rounded-2xl border border-white/20 bg-white px-4 text-sm font-bold text-[#493dd6] transition hover:bg-white/95"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Нәтижелерді тазалау
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
            <p className="text-xs font-semibold text-slate-500">
              Басталған тақырып
            </p>
          </div>

          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.startedTopics}/{stats.totalTopics}
          </p>

          <div className="mt-3">
            <ProgressBar value={stats.startedPercent} />
          </div>
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

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Барлық adaptive әрекет саны
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

          <div className="mt-3">
            <ProgressBar value={stats.averagePercent} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-semibold text-slate-500">
              Меңгерілген
            </p>
          </div>

          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.masteredCount}
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Күрделі деңгейде бекітілген тақырыптар
          </p>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Деңгей бойынша таралу</CardTitle>
          </div>

          <div className="space-y-3">
            {[
              {
                level: "basic" as TopicLevel,
                count: stats.basicCount,
                label: "Базалық",
              },
              {
                level: "medium" as TopicLevel,
                count: stats.mediumCount,
                label: "Орташа",
              },
              {
                level: "advanced" as TopicLevel,
                count: stats.advancedCount,
                label: "Күрделі",
              },
            ].map((item) => {
              const percent =
                startedItems.length === 0
                  ? 0
                  : Math.round((item.count / startedItems.length) * 100);

              return (
                <div key={item.level}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${getLevelColor(
                          item.level
                        )}`}
                      />
                      <p className="text-sm font-bold text-slate-800">
                        {item.label}
                      </p>
                    </div>

                    <p className="text-xs font-black text-slate-600">
                      {item.count} тақырып · {percent}%
                    </p>
                  </div>

                  <ProgressBar value={percent} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>AI ұсынысы</CardTitle>
          </div>

          {startedItems.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Әзірге дерек жоқ. Бір тақырыптың тапсырмасын орындағаннан кейін
              AI ұсынысы осы жерде шығады.
            </p>
          ) : stats.weakCount > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-black text-amber-800">
                Қайталау қажет
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-700">
                {stats.weakCount} тақырыпта нәтиже төмен немесе оқушыға қосымша
                түсіндіру қажет. Алдымен әлсіз тақырыптар блогындағы
                тапсырмаларды қайталау ұсынылады.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-black text-emerald-800">
                Прогресс жақсы
              </p>
              <p className="mt-1 text-xs leading-5 text-emerald-700">
                Қазіргі нәтижелер жақсы. 3 рет 80%+ нәтиже көрсеткен
                тақырыптар келесі деңгейге ауыса береді.
              </p>
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-[0.9fr_0.9fr_1.1fr]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle>Әлсіз тақырыптар</CardTitle>
          </div>

          {weakTopics.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Қазір әлсіз тақырып анықталған жоқ.
            </p>
          ) : (
            <div className="space-y-2">
              {weakTopics.map(({ topic, progress }) => (
                <div
                  key={topic.id}
                  className="rounded-2xl border border-amber-100 bg-amber-50 p-3"
                >
                  <p className="text-sm font-black text-slate-950">
                    {topic.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    {topic.grade}-сынып · соңғы нәтиже:{" "}
                    <span className="font-black">
                      {progress?.lastPercent ?? 0}%
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <CardTitle>Мықты тақырыптар</CardTitle>
          </div>

          {strongTopics.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Әзірге мықты тақырыптар жоқ. 80%+ нәтиже алғаннан кейін шығады.
            </p>
          ) : (
            <div className="space-y-2">
              {strongTopics.map(({ topic, progress }) => {
                const level = progress?.currentLevel ?? "basic";

                return (
                  <div
                    key={topic.id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-slate-950">
                        {topic.title}
                      </p>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getLevelBadgeClass(
                          level
                        )}`}
                      >
                        {levelLabels[level]}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-600">
                      {topic.grade}-сынып · соңғы нәтиже:{" "}
                      <span className="font-black">
                        {progress?.lastPercent ?? 0}%
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Сынып бойынша прогресс</CardTitle>
          </div>

          <div className="space-y-3">
            {gradeStats.map((item) => (
              <div key={item.grade}>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    {item.grade}-сынып
                  </p>

                  <p className="text-xs font-black text-slate-600">
                    {item.started}/{item.total} · орташа {item.average}%
                  </p>
                </div>

                <ProgressBar value={item.percent} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Барлық тақырыптар кестесі</CardTitle>
          </div>

          {startedItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm font-bold text-slate-700">
                Әзірге тапсырма нәтижесі жоқ
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Тақырыпқа кіріп, тапсырманы орындаңыз.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1.3fr_0.6fr_0.6fr_0.7fr_0.5fr] gap-2 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                <span>Тақырып</span>
                <span>Сынып</span>
                <span>Деңгей</span>
                <span>Нәтиже</span>
                <span>Серия</span>
              </div>

              <div className="divide-y divide-slate-200">
                {startedItems.map(({ topic, progress }) => {
                  const level = progress?.currentLevel ?? "basic";

                  return (
                    <div
                      key={topic.id}
                      className="grid grid-cols-[1.3fr_0.6fr_0.6fr_0.7fr_0.5fr] gap-2 px-3 py-3 text-xs"
                    >
                      <div>
                        <p className="font-black text-slate-950">
                          {topic.title}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {getDecisionLabel(progress)}
                        </p>
                      </div>

                      <span className="font-bold text-slate-700">
                        {topic.grade}
                      </span>

                      <span
                        className={`h-fit w-fit rounded-full border px-2 py-1 text-[11px] font-bold ${getLevelBadgeClass(
                          level
                        )}`}
                      >
                        {levelLabels[level]}
                      </span>

                      <span className="font-black text-slate-900">
                        {progress?.lastPercent ?? 0}%
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#5b4ce6]">
                          {progress?.goodStreak ?? 0}/3
                        </span>

                        <button
                          type="button"
                          onClick={() => handleResetOne(topic.grade, topic.slug)}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-rose-50 hover:text-rose-500"
                          title="Тазалау"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Соңғы нәтижелер</CardTitle>
          </div>

          {recentHistory.length === 0 ? (
            <p className="text-sm leading-6 text-slate-600">
              Соңғы нәтижелер жоқ.
            </p>
          ) : (
            <div className="space-y-2">
              {recentHistory.map((item, index) => (
                <div
                  key={`${item.topic.id}-${item.history.completedAt}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {item.topic.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.topic.grade}-сынып ·{" "}
                        {levelLabels[item.history.level]}
                      </p>
                    </div>

                    <span className="rounded-xl bg-white px-2.5 py-1 text-xs font-black text-slate-900 shadow-sm">
                      {item.history.percent}%
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] font-semibold text-slate-500">
                    {formatDate(item.history.completedAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}