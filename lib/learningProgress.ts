import {
  getTopicsByGrade,
  physicsTopics,
  type Grade,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import {
  readAdaptiveProgress,
  type StoredAdaptiveProgress,
} from "@/lib/adaptiveEngine";

export type TopicOpenStatus = "completed" | "current" | "locked";

export type TopicLearningState = {
  topic: PhysicsTopic;
  status: TopicOpenStatus;
  canOpen: boolean;
  level: TopicLevel;
  progressPercent: number;
  lastPercent: number | null;
  attempts: number;
  href: string;
  actionLabel: string;
  lockReason?: string;
};

export type ContinueLearningTarget = {
  topic: PhysicsTopic;
  level: TopicLevel;
  href: string;
  label: string;
  description: string;
};

export const TOPIC_PASS_PERCENT = 70;

function isBrowser() {
  return typeof window !== "undefined";
}

function getTopicProgress(
  grade: number,
  topicSlug: string
): StoredAdaptiveProgress | null {
  if (!isBrowser()) return null;

  return readAdaptiveProgress(grade, topicSlug);
}

function isTopicCompleted(progress: StoredAdaptiveProgress | null) {
  if (!progress) return false;

  return Boolean(progress.isCompleted) || (progress.lastPercent ?? 0) >= 70;
}

function getNextTopicLevelFromPrevious(
  previousProgress: StoredAdaptiveProgress | null,
  fallbackLevel: TopicLevel
): TopicLevel {
  if (!previousProgress) return fallbackLevel;

  if (!isTopicCompleted(previousProgress)) {
    return fallbackLevel;
  }

  return previousProgress.nextRecommendedLevel ?? previousProgress.currentLevel;
}

export function getTopicHref(topic: PhysicsTopic, level: TopicLevel) {
  return `/topics/${topic.grade}/${topic.slug}?level=${level}`;
}

export function getTaskSessionHref(topic: PhysicsTopic, level: TopicLevel) {
  return `/tasks/session?grade=${topic.grade}&topic=${topic.slug}&level=${level}`;
}

export function getGradeLearningStates(grade: Grade): TopicLearningState[] {
  const topics = getTopicsByGrade(grade);

  let previousCompleted = true;
  let nextLevel: TopicLevel = "basic";

  return topics.map((topic, index) => {
    const progress = getTopicProgress(topic.grade, topic.slug);
    const completed = isTopicCompleted(progress);

    const canOpen = index === 0 || previousCompleted;

    const level: TopicLevel = progress?.currentLevel ?? nextLevel;

    const status: TopicOpenStatus = completed
      ? "completed"
      : canOpen
        ? "current"
        : "locked";

    const lastPercent = progress?.lastPercent ?? null;

    const state: TopicLearningState = {
      topic,
      status,
      canOpen,
      level,
      progressPercent: completed ? 100 : lastPercent ?? 0,
      lastPercent,
      attempts: progress?.attempts ?? 0,
      href: getTopicHref(topic, level),
      actionLabel: completed
        ? "Қайталау"
        : canOpen
          ? progress?.attempts
            ? "Қайта тапсыру"
            : "Бастау"
          : "Жабық",
      lockReason: canOpen
        ? undefined
        : "Алдымен алдыңғы тақырыпты 70% немесе одан жоғары нәтижемен аяқтаңыз.",
    };

    previousCompleted = completed;

    if (completed) {
      nextLevel = getNextTopicLevelFromPrevious(progress, level);
    }

    return state;
  });
}

export function getFirstCurrentTopicState(
  grade: Grade
): TopicLearningState | null {
  const states = getGradeLearningStates(grade);

  return (
    states.find((state) => state.status === "current") ??
    states.find((state) => state.status === "completed") ??
    states[0] ??
    null
  );
}

export function getContinueLearningTarget(): ContinueLearningTarget {
  const firstTopic = physicsTopics[0];

  const fallback: ContinueLearningTarget = {
    topic: firstTopic,
    level: "basic",
    href: getTopicHref(firstTopic, "basic"),
    label: firstTopic.title,
    description: `${firstTopic.grade}-сынып · алғашқы тақырып`,
  };

  if (!isBrowser()) return fallback;

  for (const grade of [7, 8, 9, 10, 11] as Grade[]) {
    const states = getGradeLearningStates(grade);
    const current = states.find((state) => state.status === "current");

    if (current) {
      return {
        topic: current.topic,
        level: current.level,
        href: current.href,
        label: current.topic.title,
        description:
          current.attempts > 0
            ? `${current.topic.grade}-сынып · қайта тапсыру`
            : `${current.topic.grade}-сынып · жалғастыру`,
      };
    }
  }

  return fallback;
}

export function getNextTopicTargetInGrade(
  grade: Grade
): ContinueLearningTarget | null {
  const states = getGradeLearningStates(grade);
  const current = states.find((state) => state.status === "current");

  if (!current) return null;

  return {
    topic: current.topic,
    level: current.level,
    href: current.href,
    label: current.topic.title,
    description:
      current.attempts > 0
        ? `${current.topic.grade}-сынып · қайта тапсыру`
        : `${current.topic.grade}-сынып · келесі тақырып`,
  };
}

export type LearningAccessMode = "topic" | "task";

export type LearningAccessRedirect = {
  href: string;
  reason: "locked" | "wrong-level" | "not-found";
};

export function getTopicStateBySlug(
  grade: Grade,
  topicSlug: string
): TopicLearningState | null {
  const states = getGradeLearningStates(grade);

  return states.find((state) => state.topic.slug === topicSlug) ?? null;
}

export function getCurrentTopicStateInGrade(
  grade: Grade
): TopicLearningState | null {
  const states = getGradeLearningStates(grade);

  return (
    states.find((state) => state.status === "current") ??
    states.find((state) => state.status === "completed") ??
    states[0] ??
    null
  );
}

function buildAccessHref(params: {
  mode: LearningAccessMode;
  state: TopicLearningState;
}) {
  if (params.mode === "task") {
    return getTaskSessionHref(params.state.topic, params.state.level);
  }

  return getTopicHref(params.state.topic, params.state.level);
}

export function getLearningAccessRedirect(params: {
  grade: Grade;
  topicSlug: string;
  requestedLevel: TopicLevel;
  mode: LearningAccessMode;
}): LearningAccessRedirect | null {
  const requestedState = getTopicStateBySlug(params.grade, params.topicSlug);

  if (!requestedState) {
    return {
      href: `/topics/${params.grade}`,
      reason: "not-found",
    };
  }

  const currentState = getCurrentTopicStateInGrade(params.grade);

  if (requestedState.status === "locked") {
    return {
      href: currentState
        ? buildAccessHref({
            mode: "topic",
            state: currentState,
          })
        : `/topics/${params.grade}`,
      reason: "locked",
    };
  }

  if (requestedState.level !== params.requestedLevel) {
    return {
      href: buildAccessHref({
        mode: params.mode,
        state: requestedState,
      }),
      reason: "wrong-level",
    };
  }

  return null;
}