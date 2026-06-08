import type { Grade, PhysicsTopic, TopicLevel } from "@/data/physicsTopics";

export type TaskStepId = "test" | "fill-blank" | "matching" | "result";

export type TestAnswerMap = Record<string, number>;
export type FillBlankAnswerMap = Record<string, string>;
export type MatchingAnswerMap = Record<string, string>;

export type TaskSessionAnswers = {
  test: TestAnswerMap;
  fillBlank: FillBlankAnswerMap;
  matching: MatchingAnswerMap;
};

export type TaskStepScore = {
  stepId: TaskStepId;
  title: string;
  correct: number;
  total: number;
  percent: number;
};

export type TaskSessionResult = {
  correct: number;
  total: number;
  percent: number;
  stepScores: TaskStepScore[];
};

export type TaskSessionState = {
  grade: Grade;
  topicSlug: string;
  level: TopicLevel;
  currentStepIndex: number;
  answers: TaskSessionAnswers;
  result: TaskSessionResult | null;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  adaptiveSavedAt: string | null;
  adaptiveSaveError: string | null;
};

export type TaskSessionStep = {
  id: TaskStepId;
  title: string;
  description: string;
};

export const taskSessionSteps: TaskSessionStep[] = [
  {
    id: "test",
    title: "Тест",
    description: "5 сұраққа жауап беріңіз.",
  },
  {
    id: "fill-blank",
    title: "Бос орын",
    description: "Мәтіндегі бос орындарды толтырыңыз.",
  },
  {
    id: "matching",
    title: "Сәйкестендіру",
    description: "Терминдерді анықтамалармен сәйкестендіріңіз.",
  },
  {
    id: "result",
    title: "Нәтиже",
    description: "Жалпы нәтиже және AI ұсынысы.",
  },
];

export function getTaskSessionStorageKey(params: {
  grade: number;
  topicSlug: string;
  level: TopicLevel;
}) {
  return `task-session:${params.grade}:${params.topicSlug}:${params.level}`;
}

export function createTaskSession(params: {
  grade: Grade;
  topic: PhysicsTopic;
  level: TopicLevel;
}): TaskSessionState {
  const now = new Date().toISOString();

  return {
    grade: params.grade,
    topicSlug: params.topic.slug,
    level: params.level,
    currentStepIndex: 0,
    answers: {
      test: {},
      fillBlank: {},
      matching: {},
    },
    result: null,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    adaptiveSavedAt: null,
    adaptiveSaveError: null,
  };
}

export function readTaskSession(params: {
  grade: Grade;
  topicSlug: string;
  level: TopicLevel;
}): TaskSessionState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getTaskSessionStorageKey(params));

    if (!raw) return null;

    const stored = JSON.parse(raw) as Partial<TaskSessionState>;

    if (
      !stored.answers ||
      !stored.startedAt ||
      typeof stored.currentStepIndex !== "number"
    ) {
      return null;
    }

    return {
      grade: params.grade,
      topicSlug: params.topicSlug,
      level: params.level,
      currentStepIndex: stored.currentStepIndex,
      answers: stored.answers,
      result: stored.result ?? null,
      startedAt: stored.startedAt,
      updatedAt: stored.updatedAt ?? stored.startedAt,
      completedAt: stored.completedAt ?? null,
      adaptiveSavedAt: stored.adaptiveSavedAt ?? null,
      adaptiveSaveError: stored.adaptiveSaveError ?? null,
    };
  } catch {
    return null;
  }
}

export function saveTaskSession(session: TaskSessionState) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getTaskSessionStorageKey({
      grade: session.grade,
      topicSlug: session.topicSlug,
      level: session.level,
    }),
    JSON.stringify({
      ...session,
      updatedAt: new Date().toISOString(),
    })
  );
}

export function clearTaskSession(params: {
  grade: Grade;
  topicSlug: string;
  level: TopicLevel;
}) {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(getTaskSessionStorageKey(params));
}

export function getCurrentStep(session: TaskSessionState) {
  return taskSessionSteps[session.currentStepIndex] ?? taskSessionSteps[0];
}

export function getStepPercent(session: TaskSessionState) {
  const maxIndex = taskSessionSteps.length - 1;

  if (maxIndex <= 0) return 0;

  return Math.round((session.currentStepIndex / maxIndex) * 100);
}

export function canGoNext(session: TaskSessionState) {
  return session.currentStepIndex < taskSessionSteps.length - 1;
}

export function canGoBack(session: TaskSessionState) {
  return session.currentStepIndex > 0;
}

export function moveTaskSessionNext(session: TaskSessionState): TaskSessionState {
  if (!canGoNext(session)) return session;

  return {
    ...session,
    currentStepIndex: session.currentStepIndex + 1,
    updatedAt: new Date().toISOString(),
  };
}

export function moveTaskSessionBack(session: TaskSessionState): TaskSessionState {
  if (!canGoBack(session)) return session;

  return {
    ...session,
    currentStepIndex: session.currentStepIndex - 1,
    updatedAt: new Date().toISOString(),
  };
}