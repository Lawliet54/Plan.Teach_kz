"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FlaskConical,
  PenLine,
  Puzzle,
  RotateCcw,
  Save,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  levelLabels,
  type PhysicsTopic,
  type TaskType,
  type TopicLevel,
} from "@/data/physicsTopics";
import {
  saveAdaptiveAttempt,
  type StoredAdaptiveProgress,
} from "@/lib/adaptiveEngine";

type AdaptiveTopicTasksProps = {
  grade: number;
  topic: PhysicsTopic;
  level: TopicLevel;
};

type AnswerState = {
  test?: string;
  fillFirst?: string;
  fillSecond?: string;
  matching?: Record<string, string>;
  numeric?: string;
  simulationValue?: number;
  projectText?: string;
};

type TaskCheckResult = {
  total: number;
  correct: number;
  percent: number;
  details: string[];
};

const taskIcons: Record<TaskType, typeof ClipboardCheck> = {
  test: ClipboardCheck,
  "fill-blank": PenLine,
  matching: Puzzle,
  simulation: FlaskConical,
  numeric: Calculator,
  project: FileText,
};

const taskTitles: Record<TaskType, string> = {
  test: "Интерактивті тест",
  "fill-blank": "Бос орындарды толтыру",
  matching: "Сәйкестендіру",
  simulation: "Симуляциямен жұмыс",
  numeric: "Есеп шығару",
  project: "Жобалық тапсырма",
};

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getLevelDifficulty(level: TopicLevel) {
  if (level === "basic") return 1;
  if (level === "medium") return 2;
  return 3;
}

function buildTestQuestion(topic: PhysicsTopic, level: TopicLevel) {
  const content = topic.levels[level];

  return {
    question: `"${topic.title}" тақырыбы бойынша негізгі ой қайсы?`,
    options: [
      content.keyPoints[0] ?? content.shortGoal,
      "Физикалық құбылыстар ешқандай заңға бағынбайды.",
      "Бұл тақырып тек жаттауға арналған, есеппен байланысы жоқ.",
      "Бұл тақырыпта өлшем бірліктер қолданылмайды.",
    ],
    correctIndex: 0,
  };
}

function buildFillTask(topic: PhysicsTopic, level: TopicLevel) {
  if (topic.slug.includes("ohms-law")) {
    return {
      textStart: "Ом заңы бойынша ток күші кернеуге",
      firstAnswer: "тура",
      textMiddle: "пропорционал, ал кедергіге",
      secondAnswer: "кері",
      textEnd: "пропорционал.",
      words: ["тура", "кері", "артады", "азаяды"],
    };
  }

  if (topic.slug.includes("density")) {
    return {
      textStart: "Тығыздық дененің массасына",
      firstAnswer: "тура",
      textMiddle: "байланысты, ал көлем артқанда тығыздық",
      secondAnswer: "азаяды",
      textEnd: "мүмкін.",
      words: ["тура", "кері", "артады", "азаяды"],
    };
  }

  if (topic.slug.includes("speed")) {
    return {
      textStart: "Жылдамдық жүрген жолға",
      firstAnswer: "тура",
      textMiddle: "пропорционал, ал уақытқа",
      secondAnswer: "кері",
      textEnd: "пропорционал.",
      words: ["тура", "кері", "артады", "азаяды"],
    };
  }

  return {
    textStart: `${topic.title} тақырыбында негізгі ұғымды`,
    firstAnswer: "түсіну",
    textMiddle: "және оны есепте",
    secondAnswer: "қолдану",
    textEnd: "маңызды.",
    words: ["түсіну", "қолдану", "өлшеу", "салыстыру"],
  };
}

function buildMatchingTask(topic: PhysicsTopic, level: TopicLevel) {
  const content = topic.levels[level];

  return {
    terms: [
      { id: "term", label: topic.title },
      { id: "goal", label: "Оқу мақсаты" },
      { id: "formula", label: "Формула" },
      { id: "example", label: "Мысал" },
    ],
    definitions: [
      {
        id: "def-term",
        label: content.simpleExplanation,
        correctTermId: "term",
      },
      {
        id: "def-goal",
        label: content.shortGoal,
        correctTermId: "goal",
      },
      {
        id: "def-formula",
        label: content.formula ?? "Бұл тақырыпта негізгі ұғымдар қолданылады.",
        correctTermId: "formula",
      },
      {
        id: "def-example",
        label: content.example,
        correctTermId: "example",
      },
    ],
  };
}

function buildNumericTask(topic: PhysicsTopic, level: TopicLevel) {
  const difficulty = getLevelDifficulty(level);

  if (topic.slug.includes("ohms-law")) {
    const voltage = difficulty === 1 ? 24 : difficulty === 2 ? 36 : 48;
    const resistance = difficulty === 1 ? 12 : difficulty === 2 ? 9 : 6;

    return {
      title: "Ом заңы бойынша есеп",
      text: `Кернеу ${voltage} В, кедергі ${resistance} Ом. Тізбектегі ток күшін есептеңіз.`,
      formula: "I = U / R",
      unit: "A",
      correct: voltage / resistance,
    };
  }

  if (topic.slug.includes("density")) {
    const mass = difficulty === 1 ? 200 : difficulty === 2 ? 540 : 780;
    const volume = difficulty === 1 ? 100 : difficulty === 2 ? 180 : 100;

    return {
      title: "Тығыздықты есептеу",
      text: `Дененің массасы ${mass} г, көлемі ${volume} см³. Тығыздығын есептеңіз.`,
      formula: "ρ = m / V",
      unit: "г/см³",
      correct: mass / volume,
    };
  }

  if (topic.slug.includes("speed")) {
    const distance = difficulty === 1 ? 100 : difficulty === 2 ? 240 : 360;
    const time = difficulty === 1 ? 20 : difficulty === 2 ? 30 : 45;

    return {
      title: "Жылдамдықты есептеу",
      text: `Дене ${distance} м жолды ${time} с ішінде жүрді. Жылдамдығын есептеңіз.`,
      formula: "v = s / t",
      unit: "м/с",
      correct: distance / time,
    };
  }

  if (topic.slug.includes("force") || topic.slug.includes("newton")) {
    const mass = difficulty === 1 ? 5 : difficulty === 2 ? 8 : 12;
    const acceleration = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4;

    return {
      title: "Күшті есептеу",
      text: `Массасы ${mass} кг дене ${acceleration} м/с² үдеумен қозғалады. Қорытқы күшті есептеңіз.`,
      formula: "F = ma",
      unit: "Н",
      correct: mass * acceleration,
    };
  }

  return {
    title: "Формула бойынша есеп",
    text: `${topic.title} тақырыбы бойынша қарапайым сандық жауап енгізіңіз. Егер нақты формула берілмесе, жауап ретінде 1 санын жазыңыз.`,
    formula: topic.levels[level].formula ?? "Негізгі формула",
    unit: "",
    correct: 1,
  };
}

export function AdaptiveTopicTasks({
  grade,
  topic,
  level,
}: AdaptiveTopicTasksProps) {
  const content = topic.levels[level];

  const testTask = useMemo(() => buildTestQuestion(topic, level), [topic, level]);
  const fillTask = useMemo(() => buildFillTask(topic, level), [topic, level]);
  const matchingTask = useMemo(
    () => buildMatchingTask(topic, level),
    [topic, level]
  );
  const numericTask = useMemo(
    () => buildNumericTask(topic, level),
    [topic, level]
  );

  const [answers, setAnswers] = useState<AnswerState>({
    matching: {},
    simulationValue: 50,
  });
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [result, setResult] = useState<TaskCheckResult | null>(null);
  const [savedInfo, setSavedInfo] = useState<StoredAdaptiveProgress | null>(
    null
  );

  const recommendedTasks = content.recommendedTasks;

  function updateAnswer<Key extends keyof AnswerState>(
    key: Key,
    value: AnswerState[Key]
  ) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleDefinitionClick(definitionId: string) {
    if (!selectedTermId) return;

    setAnswers((current) => ({
      ...current,
      matching: {
        ...(current.matching ?? {}),
        [definitionId]: selectedTermId,
      },
    }));

    setSelectedTermId(null);
  }

  function checkTasks() {
    let total = 0;
    let correct = 0;
    const details: string[] = [];

    if (recommendedTasks.includes("test")) {
      total += 1;

      const isCorrect = answers.test === String(testTask.correctIndex);

      if (isCorrect) correct += 1;

      details.push(
        isCorrect
          ? "Тест жауабы дұрыс."
          : "Тест жауабы қате. Теориядағы негізгі ойды қайта оқыңыз."
      );
    }

    if (recommendedTasks.includes("fill-blank")) {
      total += 2;

      const firstCorrect =
        normalizeText(answers.fillFirst ?? "") ===
        normalizeText(fillTask.firstAnswer);

      const secondCorrect =
        normalizeText(answers.fillSecond ?? "") ===
        normalizeText(fillTask.secondAnswer);

      if (firstCorrect) correct += 1;
      if (secondCorrect) correct += 1;

      details.push(
        firstCorrect && secondCorrect
          ? "Бос орындар дұрыс толтырылды."
          : "Бос орындарда қате бар. Қажетті сөздерді қайта салыстырыңыз."
      );
    }

    if (recommendedTasks.includes("matching")) {
      total += matchingTask.definitions.length;

      const matchCorrectCount = matchingTask.definitions.filter(
        (definition) =>
          answers.matching?.[definition.id] === definition.correctTermId
      ).length;

      correct += matchCorrectCount;

      details.push(
        matchCorrectCount === matchingTask.definitions.length
          ? "Сәйкестендіру толық дұрыс."
          : `Сәйкестендіруде ${
              matchingTask.definitions.length - matchCorrectCount
            } қате бар.`
      );
    }

    if (recommendedTasks.includes("numeric")) {
      total += 1;

      const userNumber = Number(String(answers.numeric ?? "").replace(",", "."));
      const tolerance = Math.max(0.05, Math.abs(numericTask.correct) * 0.03);
      const isCorrect = Math.abs(userNumber - numericTask.correct) <= tolerance;

      if (isCorrect) correct += 1;

      details.push(
        isCorrect
          ? "Есеп дұрыс шығарылды."
          : `Есеп жауабы қате. Дұрыс жауап шамамен: ${numericTask.correct.toFixed(
              2
            )} ${numericTask.unit}.`
      );
    }

    if (recommendedTasks.includes("simulation")) {
      total += 1;

      const value = answers.simulationValue ?? 0;
      const isCorrect = value >= 70;

      if (isCorrect) correct += 1;

      details.push(
        isCorrect
          ? "Симуляция шарты орындалды."
          : "Симуляцияда параметр жеткіліксіз. Мақсат аймағына жеткізіңіз."
      );
    }

    if (recommendedTasks.includes("project")) {
      total += 1;

      const text = normalizeText(answers.projectText ?? "");
      const isCorrect = text.length >= 80;

      if (isCorrect) correct += 1;

      details.push(
        isCorrect
          ? "Жобалық жауап қабылданды."
          : "Жобалық жауап тым қысқа. Мақсат, бақылау және қорытынды қосыңыз."
      );
    }

    const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

    const nextResult = {
      total,
      correct,
      percent,
      details,
    };

    setResult(nextResult);

    const saved = saveAdaptiveAttempt({
      grade,
      topicSlug: topic.slug,
      level,
      percent,
      correct,
      total,
    });

    setSavedInfo(saved);
  }

  function resetTasks() {
    setAnswers({
      matching: {},
      simulationValue: 50,
    });
    setSelectedTermId(null);
    setResult(null);
    setSavedInfo(null);
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
              Adaptive тапсырмалар
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              {topic.title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Қазіргі деңгей:{" "}
              <span className="font-black text-[#5b4ce6]">
                {levelLabels[level]}
              </span>
              . Тапсырмалар осы деңгейге сай берілді.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button href={`/topics/${grade}/${topic.slug}`} variant="secondary">
                Теорияға қайту
            </Button>

            <Button
                href={`/ai?grade=${grade}&topic=${topic.slug}&level=${level}`}
                variant="secondary"
            >
                AI көмекші
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <main className="space-y-3">
          {recommendedTasks.includes("test") ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[#5b4ce6]" />
                  <CardTitle>1. Интерактивті тест</CardTitle>
                </div>

                <span className="text-xs font-bold text-slate-500">1 ұпай</span>
              </div>

              <p className="text-sm font-semibold leading-6 text-slate-800">
                {testTask.question}
              </p>

              <div className="mt-4 grid gap-2">
                {testTask.options.map((option, index) => {
                  const isSelected = answers.test === String(index);

                  return (
                    <button
                      key={`${option}-${index}`}
                      type="button"
                      onClick={() => updateAnswer("test", String(index))}
                      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition ${
                        isSelected
                          ? "border-[#5b4ce6] bg-[#f1efff] text-[#5b4ce6]"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-black ${
                          isSelected
                            ? "bg-[#5b4ce6] text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      {option}
                    </button>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {recommendedTasks.includes("fill-blank") ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-[#5b4ce6]" />
                  <CardTitle>2. Бос орындарды толтыру</CardTitle>
                </div>

                <span className="text-xs font-bold text-slate-500">2 ұпай</span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-8 text-slate-800">
                {fillTask.textStart}{" "}
                <input
                  value={answers.fillFirst ?? ""}
                  onChange={(event) =>
                    updateAnswer("fillFirst", event.target.value)
                  }
                  className="mx-1 h-9 w-28 rounded-xl border border-slate-200 bg-white px-3 text-center font-black outline-none focus:border-[#5b4ce6]"
                />{" "}
                {fillTask.textMiddle}{" "}
                <input
                  value={answers.fillSecond ?? ""}
                  onChange={(event) =>
                    updateAnswer("fillSecond", event.target.value)
                  }
                  className="mx-1 h-9 w-28 rounded-xl border border-slate-200 bg-white px-3 text-center font-black outline-none focus:border-[#5b4ce6]"
                />{" "}
                {fillTask.textEnd}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {fillTask.words.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      if (!answers.fillFirst) {
                        updateAnswer("fillFirst", word);
                      } else {
                        updateAnswer("fillSecond", word);
                      }
                    }}
                    className="rounded-xl border border-[#ddd6ff] bg-[#f1efff] px-3 py-2 text-xs font-black text-[#5b4ce6]"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </Card>
          ) : null}

          {recommendedTasks.includes("matching") ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4 text-[#5b4ce6]" />
                  <CardTitle>3. Сәйкестендіру тапсырмасы</CardTitle>
                </div>

                <span className="text-xs font-bold text-slate-500">
                  {matchingTask.definitions.length} ұпай
                </span>
              </div>

              <p className="mb-3 text-sm leading-6 text-slate-600">
                Алдымен сол жақтағы терминді таңдаңыз, кейін оң жақтағы сәйкес
                анықтаманы басыңыз.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    Терминдер
                  </p>

                  {matchingTask.terms.map((term, index) => {
                    const isSelected = selectedTermId === term.id;

                    return (
                      <button
                        key={term.id}
                        type="button"
                        onClick={() => setSelectedTermId(term.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-bold transition ${
                          isSelected
                            ? "border-[#5b4ce6] bg-[#f1efff] text-[#5b4ce6]"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                        }`}
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-[#5b4ce6]">
                          {index + 1}
                        </span>

                        {term.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    Анықтамалар
                  </p>

                  {matchingTask.definitions.map((definition, index) => {
                    const matchedTermId = answers.matching?.[definition.id];
                    const matchedTerm = matchingTask.terms.find(
                      (term) => term.id === matchedTermId
                    );

                    return (
                      <button
                        key={definition.id}
                        type="button"
                        onClick={() => handleDefinitionClick(definition.id)}
                        className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-left text-sm font-semibold leading-6 text-slate-700 hover:bg-white"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-xs font-black text-emerald-600">
                            {String.fromCharCode(65 + index)}
                          </span>

                          {matchedTerm ? (
                            <span className="rounded-full bg-[#f1efff] px-2 py-1 text-[11px] font-black text-[#5b4ce6]">
                              {matchedTerm.label}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400">
                              Термин таңдаңыз
                            </span>
                          )}
                        </div>

                        {definition.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ) : null}

          {recommendedTasks.includes("numeric") ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-[#5b4ce6]" />
                  <CardTitle>4. Есеп шығару тапсырмасы</CardTitle>
                </div>

                <span className="text-xs font-bold text-slate-500">1 ұпай</span>
              </div>

              <h3 className="text-sm font-black text-slate-950">
                {numericTask.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {numericTask.text}
              </p>

              <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-bold text-slate-500">Формула</p>
                  <p className="mt-2 font-mono text-xl font-black text-slate-950">
                    {numericTask.formula}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">
                    Жауабыңызды енгізіңіз
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={answers.numeric ?? ""}
                      onChange={(event) =>
                        updateAnswer("numeric", event.target.value)
                      }
                      className="h-11 w-32 rounded-2xl border border-slate-200 bg-white px-3 text-center text-lg font-black outline-none focus:border-[#5b4ce6]"
                      placeholder="0"
                    />

                    <span className="text-sm font-black text-slate-700">
                      {numericTask.unit}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}

          {recommendedTasks.includes("simulation") ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-[#5b4ce6]" />
                  <CardTitle>5. Симуляциямен жұмыс</CardTitle>
                </div>

                <span className="text-xs font-bold text-slate-500">1 ұпай</span>
              </div>

              <p className="text-sm leading-6 text-slate-700">
                Параметрді өзгертіңіз. Мақсат: нәтиже көрсеткішін{" "}
                <span className="font-black text-[#5b4ce6]">70%</span> немесе
                одан жоғары деңгейге жеткізу.
              </p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-800">
                    Параметр мәні
                  </p>

                  <p className="text-lg font-black text-[#5b4ce6]">
                    {answers.simulationValue ?? 50}%
                  </p>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={answers.simulationValue ?? 50}
                  onChange={(event) =>
                    updateAnswer("simulationValue", Number(event.target.value))
                  }
                  className="w-full"
                />

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#5b4ce6]"
                    style={{ width: `${answers.simulationValue ?? 50}%` }}
                  />
                </div>
              </div>
            </Card>
          ) : null}

          {recommendedTasks.includes("project") ? (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#5b4ce6]" />
                  <CardTitle>6. Жобалық тапсырма</CardTitle>
                </div>

                <span className="text-xs font-bold text-slate-500">1 ұпай</span>
              </div>

              <p className="text-sm leading-6 text-slate-700">
                “{topic.title}” тақырыбы бойынша шағын жоба жазыңыз. Жауапта
                мақсат, бақылау және қорытынды болсын.
              </p>

              <textarea
                value={answers.projectText ?? ""}
                onChange={(event) =>
                  updateAnswer("projectText", event.target.value)
                }
                className="mt-3 min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 outline-none focus:border-[#5b4ce6] focus:bg-white"
                placeholder={"Мақсаты: ...\nБақылау: ...\nҚорытынды: ..."}
              />
            </Card>
          ) : null}

          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Тапсырманы аяқтау</CardTitle>
                <p className="mt-1 text-sm text-slate-600">
                  Жауаптарды тексеріп, нәтижені adaptive жүйеге сақтаңыз.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetTasks}
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Тазалау
                </button>

                <button
                  type="button"
                  onClick={checkTasks}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
                >
                  <Save className="mr-1.5 h-4 w-4" />
                  Тексеру
                </button>
              </div>
            </div>
          </Card>
        </main>

        <aside className="space-y-3">
          <Card>
            <CardTitle>Нәтиже</CardTitle>

            {result ? (
              <div className="mt-3">
                <div
                  className={`rounded-2xl border p-4 ${
                    result.percent >= 80
                      ? "border-emerald-200 bg-emerald-50"
                      : result.percent >= 60
                        ? "border-amber-200 bg-amber-50"
                        : "border-rose-200 bg-rose-50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-500">
                    Жалпы нәтиже
                  </p>

                  <p className="mt-1 text-3xl font-black text-slate-950">
                    {result.percent}%
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {result.correct} / {result.total} дұрыс
                  </p>
                </div>

                <div className="mt-3 space-y-2">
                  {result.details.map((detail, index) => {
                    const isGood =
                      detail.includes("дұрыс") ||
                      detail.includes("қабылданды") ||
                      detail.includes("орындалды");

                    return (
                      <div
                        key={`${detail}-${index}`}
                        className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-700"
                      >
                        {isGood ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                        )}

                        {detail}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Әзірге нәтиже жоқ. Тапсырмаларды орындап, “Тексеру” батырмасын
                басыңыз.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Adaptive шешім</CardTitle>

            {savedInfo ? (
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <p>
                  Қазіргі деңгей:{" "}
                  <span className="font-black text-[#5b4ce6]">
                    {levelLabels[savedInfo.currentLevel]}
                  </span>
                </p>

                <p>
                  Жақсы нәтижелер сериясы:{" "}
                  <span className="font-black text-[#5b4ce6]">
                    {savedInfo.goodStreak}
                  </span>
                </p>

                <p>
                  Тапсыру саны:{" "}
                  <span className="font-black">{savedInfo.attempts}</span>
                </p>

                <p>
                  Ең жақсы нәтиже:{" "}
                  <span className="font-black">{savedInfo.bestPercent}%</span>
                </p>

                {savedInfo.decision ? (
                  <div
                    className={`rounded-2xl border p-3 text-xs font-bold ${
                      savedInfo.decision.type === "level_up" ||
                      savedInfo.decision.type === "mastered"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : savedInfo.decision.type === "level_down"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-[#ddd6ff] bg-[#f1efff] text-[#5b4ce6]"
                    }`}
                  >
                    <p>{savedInfo.decision.message}</p>
                    <p className="mt-2 opacity-80">
                      Ұсыныс: {savedInfo.decision.recommendation}
                    </p>
                  </div>
                ) : null}

                {savedInfo.decision?.type === "level_up" ? (
                  <Button
                    href={`/topics/${grade}/${topic.slug}?level=${savedInfo.currentLevel}`}
                    className="mt-2 w-full"
                  >
                    Жаңа деңгейге өту
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Бұл жерде оқушының деңгейін көтеру немесе бекіту туралы шешім
                шығады.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Тапсырма түрлері</CardTitle>

            <div className="mt-3 grid gap-2">
              {recommendedTasks.map((taskType) => {
                const Icon = taskIcons[taskType];

                return (
                  <div
                    key={taskType}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#5b4ce6]" />
                    {taskTitles[taskType]}
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}