"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { analyzeSolutionAction } from "@/app/ai/actions";
import type { AiSolutionReview } from "@/lib/ai/types";

type AiSolutionAnalyzerProps = {
  taskId: string;
  taskTitle: string;
  answerType: string;
  correctAnswer: string | null;
  solution: string | null;
  studentAnswer: string;
  attemptId: string | null;
  latestReview?: AiSolutionReview | null;
};

export function AiSolutionAnalyzer({
  taskId,
  taskTitle,
  answerType,
  correctAnswer,
  solution,
  studentAnswer,
  attemptId,
  latestReview,
}: AiSolutionAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState(latestReview);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const review = await analyzeSolutionAction(
        taskId,
        taskTitle,
        answerType,
        correctAnswer,
        solution,
        studentAnswer,
        attemptId
      );
      setCurrentReview(review);
    } catch (err) {
      console.error("Failed to analyze solution:", err);
      setError("Талдау құра алмадым. Кейін қайталап көріңіз.");
    } finally {
      setIsLoading(false);
    }
  };

  // For image answers, don't analyze
  if (answerType === "image") {
    return (
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-slate-400" />
          <h3 className="font-bold text-slate-900">AI талдау</h3>
        </div>
        <p className="text-xs text-slate-500">
          Сурет арқылы жауапты мұғалім тексереді.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-[#5b4ce6]" />
        <h3 className="font-bold text-slate-900">AI талдау</h3>
      </div>

      {currentReview ? (
        <div className="space-y-2 rounded bg-[#f1efff] p-3">
          {currentReview.formula_feedback ? (
            <div>
              <p className="text-xs font-bold text-[#5b4ce6]">Формула:</p>
              <p className="text-xs text-slate-700">
                {currentReview.formula_feedback}
              </p>
            </div>
          ) : null}

          {currentReview.unit_feedback ? (
            <div>
              <p className="text-xs font-bold text-[#5b4ce6]">Бірліктер:</p>
              <p className="text-xs text-slate-700">
                {currentReview.unit_feedback}
              </p>
            </div>
          ) : null}

          {currentReview.logic_feedback ? (
            <div>
              <p className="text-xs font-bold text-[#5b4ce6]">Логика:</p>
              <p className="text-xs text-slate-700">
                {currentReview.logic_feedback}
              </p>
            </div>
          ) : null}

          {currentReview.final_answer_feedback ? (
            <div>
              <p className="text-xs font-bold text-[#5b4ce6]">Соңғы жауап:</p>
              <p className="text-xs text-slate-700">
                {currentReview.final_answer_feedback}
              </p>
            </div>
          ) : null}

          {currentReview.overall_feedback ? (
            <div className="border-t border-[#5b4ce6] pt-2">
              <p className="text-xs font-bold text-[#5b4ce6]">Қорытынды:</p>
              <p className="text-xs text-slate-700">
                {currentReview.overall_feedback}
              </p>
            </div>
          ) : null}

          {currentReview.score !== null ? (
            <div className="border-t border-[#5b4ce6] pt-2">
              <p className="text-xs font-bold text-[#5b4ce6]">
                Баға: {currentReview.score}%
              </p>
            </div>
          ) : null}
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-400">
          Өзінің жауабын AI талдаттыңыз
        </p>
      )}

      {!currentReview ? (
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded bg-[#5b4ce6] px-3 py-2 text-xs font-bold text-white hover:bg-[#4a3bad] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : null}
          AI талдау істе
        </button>
      ) : null}
    </Card>
  );
}
