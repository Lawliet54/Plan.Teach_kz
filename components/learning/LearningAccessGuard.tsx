"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

import type { Grade, TopicLevel } from "@/data/physicsTopics";
import { fetchAdaptiveProgress } from "@/lib/adaptiveEngine";
import {
  getLearningAccessRedirect,
  type LearningAccessMode,
} from "@/lib/learningProgress";

type LearningAccessGuardProps = {
  grade: Grade;
  topicSlug: string;
  level: TopicLevel;
  mode: LearningAccessMode;
  profileLevel?: string | null;
  children: ReactNode;
};

export function LearningAccessGuard({
  grade,
  topicSlug,
  level,
  mode,
  profileLevel,
  children,
}: LearningAccessGuardProps) {
  const router = useRouter();

  const [status, setStatus] = useState<"checking" | "ready" | "error">(
    "checking"
  );

  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    setStatus("checking");

    void fetchAdaptiveProgress(grade)
      .then(() => {
        if (!active) return;

        const redirect = getLearningAccessRedirect({
          grade,
          topicSlug,
          requestedLevel: level,
          mode,
          initialLevel: profileLevel,
        });

        if (redirect) {
          router.replace(redirect.href);
          return;
        }

        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;

        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [grade, level, mode, profileLevel, retryKey, router, topicSlug]);

  if (status === "error") {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[10px] border border-rose-200 bg-white p-4 text-center">
        <div>
          <p className="text-sm font-bold text-rose-700">
            Оқу прогресін жүктеу мүмкін болмады.
          </p>

          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Қайта тексеру
          </button>
        </div>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[10px] border border-slate-200 bg-white text-sm font-semibold text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Оқу бағыты тексеріліп жатыр...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}