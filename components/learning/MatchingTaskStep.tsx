"use client";

import {
  CheckCircle2,
  Link2,
  MousePointer2,
  Puzzle,
  RotateCcw,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CardTitle } from "@/components/ui/Card";
import type { PhysicsTopic, TopicLevel } from "@/data/physicsTopics";
import type { TaskSessionState } from "@/lib/taskSession";
import { getMatchingTask } from "@/lib/taskSessionMatching";

type MatchingTaskStepProps = {
  topic: PhysicsTopic;
  level: TopicLevel;
  session: TaskSessionState;
  onSessionChange: (session: TaskSessionState) => void;
};

type LinePoint = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export function MatchingTaskStep({
  topic,
  level,
  session,
  onSessionChange,
}: MatchingTaskStepProps) {
  const task = useMemo(() => getMatchingTask(topic, level), [topic, level]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [lines, setLines] = useState<LinePoint[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const matchedCount = task.definitions.filter((definition) => {
    const value = session.answers.matching[definition.id];
    return typeof value === "string" && value.length > 0;
  }).length;

  function setMatch(definitionId: string, termId: string) {
    const nextMatching = { ...session.answers.matching };

    Object.keys(nextMatching).forEach((key) => {
      if (nextMatching[key] === termId) {
        delete nextMatching[key];
      }
    });

    nextMatching[definitionId] = termId;

    onSessionChange({
      ...session,
      answers: {
        ...session.answers,
        matching: nextMatching,
      },
      updatedAt: new Date().toISOString(),
    });
  }

  function handleDefinitionClick(definitionId: string) {
    if (!selectedTermId) return;

    setMatch(definitionId, selectedTermId);
    setSelectedTermId(null);
  }

  function clearMatch(definitionId: string) {
    const nextMatching = { ...session.answers.matching };
    delete nextMatching[definitionId];

    onSessionChange({
      ...session,
      answers: {
        ...session.answers,
        matching: nextMatching,
      },
      updatedAt: new Date().toISOString(),
    });
  }

  function clearAll() {
    onSessionChange({
      ...session,
      answers: {
        ...session.answers,
        matching: {},
      },
      updatedAt: new Date().toISOString(),
    });

    setSelectedTermId(null);
  }

  function getTermLabel(termId?: string) {
    return task.terms.find((term) => term.id === termId)?.label ?? "";
  }

  useEffect(() => {
    function buildLines() {
      if (!containerRef.current) {
        setLines([]);
        return;
      }

      if (window.innerWidth < 1024) {
        setLines([]);
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const nextLines: LinePoint[] = [];

      task.definitions.forEach((definition) => {
        const matchedTermId = session.answers.matching[definition.id];

        if (!matchedTermId) return;

        const leftEl = leftRefs.current[matchedTermId];
        const rightEl = rightRefs.current[definition.id];

        if (!leftEl || !rightEl) return;

        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();

        nextLines.push({
          id: `${matchedTermId}-${definition.id}`,
          x1: leftRect.right - containerRect.left,
          y1: leftRect.top - containerRect.top + leftRect.height / 2,
          x2: rightRect.left - containerRect.left,
          y2: rightRect.top - containerRect.top + rightRect.height / 2,
        });
      });

      setLines(nextLines);
    }

    const frame = window.requestAnimationFrame(buildLines);

    window.addEventListener("resize", buildLines);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", buildLines);
    };
  }, [session.answers.matching, task.definitions]);

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
            <Puzzle className="h-4 w-4" />
          </div>

          <div>
            <CardTitle>3. Сәйкестендіру тапсырмасы</CardTitle>
            <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
              Терминді таңдаңыз, кейін сәйкес анықтаманы басыңыз.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-3 py-1.5">
            <p className="text-[10px] font-bold text-[#5b4ce6]">
              Сәйкестенді
            </p>
            <p className="text-sm font-black text-slate-950">
              {matchedCount}/{task.definitions.length}
            </p>
          </div>

          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Тазалау
          </button>
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-[#5b4ce6]" />
            <p className="text-xs font-bold text-slate-700 sm:text-sm">
              {selectedTermId
                ? `Таңдалған термин: ${getTermLabel(selectedTermId)}`
                : "Алдымен термин таңдаңыз"}
            </p>
          </div>

          <p className="text-[11px] font-semibold text-slate-500">
            Термин → Анықтама
          </p>
        </div>
      </div>

      <div ref={containerRef} className="relative">
        <svg className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full lg:block">
          {lines.map((line) => {
            const controlOffset = Math.max(38, (line.x2 - line.x1) / 2);

            return (
              <path
                key={line.id}
                d={`M ${line.x1} ${line.y1} C ${
                  line.x1 + controlOffset
                } ${line.y1}, ${line.x2 - controlOffset} ${line.y2}, ${
                  line.x2
                } ${line.y2}`}
                fill="none"
                stroke="#7c6cf2"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </svg>

        <div className="relative z-10 grid gap-3 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Терминдер
              </p>
              <p className="text-[11px] font-bold text-slate-400">Сол жақ</p>
            </div>

            {task.terms.map((term, index) => {
              const isSelected = selectedTermId === term.id;
              const isUsed = task.definitions.some(
                (definition) => session.answers.matching[definition.id] === term.id
              );

              return (
                <button
                  key={term.id}
                  ref={(element) => {
                    leftRefs.current[term.id] = element;
                  }}
                  type="button"
                  onClick={() => setSelectedTermId(term.id)}
                  className={`flex min-h-[82px] w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    isSelected
                      ? "border-[#5b4ce6] bg-[#f1efff] text-[#5b4ce6] shadow-sm"
                      : isUsed
                        ? "border-[#ddd6ff] bg-[#f8f7ff] text-slate-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#ddd6ff] hover:bg-white"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black ${
                      isSelected
                        ? "bg-[#5b4ce6] text-white"
                        : "bg-white text-[#5b4ce6] shadow-sm"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-black leading-5">
                      {term.label}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">
                      {isUsed ? "Сәйкестендірілген" : "Таңдау үшін басыңыз"}
                    </p>
                  </div>

                  {isSelected || isUsed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Анықтамалар
              </p>
              <p className="text-[11px] font-bold text-slate-400">Оң жақ</p>
            </div>

            {task.definitions.map((definition, index) => {
              const matchedTermId = session.answers.matching[definition.id];
              const matchedTermLabel = getTermLabel(matchedTermId);
              const hasMatch = Boolean(matchedTermId);

              return (
                <div
                  key={definition.id}
                  ref={(element) => {
                    rightRefs.current[definition.id] = element;
                  }}
                  className={`relative min-h-[82px] rounded-2xl border px-3 py-3 transition ${
                    hasMatch
                      ? "border-[#ddd6ff] bg-[#f8f7ff]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {hasMatch ? (
                    <button
                      type="button"
                      onClick={() => clearMatch(definition.id)}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                      title="Байланысты өшіру"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleDefinitionClick(definition.id)}
                    className="w-full pr-7 text-left"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black ${
                          hasMatch
                            ? "bg-[#5b4ce6] text-white"
                            : "bg-white text-slate-500 shadow-sm"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      {hasMatch ? (
                        <span className="inline-flex max-w-[230px] items-center gap-1 rounded-full border border-[#ddd6ff] bg-white px-2.5 py-1 text-[11px] font-black text-[#5b4ce6]">
                          <Link2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{matchedTermLabel}</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-400">
                          {selectedTermId
                            ? "Осы анықтаманы таңдаңыз"
                            : "Алдымен термин таңдаңыз"}
                        </span>
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-700">
                      {definition.label}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {matchedCount < task.definitions.length ? (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">
          Нәтижеге өту үшін барлық анықтаманы терминдермен сәйкестендіріңіз.
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700">
          Барлық анықтама сәйкестендірілді. Енді “Келесі” батырмасын басып,
          нәтижені көріңіз.
        </div>
      )}
    </section>
  );
}