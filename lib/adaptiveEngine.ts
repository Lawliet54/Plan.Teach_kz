import type { TopicLevel } from "@/data/physicsTopics";

export type AdaptiveDecisionType =
  | "completed_level_up_next"
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

export const TOPIC_PASS_PERCENT = 70;
export const NEXT_LEVEL_UP_PERCENT = 90;

export function getAdaptiveStorageKey(grade: number, topicSlug: string) {
  return `adaptive-progress:${grade}:${topicSlug}`;
}

export function getNextLevel(level: TopicLevel): TopicLevel {
  if (level === "basic") return "medium";
  if (level === "medium") return "advanced";
  return "advanced";
}

export function getPreviousLevel(level: TopicLevel): TopicLevel {
  if (level === "advanced") return "medium";
  if (level === "medium") return "basic";
  return "basic";
}

function createInitialProgress(level: TopicLevel): StoredAdaptiveProgress {
  return {
    currentLevel: level,
    nextRecommendedLevel: level,
    isCompleted: false,
    attempts: 0,
    bestPercent: 0,
    history: [],
  };
}

export function readAdaptiveProgress(
  grade: number,
  topicSlug: string
): StoredAdaptiveProgress | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(
      getAdaptiveStorageKey(grade, topicSlug)
    );

    if (!raw) return null;

    return JSON.parse(raw) as StoredAdaptiveProgress;
  } catch {
    return null;
  }
}

export function getAdaptiveTopicLevel(
  grade: number,
  topicSlug: string,
  fallbackLevel: TopicLevel = "basic"
): TopicLevel {
  const progress = readAdaptiveProgress(grade, topicSlug);

  if (!progress) return fallbackLevel;

  return progress.currentLevel ?? fallbackLevel;
}

function buildDecision(params: {
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
          "Тақырып сәтті аяқталды. Оқушы күрделі деңгейде жоғары нәтиже көрсетті.",
        recommendation:
          "Келесі тақырып күрделі деңгейде ашылады. Қосымша ретінде жобалық тапсырма беруге болады.",
      };
    }

    return {
      type: "completed_level_up_next",
      currentTopicLevel: level,
      nextTopicLevel: nextLevel,
      isCompleted: true,
      message:
        "Тақырып сәтті аяқталды. Нәтиже 90%-дан жоғары болғандықтан, келесі тақырып бір деңгей жоғары ашылады.",
      recommendation:
        `Келесі тақырып ${nextLevel === "medium" ? "орташа" : "күрделі"} деңгейде беріледі.`,
    };
  }

  if (percent >= TOPIC_PASS_PERCENT) {
    return {
      type: "completed_keep_level",
      currentTopicLevel: level,
      nextTopicLevel: level,
      isCompleted: true,
      message:
        "Тақырып аяқталды. Нәтиже жеткілікті, бірақ деңгей көтерілмейді.",
      recommendation:
        "Келесі тақырып осы деңгейде беріледі. Формула мен негізгі ұғымдарды бекіту ұсынылады.",
    };
  }

  return {
    type: "retry_required",
    currentTopicLevel: level,
    nextTopicLevel: level,
    isCompleted: false,
    message:
      attemptNumber > 1
        ? "Тақырып әлі өтпеді. Қайта тапсырған кезде де нәтиже 70%-дан төмен болды."
        : "Тақырып әлі өтпеді. Келесі тақырып ашылмайды.",
    recommendation:
      attemptNumber > 1
        ? "AI осы тақырыптағы әлсіз жерлерді көрсетіп, теорияны қайта түсіндіруі керек. Оқушы осы тақырыпты қайта тапсырады."
        : "Алдымен теорияны қайта оқып, осы тақырыптың тапсырмасын қайта орындау керек.",
  };
}

export function saveAdaptiveAttempt(
  input: AdaptiveAttemptInput
): StoredAdaptiveProgress {
  if (typeof window === "undefined") {
    return createInitialProgress(input.level);
  }

  const oldProgress =
    readAdaptiveProgress(input.grade, input.topicSlug) ??
    createInitialProgress(input.level);

  const attemptNumber = oldProgress.attempts + 1;

  const decision = buildDecision({
    level: input.level,
    percent: input.percent,
    attemptNumber,
  });

  const nextProgress: StoredAdaptiveProgress = {
    currentLevel: input.level,
    nextRecommendedLevel: decision.nextTopicLevel,
    isCompleted: decision.isCompleted,
    attempts: attemptNumber,
    bestPercent: Math.max(oldProgress.bestPercent, input.percent),
    lastPercent: input.percent,
    lastCompletedAt: new Date().toISOString(),
    decision,
    history: [
      ...(oldProgress.history ?? []),
      {
        level: input.level,
        percent: input.percent,
        correct: input.correct,
        total: input.total,
        completedAt: new Date().toISOString(),
      },
    ].slice(-30),
  };

  window.localStorage.setItem(
    getAdaptiveStorageKey(input.grade, input.topicSlug),
    JSON.stringify(nextProgress)
  );

  return nextProgress;
}

export function resetAdaptiveProgress(grade: number, topicSlug: string) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(getAdaptiveStorageKey(grade, topicSlug));
}