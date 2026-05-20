"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Flame,
  LineChart,
  RotateCcw,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { levelLabels } from "@/data/physicsTopics";
import {
  readTaskResultHistory,
  type TaskResultHistoryItem,
} from "@/lib/taskSessionResult";
import { getContinueLearningTarget } from "@/lib/learningProgress";

function formatDate(value: string) {
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
        className={`h-full rounded-full ${
          safeValue >= 70 ? "bg-[#5b4ce6]" : "bg-amber-500"
        }`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function MiniTrendChart({ items }: { items: TaskResultHistoryItem[] }) {
  const chartItems = [...items]
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    .slice(-7);

  if (chartItems.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">
          График үшін нәтиже жоқ
        </p>
      </div>
    );
  }

  const width = 640;
  const height = 170;
  const paddingX = 34;
  const paddingY = 24;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = chartItems.map((item, index) => {
    const x =
      chartItems.length === 1
        ? width / 2
        : paddingX + (index / (chartItems.length - 1)) * innerWidth;

    const y = paddingY + (1 - item.percent / 100) * innerHeight;

    return {
      x,
      y,
      item,
    };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
        {[0, 50, 70, 100].map((tick) => {
          const y = paddingY + (1 - tick / 100) * innerHeight;

          return (
            <g key={tick}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke={tick === 70 ? "#f59e0b" : "#e2e8f0"}
                strokeWidth={tick === 70 ? "2" : "1"}
                strokeDasharray={tick === 70 ? "6 6" : "0"}
              />
              <text
                x="6"
                y={y + 4}
                fontSize="11"
                fontWeight="800"
                fill="#64748b"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        <path
          d={path}
          fill="none"
          stroke="#5b4ce6"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={point.item.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill={point.item.percent >= 70 ? "#5b4ce6" : "#f59e0b"}
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text
              x={point.x}
              y={point.y - 13}
              textAnchor="middle"
              fontSize="11"
              fontWeight="900"
              fill="#0f172a"
            >
              {point.item.percent}%
            </text>
          </g>
        ))}
      </svg>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        Сары сызық — тақырыпты өту шегі: 70%
      </p>
    </div>
  );
}

function buildAiAdvice(items: TaskResultHistoryItem[]) {
  if (items.length === 0) {
    return {
      title: "Әзірге дерек жоқ",
      text: "Аналитика шығуы үшін кемінде бір тақырыптың тапсырмасын аяқтаңыз.",
      type: "empty" as const,
    };
  }

  const latest = items[0];
  const weakItems = items.filter((item) => item.percent < 70);
  const average = Math.round(
    items.reduce((sum, item) => sum + item.percent, 0) / items.length
  );

  if (weakItems.length > 0) {
    const weakest = [...weakItems].sort((a, b) => a.percent - b.percent)[0];

    return {
      title: "Қайталау қажет",
      text: `${weakest.topicTitle} тақырыбында нәтиже төмен. Алдымен осы тақырыптың теориясын қайта оқып, қате кеткен тапсырмаларды талдап, қайта тапсыру ұсынылады.`,
      type: "warning" as const,
    };
  }

  if (average >= 85 && latest.percent >= 80) {
    return {
      title: "Прогресс жақсы",
      text: "Соңғы нәтижелер жақсы. Енді теорияны қысқа қайталап, келесі тақырыптағы есептерге көбірек көңіл бөлуге болады.",
      type: "success" as const,
    };
  }

  return {
    title: "Бекіту керек",
    text: "Негізгі нәтиже жаман емес, бірақ тұрақты жоғары нәтиже үшін тест, бос орын және сәйкестендіру тапсырмаларындағы қателерді қарап шыққан дұрыс.",
    type: "default" as const,
  };
}

type StudentAnalyticsPanelProps = {
  profileLevel?: string | null;
};

export function StudentAnalyticsPanel({
  profileLevel,
}: StudentAnalyticsPanelProps) {
  const [items, setItems] = useState<TaskResultHistoryItem[]>([]);
  const [continueTarget, setContinueTarget] = useState<ReturnType<
    typeof getContinueLearningTarget
  > | null>(null);

  useEffect(() => {
    setItems(readTaskResultHistory());
    setContinueTarget(getContinueLearningTarget(profileLevel));
  }, [profileLevel]);

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [items]);

  const stats = useMemo(() => {
    const total = sortedItems.length;
    const passed = sortedItems.filter((item) => item.percent >= 70).length;
    const retry = total - passed;

    const average =
      total === 0
        ? 0
        : Math.round(
            sortedItems.reduce((sum, item) => sum + item.percent, 0) / total
          );

    const best =
      total === 0 ? 0 : Math.max(...sortedItems.map((item) => item.percent));

    const last = sortedItems[0]?.percent ?? 0;

    return {
      total,
      passed,
      retry,
      average,
      best,
      last,
    };
  }, [sortedItems]);

  const weakTopics = useMemo(() => {
    return sortedItems
      .filter((item) => item.percent < 70)
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 5);
  }, [sortedItems]);

  const strongTopics = useMemo(() => {
    return sortedItems
      .filter((item) => item.percent >= 85)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }, [sortedItems]);

  const recentItems = sortedItems.slice(0, 6);
  const aiAdvice = buildAiAdvice(sortedItems);

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
              Оқу аналитикасы
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              Қай бағытқа назар аудару керек?
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Бұл бет оқушының нәтижелерін талдап, әлсіз тақырыптарды,
              мықты тұстарды және келесі оқу бағытын көрсетеді.
            </p>
          </div>

          <Link
            href="/results"
            className="inline-flex h-10 w-fit items-center justify-center rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-4 text-sm font-bold text-[#5b4ce6] transition hover:bg-[#ebe7ff]"
          >
            Нәтижелер тарихы
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2">
            <ClipboardStatIcon />
            <p className="text-xs font-semibold text-slate-500">
              Тапсырылған
            </p>
          </div>
          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.total}
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-semibold text-slate-500">Өткен</p>
          </div>
          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.passed}
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
            {stats.average}%
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-500" />
            <p className="text-xs font-semibold text-slate-500">
              Ең жақсы
            </p>
          </div>
          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.best}%
          </p>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Соңғы нәтижелер графигі</CardTitle>
          </div>

          <MiniTrendChart items={sortedItems} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>AI ұсынысы</CardTitle>
          </div>

          <div
            className={`rounded-2xl border p-3 ${
              aiAdvice.type === "warning"
                ? "border-amber-200 bg-amber-50"
                : aiAdvice.type === "success"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-[#ddd6ff] bg-[#f8f7ff]"
            }`}
          >
            <p className="text-sm font-black text-slate-950">
              {aiAdvice.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {aiAdvice.text}
            </p>
          </div>

          {weakTopics.length > 0 ? (
            <div className="mt-3">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Бірінші қайталау керек
              </p>

              <div className="space-y-2">
                {weakTopics.slice(0, 2).map((item) => (
                  <Link
                    key={item.id}
                    href={`/tasks/session?grade=${item.grade}&topic=${item.topicSlug}&level=${item.level}&restart=1`}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 transition hover:bg-amber-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">
                        {item.topicTitle}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {item.percent}% · қайта тапсыру
                      </p>
                    </div>

                    <RotateCcw className="h-4 w-4 shrink-0 text-amber-600" />
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle>Әлсіз тақырыптар</CardTitle>
          </div>

          {weakTopics.length === 0 ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold leading-6 text-emerald-700">
              Қазір 70%-дан төмен нәтиже алған тақырып жоқ.
            </p>
          ) : (
            <div className="space-y-2">
              {weakTopics.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-3"
                >
                  <p className="text-sm font-black text-slate-950">
                    {item.topicTitle}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {item.grade}-сынып · {levelLabels[item.level]} ·{" "}
                    {item.percent}%
                  </p>

                  <div className="mt-2">
                    <ProgressBar value={item.percent} />
                  </div>
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
            <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
              85%+ нәтиже алған тақырыптар осы жерде көрінеді.
            </p>
          ) : (
            <div className="space-y-2">
              {strongTopics.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3"
                >
                  <p className="text-sm font-black text-slate-950">
                    {item.topicTitle}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {item.grade}-сынып · {levelLabels[item.level]} ·{" "}
                    {item.percent}%
                  </p>

                  <div className="mt-2">
                    <ProgressBar value={item.percent} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Келесі оқу бағыты</CardTitle>
          </div>

          {continueTarget ? (
            <div className="rounded-2xl border border-[#ddd6ff] bg-[#f8f7ff] p-3">
              <p className="text-sm font-black text-slate-950">
                {continueTarget.label}
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-500">
                {continueTarget.description}
              </p>

              <Link
                href={continueTarget.href}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
              >
                Жалғастыру
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-500">
              Келесі бағыт анықталмады.
            </p>
          )}
        </Card>
      </section>

      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#5b4ce6]" />
          <CardTitle>Соңғы нәтижелер</CardTitle>
        </div>

        {recentItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm font-bold text-slate-700">
              Соңғы нәтижелер жоқ
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Тапсырма орындағаннан кейін аналитика осы жерде пайда болады.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1.2fr_0.55fr_0.55fr_0.75fr_0.6fr] md:items-center"
              >
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {item.topicTitle}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {item.topicUnit}
                  </p>
                </div>

                <p className="text-sm font-bold text-slate-700">
                  {item.grade}-сынып
                </p>

                <p className="text-sm font-bold text-[#5b4ce6]">
                  {levelLabels[item.level]}
                </p>

                <div>
                  <p className="text-sm font-black text-slate-950">
                    {item.percent}%
                  </p>
                  <ProgressBar value={item.percent} />
                </div>

                <p className="text-xs font-semibold text-slate-500">
                  {formatDate(item.completedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ClipboardStatIcon() {
  return <BookOpen className="h-4 w-4 text-[#5b4ce6]" />;
}
