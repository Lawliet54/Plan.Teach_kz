"use client";

import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import type { PhysicsTopic, TopicLevel } from "@/data/physicsTopics";
import type { TaskSessionState } from "@/lib/taskSession";
import { getTestQuestions } from "@/lib/taskSessionTest";

type TestTaskStepProps = {
  topic: PhysicsTopic;
  level: TopicLevel;
  session: TaskSessionState;
  onSessionChange: (session: TaskSessionState) => void;
};

export function TestTaskStep({
  topic,
  level,
  session,
  onSessionChange,
}: TestTaskStepProps) {
  const questions = getTestQuestions(topic, level);
  const answeredCount = questions.filter(
    (question) => typeof session.answers.test[question.id] === "number"
  ).length;

  function selectAnswer(questionId: string, optionIndex: number) {
    onSessionChange({
      ...session,
      answers: {
        ...session.answers,
        test: {
          ...session.answers.test,
          [questionId]: optionIndex,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
            <ClipboardCheck className="h-4 w-4" />
          </div>

          <div>
            <CardTitle>1. Тест тапсырмасы</CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Барлық 5 сұраққа жауап беріңіз. Содан кейін келесі кезеңге өтесіз.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-3 py-2">
          <p className="text-[11px] font-bold text-[#5b4ce6]">Жауап берілді</p>
          <p className="text-sm font-black text-slate-950">
            {answeredCount}/{questions.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((question, questionIndex) => {
          const selectedIndex = session.answers.test[question.id];

          return (
            <div
              key={question.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-[#5b4ce6] shadow-sm">
                  {questionIndex + 1}
                </div>

                <div className="min-w-0">
                  <p className="text-[13px] font-black leading-5 text-slate-950 sm:text-sm">
                    {question.question}
                  </p>

                  {typeof selectedIndex === "number" ? (
                    <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Жауап таңдалды
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] font-bold text-slate-400">
                      Жауап таңдаңыз
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = selectedIndex === optionIndex;

                  return (
                    <button
                      key={`${question.id}-${optionIndex}`}
                      type="button"
                      onClick={() => selectAnswer(question.id, optionIndex)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold leading-6 transition ${
                        isSelected
                          ? "border-[#5b4ce6] bg-[#f1efff] text-[#5b4ce6]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#ddd6ff] hover:bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-black ${
                          isSelected
                            ? "bg-[#5b4ce6] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>

                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {answeredCount < questions.length ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">
          Келесі кезеңге өту үшін барлық 5 тест сұрағына жауап беріңіз.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700">
          Барлық тест сұрағына жауап берілді. Енді “Келесі” батырмасын басыңыз.
        </div>
      )}
    </section>
  );
}