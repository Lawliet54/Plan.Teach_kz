"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  RotateCcw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { levelLabels } from "@/data/physicsTopics";
import {
  readTaskResultHistory,
  type TaskResultHistoryItem,
} from "@/lib/taskSessionResult";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("kk-KZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getStatusLabel(item: TaskResultHistoryItem) {
  return item.status === "passed" ? "Өтті" : "Қайта тапсыру керек";
}

function getStatusClass(item: TaskResultHistoryItem) {
  if (item.status === "passed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function ResultsLineChart({ items }: { items: TaskResultHistoryItem[] }) {
  const chartItems = [...items]
    .sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    )
    .slice(-8);

  if (chartItems.length === 0) {
    return (
      <div className="grid h-44 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-500">
        График үшін нәтиже жоқ
      </div>
    );
  }

  const width = 720;
  const height = 220;
  const paddingX = 42;
  const paddingY = 26;
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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full">
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = paddingY + (1 - tick / 100) * innerHeight;

          return (
            <g key={tick}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x="8"
                y={y + 4}
                fontSize="12"
                fontWeight="700"
                fill="#64748b"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        <line
          x1={paddingX}
          y1={paddingY + (1 - 0.7) * innerHeight}
          x2={width - paddingX}
          y2={paddingY + (1 - 0.7) * innerHeight}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

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
              y={point.y - 14}
              textAnchor="middle"
              fontSize="12"
              fontWeight="800"
              fill="#0f172a"
            >
              {point.item.percent}%
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Соңғы нәтижелер</span>
        <span>Сары сызық — өту шегі 70%</span>
      </div>
    </div>
  );
}

export function ResultsHistoryPanel() {
  const [items, setItems] = useState<TaskResultHistoryItem[]>([]);

  useEffect(() => {
    setItems(readTaskResultHistory());
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const passed = items.filter((item) => item.status === "passed").length;
    const retry = total - passed;

    const average =
      total === 0
        ? 0
        : Math.round(
            items.reduce((sum, item) => sum + item.percent, 0) / total
          );

    const best = total === 0 ? 0 : Math.max(...items.map((item) => item.percent));

    return {
      total,
      passed,
      retry,
      average,
      best,
    };
  }, [items]);

  const weakItems = useMemo(() => {
    return items
      .filter((item) => item.percent < 70)
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 5);
  }, [items]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
              Нәтижелер тарихы
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              Оқу нәтижелері
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Бұл бетте барлық тапсырылған тақырыптардың нәтижесі сақталады.
              Нәтиже төмен болса, оқушы сол тақырыпты қайта тапсыра алады.
            </p>
          </div>

          <Link
            href="/topics"
            className="inline-flex h-10 w-fit items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
          >
            Тақырыптарға өту
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#5b4ce6]" />
            <p className="text-xs font-semibold text-slate-500">
              Барлық тапсырма
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
              Ең жақсы нәтиже
            </p>
          </div>
          <p className="mt-2 text-lg font-black text-slate-950">
            {stats.best}%
          </p>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Нәтижелер графигі</CardTitle>
          </div>

          <ResultsLineChart items={items} />
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-amber-500" />
            <CardTitle>Қайта тапсыратын тақырыптар</CardTitle>
          </div>

          {weakItems.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-black text-emerald-800">
                Қайта тапсыратын тақырып жоқ
              </p>
              <p className="mt-1 text-xs leading-5 text-emerald-700">
                70%-дан төмен нәтиже алған тақырыптар осы жерде көрінеді.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {weakItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {item.topicTitle}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {item.grade}-сынып · {levelLabels[item.level]} ·{" "}
                        {item.percent}%
                      </p>
                    </div>

                    <XCircle className="h-4 w-4 shrink-0 text-amber-500" />
                  </div>

                  <Link
                    href={`/tasks/session?grade=${item.grade}&topic=${item.topicSlug}&level=${item.level}&restart=1`}
                    className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-xl bg-white px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                  >
                    Қайта тапсыру
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#5b4ce6]" />
          <CardTitle>Барлық тапсырмалар тарихы</CardTitle>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm font-bold text-slate-700">
              Әзірге нәтиже жоқ
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Тақырып тапсырмасын аяқтағаннан кейін нәтиже осы жерде сақталады.
            </p>
          </div>
        ) : (
          <div className="compact-scrollbar overflow-x-auto rounded-2xl border border-slate-200">
            <div className="hidden min-w-[760px] grid-cols-[1.25fr_0.45fr_0.55fr_0.55fr_0.75fr_0.7fr] gap-2 bg-slate-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 md:grid">
              <span>Тақырып</span>
              <span>Сынып</span>
              <span>Деңгей</span>
              <span>Нәтиже</span>
              <span>Күні</span>
              <span>Әрекет</span>
            </div>

            <div className="divide-y divide-slate-200">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid min-w-[760px] gap-3 px-3 py-3 md:grid-cols-[1.25fr_0.45fr_0.55fr_0.55fr_0.75fr_0.7fr] md:items-center"
                >
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {item.topicTitle}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.topicUnit}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStatusClass(
                        item
                      )}`}
                    >
                      {getStatusLabel(item)}
                    </span>
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
                    <p className="text-xs font-semibold text-slate-500">
                      {item.correct}/{item.total}
                    </p>
                  </div>

                  <p className="text-xs font-semibold leading-5 text-slate-500">
                    {formatDate(item.completedAt)}
                  </p>

                  <Link
                    href={`/tasks/session?grade=${item.grade}&topic=${item.topicSlug}&level=${item.level}&restart=1`}
                    className={`inline-flex h-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition ${
                      item.status === "passed"
                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        : "bg-[#5b4ce6] text-white hover:bg-[#493dd6]"
                    }`}
                  >
                    {item.status === "passed" ? "Қайталау" : "Қайта тапсыру"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}