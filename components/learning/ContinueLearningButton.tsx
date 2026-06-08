"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlayCircle } from "lucide-react";

import { fetchAdaptiveProgress } from "@/lib/adaptiveEngine";
import { getContinueLearningTarget } from "@/lib/learningProgress";

type ContinueLearningButtonProps = {
  profileLevel?: string | null;
};

export function ContinueLearningButton({
  profileLevel,
}: ContinueLearningButtonProps) {
  const [href, setHref] = useState("/topics");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchAdaptiveProgress()
      .then(() => {
        if (!active) return;

        const target = getContinueLearningTarget(profileLevel);
        setHref(target.href);
      })
      .catch(() => {
        if (!active) return;

        setHref("/topics");
      })
      .finally(() => {
        if (!active) return;

        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [profileLevel]);

  return (
    <Link
      href={isLoading ? "/topics" : href}
      className="inline-flex h-10 w-fit items-center justify-center rounded-2xl bg-[#0f172a] px-4 text-sm font-black text-white shadow-sm ring-1 ring-white/15 transition hover:bg-[#1e293b]"
    >
      {isLoading ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <PlayCircle className="mr-1.5 h-4 w-4" />
      )}

      Оқуды жалғастыру
    </Link>
  );
}