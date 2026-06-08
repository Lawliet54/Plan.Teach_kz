"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Beaker,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Send,
  TestTube2,
} from "lucide-react";

import { PhysicsTaskVisual, shouldShowTaskVisual } from "@/components/tasks/PhysicsTaskVisual";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getRecommendedLabHref } from "@/lib/recommendedLabs";
import type {
  TaskPack,
  TaskPackAttempt,
  TaskPackItem,
} from "@/lib/taskPacks";

type LocalAttempt = TaskPackAttempt & {
  item_id: string;
};

const kindIcons = {
  test: ClipboardCheck,
  calculation: Calculator,
  lab: TestTube2,
} as const;

function labelFor(kind: TaskPackItem["kind"]) {
  if (kind === "test") return "Тест";
  if (kind === "calculation") return "Есеп";

  return "Зертхана";
}

function key() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function TaskPackWorkspace({
  pack,
  items,
  initialAttempts,
  databaseReady,
}: {
  pack: TaskPack;
  items: TaskPackItem[];
  initialAttempts: TaskPackAttempt[];
  databaseReady: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState<LocalAttempt[]>(initialAttempts);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const item = items[index];

  const attemptByItem = useMemo(() => {
    const map = new Map<string, LocalAttempt>();

    attempts.forEach((attempt) => {
      if (!map.has(attempt.item_id)) {
        map.set(attempt.item_id, attempt);
      }
    });

    return map;
  }, [attempts]);

  const currentAttempt = attemptByItem.get(item?.id);
  const completedCount = attemptByItem.size;
  const percent = items.length
    ? Math.round((completedCount / items.length) * 100)
    : 0;

  const recommendedLabHref = getRecommendedLabHref(pack);

  const structure = [
    {
      label: "Тест",
      count: items.filter((entry) => entry.kind === "test").length,
      description: "Негізгі ұғым мен формула",
    },
    {
      label: "Есеп",
      count: items.filter((entry) => entry.kind === "calculation").length,
      description: "SI және қолданбалы есептеу",
    },
    {
      label: "Зертхана",
      count: items.filter((entry) => entry.kind === "lab").length,
      description: "Өлшеу, кесте және қорытынды",
    },
  ];

  async function submit() {
    if (!item || !answer.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/learning/task-packs/${pack.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId: item.id,
            answer,
            idempotencyKey: key(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Жауап сақталмады.");
      }

      setAttempts((previous) => [data.attempt, ...previous]);
      setMessage(
        data.adaptive?.message || data.feedback || "Жауап сақталды."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Жауап сақталмады."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function open(nextIndex: number) {
    setIndex(nextIndex);
    setAnswer("");
    setMessage(null);
  }

  if (!item) {
    return (
      <Card>
        <CardTitle>Тапсырмалар табылмады</CardTitle>

        <CardText className="mt-1">
          Бұл кешен үшін тапсырма банкі әлі толтырылмаған.
        </CardText>
      </Card>
    );
  }

  const Icon = kindIcons[item.kind];
  const showVisual = shouldShowTaskVisual(item);

  return (
    <div className="task-workspace grid gap-3 xl:grid-cols-[224px_minmax(0,1fr)_252px]">
      <aside className="small-scrollbar rounded-[10px] border border-[var(--border)] bg-white p-2 shadow-[var(--shadow-xs)] xl:sticky xl:top-[74px] xl:h-[calc(100vh-92px)] xl:overflow-y-auto">
        <div className="border-b border-[var(--border-soft)] p-2">
          <p className="data-label">Орындалу барысы</p>

          <div className="mt-2 flex items-end justify-between">
            <b className="text-xl font-semibold text-[var(--text)]">
              {percent}%
            </b>

            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              {completedCount}/{items.length}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all"
              style={{
                width: `${percent}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-2 space-y-1">
          {items.map((entry, entryIndex) => {
            const EntryIcon = kindIcons[entry.kind];
            const done = attemptByItem.has(entry.id);

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => open(entryIndex)}
                className={`flex w-full items-center gap-2 rounded-[7px] border px-2 py-2 text-left text-xs font-semibold transition ${
                  entryIndex === index
                    ? "border-[var(--border-accent)] bg-[var(--purple-soft)] text-[var(--primary)]"
                    : "border-transparent text-[var(--text-soft)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-[6px] ${
                    done
                      ? "bg-[var(--green-soft)] text-[var(--success)]"
                      : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <EntryIcon className="h-3.5 w-3.5" />
                  )}
                </span>

                <span className="truncate">
                  {entry.order_index}. {entry.title}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-3">
        <Card className="science-panel">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  variant={
                    item.kind === "lab"
                      ? "cyan"
                      : item.kind === "calculation"
                        ? "warning"
                        : "primary"
                  }
                >
                  {labelFor(item.kind)}
                </Badge>

                <Badge>{item.max_score} ұпай</Badge>
                <Badge variant="dark">
                  {index + 1}/{items.length}
                </Badge>
              </div>

              <h1 className="mt-3 text-xl font-semibold tracking-[-.018em] text-[var(--text)]">
                {item.title}
              </h1>

              <p className="mt-1 text-xs font-medium text-[var(--primary)]">
                {pack.title}
              </p>
            </div>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[var(--purple-soft)] text-[var(--primary)]">
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium leading-7 text-[var(--text)]">
            {item.prompt}
          </p>

          {item.instruction ? (
            <p className="mt-2 border-l-2 border-[var(--primary)] pl-3 text-xs font-normal leading-5 text-[var(--text-muted)]">
              {item.instruction}
            </p>
          ) : null}

          {showVisual ? (
            <div className="mt-3">
              <PhysicsTaskVisual
                item={item}
                formula={pack.formula}
              />
            </div>
          ) : null}

          {item.kind === "lab" ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[8px] border border-[var(--border-accent)] bg-[var(--purple-soft)] p-3">
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">
                  2D зертханалық модель
                </p>

                <p className="mt-1 text-[11px] font-normal leading-5 text-[var(--text-muted)]">
                  Параметрлерді өзгертіп, өлшеулерді виртуалды зертханада орындаңыз.
                </p>
              </div>

              <Button
                href={recommendedLabHref}
                variant="secondary"
                size="sm"
              >
                <Beaker className="h-3.5 w-3.5" />
                Зертхананы ашу
              </Button>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {item.answer_type === "single_choice" ? (
              item.options.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-[8px] border p-3 text-sm font-normal leading-6 transition ${
                    answer === option.id
                      ? "border-[var(--primary)] bg-[var(--purple-soft)]"
                      : "border-[var(--border)] bg-white hover:border-[var(--border-accent)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={answer === option.id}
                    onChange={() => setAnswer(option.id)}
                    className="mt-1"
                  />

                  <span>
                    <b className="mr-1 font-semibold text-[var(--primary)]">
                      {option.id.toUpperCase()}.
                    </b>

                    {option.text}
                  </span>
                </label>
              ))
            ) : (
              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                rows={item.kind === "lab" ? 12 : 7}
                placeholder={
                  item.kind === "lab"
                    ? "Құралдар, параметрлер, өлшеу кестесі, қажет болса график сипаттамасы және қорытынды..."
                    : "Формула, SI түрлендіруі және шешу жолы..."
                }
                className="focus-ring w-full rounded-[8px] border border-[var(--border)] bg-white p-3 text-sm font-normal leading-6"
              />
            )}
          </div>

          {message ? (
            <div
              className={`mt-3 rounded-[8px] border p-3 text-xs font-medium leading-5 ${
                message.includes("мүмкін болмады") ||
                message.includes("іске қосыңыз")
                  ? "border-[#facaca] bg-[var(--red-soft)] text-[var(--danger)]"
                  : "border-[#bcebd3] bg-[var(--green-soft)] text-[var(--success)]"
              }`}
            >
              {message}
            </div>
          ) : null}

          {!databaseReady ? (
            <div className="mt-3 flex gap-2 rounded-[8px] border border-[#f6daa0] bg-[var(--yellow-soft)] p-3 text-xs font-medium leading-5 text-[var(--warning)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                Алдын ала көру режимі. Жауаптарды базаға сақтау үшін 016 және
                017 SQL миграцияларын іске қосыңыз.
              </span>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-[var(--border-soft)] pt-3">
            <Button
              variant="ghost"
              disabled={index === 0}
              onClick={() => open(Math.max(0, index - 1))}
            >
              <ArrowLeft className="h-4 w-4" />
              Алдыңғы
            </Button>

            <div className="flex gap-2">
              <Button
                disabled={!answer.trim() || submitting || !databaseReady}
                onClick={submit}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                Жауапты сақтау
              </Button>

              <Button
                variant="secondary"
                disabled={index === items.length - 1}
                onClick={() => open(Math.min(items.length - 1, index + 1))}
              >
                Келесі
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </section>

      <aside className="space-y-3">
        <Card>
          <div className="flex items-center gap-2">
            <Beaker className="h-4 w-4 text-[var(--primary)]" />

            <CardTitle className="font-semibold">
              Жұмыс құрылымы
            </CardTitle>
          </div>

          <div className="mt-3 space-y-2">
            {structure.map((row) => (
              <div
                key={row.label}
                className="border-l-2 border-[var(--primary)] pl-2"
              >
                <p className="text-xs font-semibold text-[var(--text)]">
                  {row.count} × {row.label}
                </p>

                <p className="mt-0.5 text-[11px] font-normal leading-4 text-[var(--text-muted)]">
                  {row.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {currentAttempt ? (
          <Card>
            <CardTitle className="font-semibold">
              Соңғы әрекет
            </CardTitle>

            <p className="mt-2 text-xs font-medium text-[var(--text-soft)]">
              {currentAttempt.review_status === "pending_review"
                ? "Мұғалім тексеруін күтуде"
                : currentAttempt.is_correct
                  ? "Дұрыс орындалды"
                  : "Қайта қарау қажет"}
            </p>

            {currentAttempt.feedback ? (
              <CardText className="mt-1 text-xs">
                {currentAttempt.feedback}
              </CardText>
            ) : null}
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
