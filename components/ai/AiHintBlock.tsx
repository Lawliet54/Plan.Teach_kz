"use client";

import { useState } from "react";
import { Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { generateTaskHintAction } from "@/app/ai/actions";
import type { AiTaskHint } from "@/lib/ai/types";

type AiHintBlockProps = {
  taskId: string;
  taskTitle: string;
  taskBody: string;
  answerType: string;
  difficulty: string;
  latestHint?: AiTaskHint | null;
};

const hintLevels = [
  { level: 1, label: "Қарапайым кеңес" },
  { level: 2, label: "Формула бойынша кеңес" },
  { level: 3, label: "Қадамдық бағыт" },
  { level: 4, label: "Ұқсас мысал" },
];

export function AiHintBlock({
  taskId,
  taskTitle,
  taskBody,
  answerType,
  difficulty,
  latestHint,
}: AiHintBlockProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentHint, setCurrentHint] = useState(latestHint);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateHint = async (level: 1 | 2 | 3 | 4) => {
    setIsLoading(true);
    setError(null);

    try {
      const hint = await generateTaskHintAction(
        taskId,
        taskTitle,
        taskBody,
        answerType,
        difficulty,
        level
      );
      setCurrentHint(hint);
    } catch (err) {
      console.error("Failed to generate hint:", err);
      setError("Кеңес құра алмадым. Кейін қайталап көріңіз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-[#5b4ce6]" />
        <h3 className="font-bold text-slate-900">AI кеңес</h3>
      </div>

      {currentHint ? (
        <div className="rounded bg-[#f1efff] p-3 text-sm text-slate-700">
          <p className="mb-1 text-xs font-bold text-[#5b4ce6]">
            {
              hintLevels.find((h) => h.level === currentHint.hint_level)
                ?.label
            }
          </p>
          <p>{currentHint.hint_text}</p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <p className="text-xs text-slate-400">
          Төмендегі кеңес түрлеріндің бірін таңдаңыз
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
        {hintLevels.map((hint) => (
          <button
            key={hint.level}
            onClick={() => handleGenerateHint(hint.level as 1 | 2 | 3 | 4)}
            disabled={isLoading}
            className="flex items-center justify-center gap-1 rounded border border-[#5b4ce6] bg-white px-2.5 py-2 text-xs font-bold text-[#5b4ce6] hover:bg-[#f1efff] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : null}
            {hint.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
