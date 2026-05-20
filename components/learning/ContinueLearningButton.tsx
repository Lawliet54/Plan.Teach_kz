"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { getContinueLearningTarget } from "@/lib/learningProgress";

type ContinueLearningButtonProps = {
  profileLevel?: string | null;
};

export function ContinueLearningButton({
  profileLevel,
}: ContinueLearningButtonProps) {
  const [href, setHref] = useState("/topics");

  useEffect(() => {
    const target = getContinueLearningTarget(profileLevel);
    setHref(target.href);
  }, [profileLevel]);

  return (
    <Link
      href={href}
      className="inline-flex h-10 w-fit items-center justify-center rounded-2xl bg-[#0f172a] px-4 text-sm font-black text-white shadow-sm ring-1 ring-white/15 transition hover:bg-[#1e293b]"
    >
      <PlayCircle className="mr-1.5 h-4 w-4" />
      Оқуды жалғастыру
    </Link>
  );
}
