"use client";

import { CheckCircle2, PenLine } from "lucide-react";
import { CardTitle } from "@/components/ui/Card";
import type { PhysicsTopic, TopicLevel } from "@/data/physicsTopics";
import type { TaskSessionState } from "@/lib/taskSession";
import { getFillBlankQuestions } from "@/lib/taskSessionFillBlank";

type FillBlankTaskStepProps = {
  topic: PhysicsTopic;
  level: TopicLevel;
  session: TaskSessionState;
  onSessionChange: (session: TaskSessionState) => void;
};

export function FillBlankTaskStep({
  topic,
  level,
  session,
  onSessionChange,
}: FillBlankTaskStepProps) {
  const questions = getFillBlankQuestions(topic, level);

  const filledCount = questions.filter((question) => {
    const value = session.answers.fillBlank[question.id];
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  function updateAnswer(questionId: string, value: string) {
    onSessionChange({
      ...session,
      answers: {
        ...session.answers,
        fillBlank: {
          ...session.answers.fillBlank,
          [questionId]: value,
        },
      },
      updatedAt: new Date().toISOString(),
    });
  }

  function putWord(questionId: string, word: string) {
    updateAnswer(questionId, word);
  }

  return (
    <section className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
            <PenLine className="h-4 w-4" />
          </div>

          <div>
            <CardTitle>2. Бос орындарды толтыру</CardTitle>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Сөйлемдегі бос орындарды дұрыс сөзбен немесе формуламен
              толықтырыңыз.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] px-3 py-2">
          <p className="text-[11px] font-bold text-[#5b4ce6]">Толтырылды</p>
          <p className="text-sm font-black text-slate-950">
            {filledCount}/{questions.length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const value = session.answers.fillBlank[question.id] ?? "";
          const isFilled = value.trim().length > 0;

          return (
            <div
              key={question.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-3 flex items-start gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-[#5b4ce6] shadow-sm">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-8 text-slate-800">
                    <span>{question.before}</span>{" "}
                    <input
                      value={value}
                      onChange={(event) =>
                        updateAnswer(question.id, event.target.value)
                      }
                      className="mx-1 inline-flex h-8 min-w-[120px] rounded-xl border border-slate-200 bg-white px-2.5 text-center text-sm font-black text-slate-950 outline-none transition focus:border-[#5b4ce6]"
                      placeholder="..."
                    />{" "}
                    <span>{question.after}</span>
                  </div>

                  {isFilled ? (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Жауап жазылды
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] font-bold text-slate-400">
                      Бос орынды толтырыңыз
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Көмекші сөздер
                </p>

                <div className="flex flex-wrap gap-2">
                  {question.wordBank.map((word) => {
                    const isSelected = value.trim() === word;

                    return (
                      <button
                        key={`${question.id}-${word}`}
                        type="button"
                        onClick={() => putWord(question.id, word)}
                        className={`rounded-xl border px-2.5 py-1.5 text-[11px] font-black transition ${
                          isSelected
                            ? "border-[#5b4ce6] bg-[#f1efff] text-[#5b4ce6]"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#ddd6ff] hover:bg-[#f8f7ff]"
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filledCount < questions.length ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-700">
          Келесі кезеңге өту үшін барлық бос орынды толтырыңыз.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700">
          Барлық бос орын толтырылды. Енді “Келесі” батырмасын басыңыз.
        </div>
      )}
    </section>
  );
}