import type {
  AssessmentDocument,
  AssessmentGeneratorRequest,
} from "@/lib/assessment-generator/types";

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.round(parsed);
}

export function normalizeAssessmentDocument(
  raw: AssessmentDocument,
  request: AssessmentGeneratorRequest
): AssessmentDocument {
  const warnings: string[] = [];

  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks.map((task, index) => {
        const points = toPositiveInteger(task.points, 1);

        const descriptors = Array.isArray(task.descriptors)
          ? task.descriptors.map((descriptor) => ({
              text: cleanText(descriptor.text, "Тапсырманы орындайды"),
              points: toPositiveInteger(descriptor.points, 1),
            }))
          : [];

        const descriptorPoints = descriptors.reduce(
          (sum, descriptor) => sum + descriptor.points,
          0
        );

        if (descriptorPoints !== points) {
          warnings.push(
            `${index + 1}-тапсырмада дескриптор баллдарының қосындысы ${descriptorPoints}, ал тапсырма баллы ${points}.`
          );
        }

        return {
          number: cleanText(task.number, String(index + 1)),
          title: cleanText(task.title, `${index + 1}-тапсырма`),
          prompt: cleanText(task.prompt, "Тапсырма мәтіні енгізілмеген."),
          points,
          answer: cleanText(task.answer, "Жауап енгізілмеген."),
          descriptors,
        };
      })
    : [];

  if (tasks.length !== request.taskCount) {
    warnings.push(
      `Сұралған тапсырма саны: ${request.taskCount}. Генерацияланған тапсырма саны: ${tasks.length}.`
    );
  }

  const calculatedTotal = tasks.reduce((sum, task) => sum + task.points, 0);

  if (calculatedTotal !== request.totalPoints) {
    warnings.push(
      `Сұралған жалпы балл: ${request.totalPoints}. Тапсырмалар бойынша есептелген балл: ${calculatedTotal}.`
    );
  }

  const answerKey = tasks.map((task) => {
    const existing = Array.isArray(raw.answerKey)
      ? raw.answerKey.find((item) => item.taskNumber === task.number)
      : undefined;

    return {
      taskNumber: task.number,
      answer: cleanText(existing?.answer, task.answer),
      points: task.points,
      notes: cleanText(existing?.notes, "Дескрипторларға сәйкес бағаланады."),
    };
  });

  if (request.type === "tjb" && (!raw.specification || raw.specification.length === 0)) {
    warnings.push("ТЖБ үшін спецификация кестесі толтырылмаған.");
  }

  if (!raw.assessmentCriteria || raw.assessmentCriteria.length === 0) {
    warnings.push("Бағалау критерийлері толтырылмаған.");
  }

  if (!raw.rubric || raw.rubric.length === 0) {
    warnings.push("Рубрика толтырылмаған.");
  }

  return {
    type: request.type,
    title: cleanText(
      raw.title,
      request.type === "bjb"
        ? `«${request.section}» бөлімі бойынша жиынтық бағалау`
        : `${request.term} бойынша тоқсандық жиынтық бағалау`
    ),
    grade: request.grade,
    term: request.term,
    section: request.section,
    sections:
      Array.isArray(raw.sections) && raw.sections.length > 0
        ? raw.sections.map((item) => cleanText(item)).filter(Boolean)
        : [request.section],
    learningObjectives:
      Array.isArray(raw.learningObjectives) && raw.learningObjectives.length > 0
        ? raw.learningObjectives.map((item) => cleanText(item)).filter(Boolean)
        : request.learningObjectives,
    assessmentCriteria: Array.isArray(raw.assessmentCriteria)
      ? raw.assessmentCriteria.map((item) => cleanText(item)).filter(Boolean)
      : [],
    thinkingSkills: Array.isArray(raw.thinkingSkills)
      ? raw.thinkingSkills.map((item) => cleanText(item)).filter(Boolean)
      : [],
    durationMinutes: toPositiveInteger(
      raw.durationMinutes,
      request.durationMinutes
    ),
    instructions: Array.isArray(raw.instructions)
      ? raw.instructions.map((item) => cleanText(item)).filter(Boolean)
      : [],
    specification:
      request.type === "tjb" && Array.isArray(raw.specification)
        ? raw.specification
        : [],
    tasks,
    totalPoints: calculatedTotal,
    answerKey,
    rubric: Array.isArray(raw.rubric) ? raw.rubric : [],
    qualityChecks: [
      ...(Array.isArray(raw.qualityChecks) ? raw.qualityChecks : []),
      ...warnings,
    ],
  };
}
