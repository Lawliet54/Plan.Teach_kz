import type {
  Grade,
  PhysicsTopic,
  TopicLevel,
} from "@/data/physicsTopics";
import {
  type TaskSessionResult,
  type TaskSessionState,
  type TaskStepScore,
} from "@/lib/taskSession";
import { getTestQuestions } from "@/lib/taskSessionTest";
import {
  getFillBlankQuestions,
  isFillBlankAnswerCorrect,
} from "@/lib/taskSessionFillBlank";
import {
  getMatchingCorrectCount,
  getMatchingTask,
} from "@/lib/taskSessionMatching";

export type TaskResultStatus = "passed" | "retry";

export type TaskResultHistoryItem = {
  id: string;
  grade: Grade;
  topicSlug: string;
  topicTitle: string;
  topicUnit: string;
  level: TopicLevel;
  correct: number;
  total: number;
  percent: number;
  status: TaskResultStatus;
  stepScores: TaskStepScore[];
  completedAt: string;
  recommendation: string;
};

export type TaskResultAiAdvice = {
  title: string;
  summary: string;
  focusAreas: string[];
  mistakeHints: string[];
};

export const TASK_RESULT_HISTORY_KEY = "plan-teach-task-result-history";

function getPercent(correct: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

export function calculateTaskSessionResult(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  session: TaskSessionState;
}): TaskSessionResult {
  const { topic, level, session } = params;

  const testQuestions = getTestQuestions(topic, level);
  const testCorrect = testQuestions.filter((question) => {
    return session.answers.test[question.id] === question.correctIndex;
  }).length;

  const testScore: TaskStepScore = {
    stepId: "test",
    title: "Тест",
    correct: testCorrect,
    total: testQuestions.length,
    percent: getPercent(testCorrect, testQuestions.length),
  };

  const fillQuestions = getFillBlankQuestions(topic, level);
  const fillCorrect = fillQuestions.filter((question) => {
    return isFillBlankAnswerCorrect({
      answer: session.answers.fillBlank[question.id] ?? "",
      correctAnswer: question.correctAnswer,
    });
  }).length;

  const fillScore: TaskStepScore = {
    stepId: "fill-blank",
    title: "Бос орын",
    correct: fillCorrect,
    total: fillQuestions.length,
    percent: getPercent(fillCorrect, fillQuestions.length),
  };

  const matchingTask = getMatchingTask(topic, level);
  const matchingCorrect = getMatchingCorrectCount({
    topic,
    level,
    answers: session.answers.matching,
  });

  const matchingScore: TaskStepScore = {
    stepId: "matching",
    title: "Сәйкестендіру",
    correct: matchingCorrect,
    total: matchingTask.definitions.length,
    percent: getPercent(matchingCorrect, matchingTask.definitions.length),
  };

  const stepScores = [testScore, fillScore, matchingScore];

  const correct = stepScores.reduce((sum, step) => sum + step.correct, 0);
  const total = stepScores.reduce((sum, step) => sum + step.total, 0);

  return {
    correct,
    total,
    percent: getPercent(correct, total),
    stepScores,
  };
}

export function getTaskResultRecommendation(percent: number) {
  if (percent >= 90) {
    return "Өте жақсы нәтиже. Қате кеткен сұрақтар болса, оларды қарап шығып, келесі тақырыпқа дайындалыңыз.";
  }

  if (percent >= 70) {
    return "Тақырыптың негізгі бөлігі түсінікті. Енді қате кеткен жерлерді бекітіп алған дұрыс.";
  }

  return "Нәтиже жеткіліксіз. Алдымен қате кеткен тапсырмаларды талдап, осы тақырыпты қайта орындаңыз.";
}

export function getTaskResultStatus(percent: number): TaskResultStatus {
  return percent >= 70 ? "passed" : "retry";
}

export function buildTaskResultAiAdvice(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  session: TaskSessionState;
  result: TaskSessionResult;
}): TaskResultAiAdvice {
  const { topic, level, session, result } = params;

  const testQuestions = getTestQuestions(topic, level);
  const fillQuestions = getFillBlankQuestions(topic, level);
  const matchingTask = getMatchingTask(topic, level);

  const testWrong = testQuestions.filter((question) => {
    return session.answers.test[question.id] !== question.correctIndex;
  });

  const fillWrong = fillQuestions.filter((question) => {
    return !isFillBlankAnswerCorrect({
      answer: session.answers.fillBlank[question.id] ?? "",
      correctAnswer: question.correctAnswer,
    });
  });

  const matchingWrong = matchingTask.definitions.filter((definition) => {
    return session.answers.matching[definition.id] !== definition.correctTermId;
  });

  const testScore = result.stepScores.find((step) => step.stepId === "test");
  const fillScore = result.stepScores.find(
    (step) => step.stepId === "fill-blank"
  );
  const matchingScore = result.stepScores.find(
    (step) => step.stepId === "matching"
  );

  const focusAreas: string[] = [];

  if ((testScore?.percent ?? 100) < 80) {
    focusAreas.push(
      "Тест сұрақтарында негізгі анықтамалар мен формуланың мағынасын қайталау керек."
    );
  }

  if ((fillScore?.percent ?? 100) < 80) {
    focusAreas.push(
      "Бос орын тапсырмасында негізгі терминдерді, өлшем бірліктерді және формулаларды нақты есте сақтау керек."
    );
  }

  if ((matchingScore?.percent ?? 100) < 80) {
    focusAreas.push(
      "Сәйкестендіруде термин мен анықтаманың байланысын ажыратуға назар аудару керек."
    );
  }

  if (focusAreas.length === 0) {
    focusAreas.push(
      "Негізгі ұғымдар жақсы меңгерілген. Енді осы тақырыпқа ұқсас 1–2 есеп шығарып бекіту ұсынылады."
    );
  }

  const mistakeHints: string[] = [];

  testWrong.slice(0, 3).forEach((question) => {
    mistakeHints.push(
      `Тест: “${question.question}” — ${question.explanation}`
    );
  });

  fillWrong.slice(0, 3).forEach((question) => {
    mistakeHints.push(
      `Бос орын: “${question.before} ___ ${question.after}” — дұрыс жауап: “${question.correctAnswer}”. ${question.explanation}`
    );
  });

  matchingWrong.slice(0, 3).forEach((definition) => {
    const correctTerm = matchingTask.terms.find(
      (term) => term.id === definition.correctTermId
    );

    mistakeHints.push(
      `Сәйкестендіру: “${definition.label}” анықтамасы “${
        correctTerm?.label ?? "дұрыс термин"
      }” терминімен байланысуы керек. Терминнің мағынасын анықтамадағы негізгі сөздер арқылы табыңыз.`
    );
  });

  if (mistakeHints.length === 0) {
    mistakeHints.push(
      "Қате жауап анықталған жоқ. Тақырыпты бекіту үшін қысқа қайталау жасап, келесі тақырыпқа өтуге болады."
    );
  }

  if (result.percent >= 90) {
    return {
      title: "Жақсы нәтиже",
      summary:
        "Сіз тақырыпты жақсы түсіндіңіз. Қазір негізгі мақсат — білімді ұқсас есептермен бекіту.",
      focusAreas: unique(focusAreas),
      mistakeHints: unique(mistakeHints),
    };
  }

  if (result.percent >= 70) {
    return {
      title: "Бекіту керек тұстар бар",
      summary:
        "Тақырыптың негізгі бөлігі түсінікті, бірақ кейбір тапсырмаларда шатасу бар. Төмендегі кеңестерді қарап шығыңыз.",
      focusAreas: unique(focusAreas),
      mistakeHints: unique(mistakeHints),
    };
  }

  return {
    title: "Қайта дайындалу керек",
    summary:
      "Бұл тақырыпта әлі қиындық бар. Алдымен теориядағы негізгі ұғымдарды қайталап, қате кеткен тапсырмаларды қайта қарап шығу керек.",
    focusAreas: unique(focusAreas),
    mistakeHints: unique(mistakeHints),
  };
}

export function readTaskResultHistory(): TaskResultHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(TASK_RESULT_HISTORY_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as TaskResultHistoryItem[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTaskResultHistory(item: TaskResultHistoryItem) {
  if (typeof window === "undefined") return;

  const history = readTaskResultHistory();

  const withoutDuplicate = history.filter((oldItem) => oldItem.id !== item.id);

  const nextHistory = [item, ...withoutDuplicate].slice(0, 200);

  window.localStorage.setItem(
    TASK_RESULT_HISTORY_KEY,
    JSON.stringify(nextHistory)
  );
}

export function createTaskResultHistoryItem(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  result: TaskSessionResult;
  completedAt: string;
}): TaskResultHistoryItem {
  const { topic, level, result, completedAt } = params;

  return {
    id: `${topic.grade}:${topic.slug}:${level}:${completedAt}`,
    grade: topic.grade,
    topicSlug: topic.slug,
    topicTitle: topic.title,
    topicUnit: topic.unit,
    level,
    correct: result.correct,
    total: result.total,
    percent: result.percent,
    status: getTaskResultStatus(result.percent),
    stepScores: result.stepScores,
    completedAt,
    recommendation: getTaskResultRecommendation(result.percent),
  };
}