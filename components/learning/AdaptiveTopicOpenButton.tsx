"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { levelLabels, type TopicLevel } from "@/data/physicsTopics";
import { readAdaptiveProgress } from "@/lib/adaptiveEngine";

type AdaptiveTopicOpenButtonProps = {
  grade: number;
  topicSlug: string;
  fallbackLevel: TopicLevel;
};

export function AdaptiveTopicOpenButton({
  grade,
  topicSlug,
  fallbackLevel,
}: AdaptiveTopicOpenButtonProps) {
  const [level, setLevel] = useState<TopicLevel>(fallbackLevel);
  const [lastPercent, setLastPercent] = useState<number | null>(null);
  const [goodStreak, setGoodStreak] = useState(0);

  useEffect(() => {
    const progress = readAdaptiveProgress(grade, topicSlug);

    if (progress) {
      setLevel(progress.currentLevel);
      setLastPercent(progress.lastPercent ?? null);
      setGoodStreak(progress.goodStreak ?? 0);
    }
  }, [grade, topicSlug]);

  return (
    <div className="mt-3">
      <div className="mb-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-bold text-slate-500">Adaptive деңгей</p>

        <p className="mt-1 text-sm font-black text-[#5b4ce6]">
          {levelLabels[level]}
        </p>

        {lastPercent !== null ? (
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Соңғы нәтиже: {lastPercent}% · жақсы серия: {goodStreak}/3
          </p>
        ) : (
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Әзірге нәтиже жоқ
          </p>
        )}
      </div>

      <Button
        href={`/topics/${grade}/${topicSlug}?level=${level}`}
        className="w-full"
      >
        Тақырыпқа кіру
        <ChevronRight className="ml-1.5 h-4 w-4" />
      </Button>
    </div>
  );
}