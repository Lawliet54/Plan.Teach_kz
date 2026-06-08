"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

type DiagnosticQuestion = {
  id: string;
  grade: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type DiagnosticFormProps = {
  questions: DiagnosticQuestion[];
};


function getDifficultyLabel(difficulty: DiagnosticQuestion["difficulty"]) {
  if (difficulty === "easy") {
    return "Жеңіл";
  }

  if (difficulty === "medium") {
    return "Орташа";
  }

  return "Күрделі";
}

export function DiagnosticForm({ questions }: DiagnosticFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0;
    }

    return Math.round((answeredCount / questions.length) * 100);
  }, [answeredCount, questions.length]);

  if (!currentQuestion) {
    return (
      <EmptyState
        icon={<ClipboardCheck className="h-5 w-5" />}
        title="Диагностика сұрақтары табылмады"
        description="Supabase дерекқорына диагностика сұрақтарын енгізу қажет."
      />
    );
  }

  const options = [
    ["A", currentQuestion.option_a],
    ["B", currentQuestion.option_b],
    ["C", currentQuestion.option_c],
    ["D", currentQuestion.option_d],
  ];

  const selectedAnswer = answers[currentQuestion.id];

  function selectAnswer(value: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: value,
    }));
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function goPrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  return (
    <form action="/onboarding/diagnostic/submit" method="post">
      {Object.entries(answers).map(([questionId, answer]) => (
        <input
          key={questionId}
          type="hidden"
          name={`question_${questionId}`}
          value={answer}
        />
      ))}

      <Card className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-[var(--text)]">
              Орындалу барысы
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {answeredCount} / {questions.length} сұраққа жауап берілді
            </p>
          </div>

          <Badge variant={allAnswered ? "success" : "primary"}>
            {progress}%
          </Badge>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_180px]">
        <Card className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{currentQuestion.grade}-сынып</Badge>
            <Badge>{currentQuestion.topic}</Badge>
            <Badge>{getDifficultyLabel(currentQuestion.difficulty)}</Badge>
          </div>

          <p className="mt-4 text-sm font-extrabold leading-6 text-[var(--text)] sm:text-base">
            {currentIndex + 1}. {currentQuestion.question_text}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {options.map(([option, text]) => {
              const active = selectedAnswer === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectAnswer(option)}
                  className={cn(
                    "flex min-h-14 items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-left text-sm transition",
                    active
                      ? "border-[var(--primary)] bg-[var(--purple-soft)]"
                      : "border-[var(--border)] bg-white hover:border-[var(--border-accent)] hover:bg-[var(--surface-soft)]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black",
                      active
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--surface-muted)] text-[var(--text-soft)]"
                    )}
                  >
                    {option}
                  </span>

                  <span className="pt-0.5 leading-5 text-[var(--text-soft)]">
                    {text}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-soft)] pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goPrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Артқа
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button type="submit" disabled={!allAnswered}>
                <CheckCircle2 className="h-4 w-4" />
                Диагностиканы аяқтау
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                disabled={!selectedAnswer}
              >
                Келесі
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!allAnswered && currentIndex === questions.length - 1 ? (
            <p className="mt-3 text-xs font-semibold text-[var(--warning)]">
              Диагностиканы аяқтау үшін барлық сұраққа жауап беріңіз.
            </p>
          ) : null}
        </Card>

        <Card className="h-fit p-3">
          <p className="text-xs font-extrabold text-[var(--text)]">Сұрақтар</p>

          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {questions.map((question, index) => {
              const answered = Boolean(answers[question.id]);
              const active = index === currentIndex;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "grid h-7 place-items-center rounded-[var(--radius-xs)] border text-[10px] font-extrabold transition",
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : answered
                        ? "border-[#bbf7d0] bg-[var(--green-soft)] text-[var(--success)]"
                        : "border-[var(--border)] bg-white text-[var(--text-muted)]"
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </form>
  );
}