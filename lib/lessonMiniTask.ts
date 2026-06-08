import type {
  LessonMiniTask,
  MatchingLessonMiniTask,
  MultipleChoiceLessonMiniTask,
  SingleChoiceLessonMiniTask,
} from "@/data/lessonMiniTasks";

export type SingleChoiceMiniTaskAnswer = {
  type: "single-choice";
  selectedOptionId: string;
};

export type MultipleChoiceMiniTaskAnswer = {
  type: "multiple-choice";
  selectedOptionIds: string[];
};

export type MatchingMiniTaskAnswer = {
  type: "matching";
  pairs: Record<string, string>;
};

export type LessonMiniTaskAnswer =
  | SingleChoiceMiniTaskAnswer
  | MultipleChoiceMiniTaskAnswer
  | MatchingMiniTaskAnswer;

export type LessonMiniTaskCheckResult = {
  isCorrect: boolean;
  message: string;
};

function normalizeString(value: string) {
  return value.trim();
}

function normalizeStringArray(values: string[]) {
  return Array.from(
    new Set(
      values
        .map(normalizeString)
        .filter(Boolean)
    )
  ).sort();
}

function arraysAreEqual(first: string[], second: string[]) {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((value, index) => value === second[index]);
}

function checkSingleChoiceTask(
  task: SingleChoiceLessonMiniTask,
  answer: SingleChoiceMiniTaskAnswer
): LessonMiniTaskCheckResult {
  const selectedOptionId = normalizeString(answer.selectedOptionId);

  if (!selectedOptionId) {
    return {
      isCorrect: false,
      message: "Жауап нұсқасын таңдаңыз.",
    };
  }

  const isCorrect = selectedOptionId === task.correctOptionId;

  return {
    isCorrect,
    message: isCorrect ? task.successMessage : task.errorMessage,
  };
}

function checkMultipleChoiceTask(
  task: MultipleChoiceLessonMiniTask,
  answer: MultipleChoiceMiniTaskAnswer
): LessonMiniTaskCheckResult {
  const selectedOptionIds = normalizeStringArray(answer.selectedOptionIds);

  if (selectedOptionIds.length === 0) {
    return {
      isCorrect: false,
      message: "Кемінде бір жауап нұсқасын таңдаңыз.",
    };
  }

  const correctOptionIds = normalizeStringArray(task.correctOptionIds);

  const isCorrect = arraysAreEqual(
    selectedOptionIds,
    correctOptionIds
  );

  return {
    isCorrect,
    message: isCorrect ? task.successMessage : task.errorMessage,
  };
}

function checkMatchingTask(
  task: MatchingLessonMiniTask,
  answer: MatchingMiniTaskAnswer
): LessonMiniTaskCheckResult {
  const submittedPairs = Object.entries(answer.pairs).reduce<
    Record<string, string>
  >((accumulator, [leftId, rightId]) => {
    const normalizedLeftId = normalizeString(leftId);
    const normalizedRightId = normalizeString(rightId);

    if (normalizedLeftId && normalizedRightId) {
      accumulator[normalizedLeftId] = normalizedRightId;
    }

    return accumulator;
  }, {});

  if (Object.keys(submittedPairs).length !== task.leftItems.length) {
    return {
      isCorrect: false,
      message: "Барлық ұғымды сәйкестендіріңіз.",
    };
  }

  const isCorrect = task.correctPairs.every(
    (pair) => submittedPairs[pair.leftId] === pair.rightId
  );

  return {
    isCorrect,
    message: isCorrect ? task.successMessage : task.errorMessage,
  };
}

export function checkLessonMiniTask(
  task: LessonMiniTask,
  answer: LessonMiniTaskAnswer
): LessonMiniTaskCheckResult {
  if (task.type !== answer.type) {
    return {
      isCorrect: false,
      message: "Тапсырма түрі қате.",
    };
  }

  if (task.type === "single-choice" && answer.type === "single-choice") {
    return checkSingleChoiceTask(task, answer);
  }

  if (task.type === "multiple-choice" && answer.type === "multiple-choice") {
    return checkMultipleChoiceTask(task, answer);
  }

  if (task.type === "matching" && answer.type === "matching") {
    return checkMatchingTask(task, answer);
  }

  return {
    isCorrect: false,
    message: "Тапсырманы тексеру мүмкін болмады.",
  };
}