"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Grade, TopicLevel } from "@/data/physicsTopics";
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
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    setCanShow(false);

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

    setCanShow(true);
  }, [grade, topicSlug, level, mode, profileLevel, router]);

  if (!canShow) {
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
