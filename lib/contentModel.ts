import {
  getContentRememberItems,
  getTopicsByGrade,
  grades,
  type Grade,
  type PhysicsTopic,
  type TaskType,
  type TopicLevel,
  type TopicLevelContent,
} from "@/data/physicsTopics";

export type ContentReadiness = "ready" | "partial" | "placeholder";

export type NormalizedKeyConcept = {
  term: string;
  definition: string;
};

export type NormalizedFormulaSymbol = {
  symbol: string;
  meaning: string;
  unit?: string;
};

export type NormalizedFormula = {
  expression: string;
  explanation: string;
  symbols: NormalizedFormulaSymbol[];
};

export type NormalizedUnit = {
  name: string;
  symbol: string;
  explanation: string;
};

export type NormalizedMeasurementTool = {
  name: string;
  use: string;
};

export type NormalizedWorkedExample = {
  title: string;
  problem: string;
  given: string[];
  solutionSteps: string[];
  answer: string;
};

export type NormalizedCommonMistake = {
  mistake: string;
  correction: string;
};

export type NormalizedTopicLevelContent = {
  level: TopicLevel;
  label: string;
  shortGoal: string;
  intro: string;
  theory: string[];
  simpleExplanation: string;
  keyConcepts: NormalizedKeyConcept[];
  formula: NormalizedFormula | null;
  units: NormalizedUnit[];
  measurementTools: NormalizedMeasurementTool[];
  realLifeExamples: string[];
  workedExample: NormalizedWorkedExample | null;
  commonMistakes: NormalizedCommonMistake[];
  remember: string[];
  checkQuestions: string[];
  recommendedTasks: TaskType[];
  readiness: ContentReadiness;
  missingSections: string[];
};

export type TopicContentAudit = {
  topicId: string;
  grade: Grade;
  slug: string;
  title: string;
  unit: string;
  levels: Record<
    TopicLevel,
    {
      readiness: ContentReadiness;
      missingSections: string[];
    }
  >;
};

export type GradeContentSummary = {
  grade: Grade;
  topicCount: number;
  readyLevelCount: number;
  partialLevelCount: number;
  placeholderLevelCount: number;
};

export type TopicAiContext = {
  grade: Grade;
  topicSlug: string;
  topicTitle: string;
  unit: string;
  level: TopicLevel;
  goal: string;
  theory: string[];
  concepts: NormalizedKeyConcept[];
  formula: NormalizedFormula | null;
  units: NormalizedUnit[];
  examples: string[];
  workedExample: NormalizedWorkedExample | null;
  commonMistakes: NormalizedCommonMistake[];
  remember: string[];
  recommendedTasks: TaskType[];
};

export const taskTypeLabels: Record<TaskType, string> = {
  test: "Тест",
  "fill-blank": "Бос орынды толтыру",
  matching: "Сәйкестендіру",
  simulation: "Симуляция",
  numeric: "Есеп шығару",
  project: "Жобалық тапсырма",
};

const requiredSectionLabels = {
  shortGoal: "Оқу мақсаты",
  theory: "Толық теория",
  simpleExplanation: "Қарапайым түсіндіру",
  keyConcepts: "Негізгі ұғымдар",
  realLifeExamples: "Күнделікті өмірдегі мысалдар",
  workedExample: "Шешілген есеп",
  commonMistakes: "Жиі кездесетін қателер",
  remember: "Есте сақтау керек",
  checkQuestions: "Өзін-өзі тексеру",
  recommendedTasks: "Ұсынылатын тапсырмалар",
} as const;

function normalizeString(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizeStringArray(value?: string[] | null) {
  return (value ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTheory(theory: TopicLevelContent["theory"]) {
  if (Array.isArray(theory)) {
    return normalizeStringArray(theory);
  }

  const paragraph = normalizeString(theory);

  return paragraph ? [paragraph] : [];
}

function normalizeFormula(
  formula: TopicLevelContent["formula"]
): NormalizedFormula | null {
  if (!formula) {
    return null;
  }

  if (typeof formula === "string") {
    const expression = normalizeString(formula);

    if (!expression) {
      return null;
    }

    return {
      expression,
      explanation:
        "Формуладағы шамалардың мағынасын тақырып мәтінінен қараңыз.",
      symbols: [],
    };
  }

  const expression = normalizeString(formula.expression);

  if (!expression) {
    return null;
  }

  return {
    expression,
    explanation: normalizeString(formula.explanation),
    symbols: formula.symbols.map((item) => ({
      symbol: normalizeString(item.symbol),
      meaning: normalizeString(item.meaning),
      unit: normalizeString(item.unit) || undefined,
    })),
  };
}

function normalizeWorkedExample(
  content: TopicLevelContent
): NormalizedWorkedExample | null {
  if (content.workedExample) {
    return {
      title: normalizeString(content.workedExample.title) || "Шешілген есеп",
      problem: normalizeString(content.workedExample.problem),
      given: normalizeStringArray(content.workedExample.given),
      solutionSteps: normalizeStringArray(content.workedExample.solutionSteps),
      answer: normalizeString(content.workedExample.answer),
    };
  }

  const example = normalizeString(content.example);

  if (!example) {
    return null;
  }

  return {
    title: "Мысал",
    problem: example,
    given: [],
    solutionSteps: [],
    answer: example,
  };
}

function getMissingSections(content: {
  shortGoal: string;
  theory: string[];
  simpleExplanation: string;
  keyConcepts: NormalizedKeyConcept[];
  realLifeExamples: string[];
  workedExample: NormalizedWorkedExample | null;
  commonMistakes: NormalizedCommonMistake[];
  remember: string[];
  checkQuestions: string[];
  recommendedTasks: TaskType[];
}) {
  const missingSections: string[] = [];

  if (!content.shortGoal) {
    missingSections.push(requiredSectionLabels.shortGoal);
  }

  if (content.theory.length === 0) {
    missingSections.push(requiredSectionLabels.theory);
  }

  if (!content.simpleExplanation) {
    missingSections.push(requiredSectionLabels.simpleExplanation);
  }

  if (content.keyConcepts.length === 0) {
    missingSections.push(requiredSectionLabels.keyConcepts);
  }

  if (content.realLifeExamples.length === 0) {
    missingSections.push(requiredSectionLabels.realLifeExamples);
  }

  if (!content.workedExample) {
    missingSections.push(requiredSectionLabels.workedExample);
  }

  if (content.commonMistakes.length === 0) {
    missingSections.push(requiredSectionLabels.commonMistakes);
  }

  if (content.remember.length === 0) {
    missingSections.push(requiredSectionLabels.remember);
  }

  if (content.checkQuestions.length === 0) {
    missingSections.push(requiredSectionLabels.checkQuestions);
  }

  if (content.recommendedTasks.length === 0) {
    missingSections.push(requiredSectionLabels.recommendedTasks);
  }

  return missingSections;
}

function getReadiness(missingSections: string[]): ContentReadiness {
  if (missingSections.length === 0) {
    return "ready";
  }

  if (missingSections.length <= 3) {
    return "partial";
  }

  return "placeholder";
}

export function getNormalizedTopicContent(
  topic: PhysicsTopic,
  level: TopicLevel
): NormalizedTopicLevelContent {
  const source = topic.levels[level];
  const remember = getContentRememberItems(source);

  const normalized = {
    level,
    label: normalizeString(source.label),
    shortGoal: normalizeString(source.shortGoal),
    intro:
      normalizeString(source.intro) ||
      normalizeString(source.simpleExplanation),
    theory: normalizeTheory(source.theory),
    simpleExplanation: normalizeString(source.simpleExplanation),
    keyConcepts: (source.keyConcepts ?? []).map((item) => ({
      term: normalizeString(item.term),
      definition: normalizeString(item.definition),
    })),
    formula: normalizeFormula(source.formula),
    units: (source.units ?? []).map((item) => ({
      name: normalizeString(item.name),
      symbol: normalizeString(item.symbol),
      explanation: normalizeString(item.explanation),
    })),
    measurementTools: (source.measurementTools ?? []).map((item) => ({
      name: normalizeString(item.name),
      use: normalizeString(item.use),
    })),
    realLifeExamples: normalizeStringArray(source.realLifeExamples),
    workedExample: normalizeWorkedExample(source),
    commonMistakes: (source.commonMistakes ?? []).map((item) => ({
      mistake: normalizeString(item.mistake),
      correction: normalizeString(item.correction),
    })),
    remember: normalizeStringArray(remember),
    checkQuestions: normalizeStringArray(source.checkQuestions),
    recommendedTasks: source.recommendedTasks ?? [],
  };

  const missingSections = getMissingSections(normalized);

  return {
    ...normalized,
    readiness: getReadiness(missingSections),
    missingSections,
  };
}

function getAuditLevel(topic: PhysicsTopic, level: TopicLevel) {
  const content = getNormalizedTopicContent(topic, level);

  return {
    readiness: content.readiness,
    missingSections: content.missingSections,
  };
}

export function getTopicContentAudit(topic: PhysicsTopic): TopicContentAudit {
  return {
    topicId: topic.id,
    grade: topic.grade,
    slug: topic.slug,
    title: topic.title,
    unit: topic.unit,
    levels: {
      basic: getAuditLevel(topic, "basic"),
      medium: getAuditLevel(topic, "medium"),
      advanced: getAuditLevel(topic, "advanced"),
    },
  };
}

export function getGradeContentSummary(grade: Grade): GradeContentSummary {
  const topics = getTopicsByGrade(grade);

  const readinessItems = topics.flatMap((topic) =>
    (["basic", "medium", "advanced"] as TopicLevel[]).map(
      (level) => getNormalizedTopicContent(topic, level).readiness
    )
  );

  return {
    grade,
    topicCount: topics.length,
    readyLevelCount: readinessItems.filter((item) => item === "ready").length,
    partialLevelCount: readinessItems.filter((item) => item === "partial")
      .length,
    placeholderLevelCount: readinessItems.filter(
      (item) => item === "placeholder"
    ).length,
  };
}

export function getAllGradeContentSummaries() {
  return grades.map((grade) => getGradeContentSummary(grade));
}

export function getTopicAiContext(
  topic: PhysicsTopic,
  level: TopicLevel
): TopicAiContext {
  const content = getNormalizedTopicContent(topic, level);

  return {
    grade: topic.grade,
    topicSlug: topic.slug,
    topicTitle: topic.title,
    unit: topic.unit,
    level,
    goal: content.shortGoal,
    theory: content.theory,
    concepts: content.keyConcepts,
    formula: content.formula,
    units: content.units,
    examples: content.realLifeExamples,
    workedExample: content.workedExample,
    commonMistakes: content.commonMistakes,
    remember: content.remember,
    recommendedTasks: content.recommendedTasks,
  };
}