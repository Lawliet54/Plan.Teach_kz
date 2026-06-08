import type { TopicLevel } from "@/data/physicsTopics";

export type AdaptiveDecisionType =
  | "completed_next_higher"
  | "completed_keep_level"
  | "retry_required"
  | "mastered";

export type AdaptiveAttemptInput = {
  grade: number;
  topicSlug: string;
  level: TopicLevel;
  percent: number;
  correct: number;
  total: number;
};

export type AdaptiveHistoryItem = {
  level: TopicLevel;
  percent: number;
  correct: number;
  total: number;
  completedAt: string;
};

export type AdaptiveDecision = {
  type: AdaptiveDecisionType;
  currentTopicLevel: TopicLevel;
  nextTopicLevel: TopicLevel;
  isCompleted: boolean;
  message: string;
  recommendation: string;
};

export type StoredAdaptiveProgress = {
  currentLevel: TopicLevel;
  nextRecommendedLevel: TopicLevel;
  isCompleted: boolean;
  attempts: number;
  bestPercent: number;
  lastPercent?: number;
  lastCompletedAt?: string;
  decision?: AdaptiveDecision;
  history: AdaptiveHistoryItem[];
};

export type AdaptiveProgressRecord = StoredAdaptiveProgress & {
  grade: number;
  topicSlug: string;
};

export type SaveAdaptiveAttemptRemoteResult = {
  progress: AdaptiveProgressRecord;
  gradeProgress: AdaptiveProgressRecord[];
  decision: AdaptiveDecision;
};

export const TOPIC_PASS_PERCENT = 70;
export const NEXT_LEVEL_UP_PERCENT = 90;

const adaptiveProgressCache = new Map<string, AdaptiveProgressRecord>();

export function getAdaptiveStorageKey(grade: number, topicSlug: string) {
  return `adaptive-progress:${grade}:${topicSlug}`;
}

export function getNextLevel(level: TopicLevel): TopicLevel {
  if (level === "basic") return "medium";
  if (level === "medium") return "advanced";

  return "advanced";
}

export function createInitialProgress(
  level: TopicLevel
): StoredAdaptiveProgress {
  return {
    currentLevel: level,
    nextRecommendedLevel: level,
    isCompleted: false,
    attempts: 0,
    bestPercent: 0,
    history: [],
  };
}

export function buildAdaptiveDecision(params: {
  level: TopicLevel;
  percent: number;
  attemptNumber: number;
}): AdaptiveDecision {
  const { level, percent, attemptNumber } = params;

  if (percent >= NEXT_LEVEL_UP_PERCENT) {
    const nextLevel = getNextLevel(level);

    if (level === "advanced") {
      return {
        type: "mastered",
        currentTopicLevel: level,
        nextTopicLevel: "advanced",
        isCompleted: true,
        message:
          "Тақырып сәтті аяқталды. Күрделі деңгейде жоғары нәтиже көрсетілді.",
        recommendation:
          "Келесі тақырып күрделі деңгейде ашылады. Қосымша жобалық тапсырма орындауға болады.",
      };
    }

    return {
      type: "completed_next_higher",
      currentTopicLevel: level,
      nextTopicLevel: nextLevel,
      isCompleted: true,
      message: "Тақырып сәтті аяқталды. Нәтиже 90%-дан жоғары.",
      recommendation: `Келесі тақырып ${
        nextLevel === "medium" ? "орташа" : "күрделі"
      } деңгейде беріледі.`,
    };
  }

  if (percent >= TOPIC_PASS_PERCENT) {
    return {
      type: "completed_keep_level",
      currentTopicLevel: level,
      nextTopicLevel: level,
      isCompleted: true,
      message: "Тақырып аяқталды. Нәтиже жеткілікті.",
      recommendation:
        "Келесі тақырып осы деңгейде беріледі. Негізгі ұғымдарды бекіту ұсынылады.",
    };
  }

  return {
    type: "retry_required",
    currentTopicLevel: level,
    nextTopicLevel: level,
    isCompleted: false,
    message:
      attemptNumber > 1
        ? "Қайта тапсыру нәтижесі де 70%-дан төмен болды."
        : "Тақырып әлі аяқталмады. Келесі тақырып ашылмайды.",
    recommendation:
      attemptNumber > 1
        ? "AI көмекші арқылы әлсіз тұстарды қарап, теорияны қайталап шығыңыз."
        : "Теорияны қайта оқып, тапсырманы қайта орындаңыз.",
  };
}

export function cacheAdaptiveProgress(records: AdaptiveProgressRecord[]) {
  records.forEach((record) => {
    adaptiveProgressCache.set(
      getAdaptiveStorageKey(record.grade, record.topicSlug),
      {
        ...record,
        history: record.history ?? [],
      }
    );
  });
}

export function clearCachedAdaptiveProgress(grade?: number) {
  if (typeof grade !== "number") {
    adaptiveProgressCache.clear();
    return;
  }

  adaptiveProgressCache.forEach((record, key) => {
    if (record.grade === grade) {
      adaptiveProgressCache.delete(key);
    }
  });
}

export function replaceCachedAdaptiveProgress(
  records: AdaptiveProgressRecord[],
  grade?: number
) {
  clearCachedAdaptiveProgress(grade);
  cacheAdaptiveProgress(records);
}

export function getCachedAdaptiveProgressList() {
  return Array.from(adaptiveProgressCache.values());
}

export function readAdaptiveProgress(
  grade: number,
  topicSlug: string
): AdaptiveProgressRecord | null {
  return (
    adaptiveProgressCache.get(getAdaptiveStorageKey(grade, topicSlug)) ?? null
  );
}

export function getAdaptiveTopicLevel(
  grade: number,
  topicSlug: string,
  fallbackLevel: TopicLevel = "basic"
): TopicLevel {
  const progress = readAdaptiveProgress(grade, topicSlug);

  return progress?.currentLevel ?? fallbackLevel;
}

export async function fetchAdaptiveProgress(
  grade?: number
): Promise<AdaptiveProgressRecord[]> {
  const params = new URLSearchParams();

  if (typeof grade === "number") {
    params.set("grade", String(grade));
  }

  const query = params.toString();

  const response = await fetch(
    query ? `/api/learning/progress?${query}` : "/api/learning/progress",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const body = (await response.json()) as {
    progress?: AdaptiveProgressRecord[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error || "Прогресті жүктеу мүмкін болмады.");
  }

  const progress = body.progress ?? [];

  replaceCachedAdaptiveProgress(progress, grade);

  return progress;
}

export async function saveAdaptiveAttemptRemote(
  input: AdaptiveAttemptInput
): Promise<SaveAdaptiveAttemptRemoteResult> {
  const response = await fetch("/api/learning/attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grade: input.grade,
      topicSlug: input.topicSlug,
      level: input.level,
      correct: input.correct,
      total: input.total,
    }),
  });

  const body = (await response.json()) as {
    progress?: AdaptiveProgressRecord;
    gradeProgress?: AdaptiveProgressRecord[];
    decision?: AdaptiveDecision;
    error?: string;
  };

  if (
    !response.ok ||
    !body.progress ||
    !body.gradeProgress ||
    !body.decision
  ) {
    throw new Error(body.error || "Нәтижені сақтау мүмкін болмады.");
  }

  replaceCachedAdaptiveProgress(body.gradeProgress, input.grade);

  return {
    progress: body.progress,
    gradeProgress: body.gradeProgress,
    decision: body.decision,
  };
}