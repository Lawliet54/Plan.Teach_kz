import type { PhysicsTopic, TopicLevel } from "@/data/physicsTopics";

export type FillBlankQuestion = {
  id: string;
  before: string;
  after: string;
  correctAnswer: string;
  wordBank: string[];
  explanation: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function makeFill(params: {
  id: string;
  before: string;
  after: string;
  correctAnswer: string;
  wordBank: string[];
  explanation: string;
}): FillBlankQuestion {
  const words = Array.from(
    new Set([params.correctAnswer, ...params.wordBank].filter(Boolean))
  );

  return {
    ...params,
    wordBank: words,
  };
}

function getOhmsLawFillTasks(topicSlug: string): FillBlankQuestion[] {
  return [
    makeFill({
      id: `${topicSlug}-fill-1`,
      before: "Ом заңы бойынша ток күші кернеуге",
      after: "пропорционал.",
      correctAnswer: "тура",
      wordBank: ["тура", "кері", "тең", "тәуелсіз"],
      explanation: "Кернеу артса, кедергі тұрақты болғанда ток күші де артады.",
    }),
    makeFill({
      id: `${topicSlug}-fill-2`,
      before: "Ом заңы бойынша ток күші кедергіге",
      after: "пропорционал.",
      correctAnswer: "кері",
      wordBank: ["тура", "кері", "бірдей", "нөл"],
      explanation: "Кедергі артса, ток күші азаяды.",
    }),
    makeFill({
      id: `${topicSlug}-fill-3`,
      before: "Кернеудің өлшем бірлігі",
      after: "деп аталады.",
      correctAnswer: "вольт",
      wordBank: ["вольт", "ампер", "ом", "ватт"],
      explanation: "Кернеу Вольтпен өлшенеді.",
    }),
    makeFill({
      id: `${topicSlug}-fill-4`,
      before: "Кедергінің өлшем бірлігі",
      after: "деп аталады.",
      correctAnswer: "ом",
      wordBank: ["ом", "вольт", "ампер", "джоуль"],
      explanation: "Электр кедергісі Оммен өлшенеді.",
    }),
  ];
}

function getDensityFillTasks(topicSlug: string): FillBlankQuestion[] {
  return [
    makeFill({
      id: `${topicSlug}-fill-1`,
      before: "Тығыздық дененің массасын оның",
      after: "бөлу арқылы табылады.",
      correctAnswer: "көлеміне",
      wordBank: ["көлеміне", "уақытына", "жолына", "кернеуіне"],
      explanation: "Тығыздық формуласы: ρ = m / V.",
    }),
    makeFill({
      id: `${topicSlug}-fill-2`,
      before: "Тығыздықтың формуласы",
      after: "түрінде жазылады.",
      correctAnswer: "ρ = m / V",
      wordBank: ["ρ = m / V", "v = s / t", "I = U / R", "F = ma"],
      explanation: "Мұнда ρ — тығыздық, m — масса, V — көлем.",
    }),
    makeFill({
      id: `${topicSlug}-fill-3`,
      before: "Бірдей көлемде массасы үлкен заттың тығыздығы",
      after: "болады.",
      correctAnswer: "үлкен",
      wordBank: ["үлкен", "кіші", "нөл", "өзгермейді"],
      explanation: "Көлем бірдей болса, масса артқан сайын тығыздық артады.",
    }),
    makeFill({
      id: `${topicSlug}-fill-4`,
      before: "Тығыздықтың ХБЖ-дегі өлшем бірлігі",
      after: ".",
      correctAnswer: "кг/м³",
      wordBank: ["кг/м³", "м/с", "Н", "Ом"],
      explanation: "Халықаралық бірліктер жүйесінде тығыздық кг/м³ арқылы өлшенеді.",
    }),
  ];
}

function getSpeedFillTasks(topicSlug: string): FillBlankQuestion[] {
  return [
    makeFill({
      id: `${topicSlug}-fill-1`,
      before: "Жылдамдық жүрген жолды",
      after: "бөлу арқылы табылады.",
      correctAnswer: "уақытқа",
      wordBank: ["уақытқа", "массаға", "көлемге", "кедергіге"],
      explanation: "Жылдамдық формуласы: v = s / t.",
    }),
    makeFill({
      id: `${topicSlug}-fill-2`,
      before: "Жылдамдықтың формуласы",
      after: "түрінде жазылады.",
      correctAnswer: "v = s / t",
      wordBank: ["v = s / t", "ρ = m / V", "I = U / R", "F = ma"],
      explanation: "Мұнда v — жылдамдық, s — жол, t — уақыт.",
    }),
    makeFill({
      id: `${topicSlug}-fill-3`,
      before: "Жол артса, уақыт тұрақты болса, жылдамдық",
      after: ".",
      correctAnswer: "артады",
      wordBank: ["артады", "азаяды", "өзгермейді", "нөл болады"],
      explanation: "v = s / t, жол көбейсе жылдамдық артады.",
    }),
    makeFill({
      id: `${topicSlug}-fill-4`,
      before: "Жылдамдықтың ХБЖ-дегі өлшем бірлігі",
      after: ".",
      correctAnswer: "м/с",
      wordBank: ["м/с", "кг/м³", "Н", "Ом"],
      explanation: "Жылдамдық метр/секундпен өлшенеді.",
    }),
  ];
}

export function getFillBlankQuestions(
  topic: PhysicsTopic,
  level: TopicLevel
): FillBlankQuestion[] {
  const slug = topic.slug.toLowerCase();
  const content = topic.levels[level];

  if (slug.includes("ohms-law")) {
    return getOhmsLawFillTasks(topic.slug);
  }

  if (slug.includes("density")) {
    return getDensityFillTasks(topic.slug);
  }

  if (slug.includes("speed")) {
    return getSpeedFillTasks(topic.slug);
  }

  return [
    makeFill({
      id: `${topic.slug}-fill-1`,
      before: `"${topic.title}" тақырыбында ең негізгі мақсат —`,
      after: ".",
      correctAnswer: content.shortGoal,
      wordBank: [
        content.shortGoal,
        "тек жаттау",
        "өлшем бірлікті қолданбау",
        "есепті болжап шығару",
      ],
      explanation: "Оқу мақсаты тақырыпты қандай деңгейде меңгеру керегін көрсетеді.",
    }),
    makeFill({
      id: `${topic.slug}-fill-2`,
      before: "Бұл тақырыптағы негізгі ой:",
      after: ".",
      correctAnswer: content.keyPoints[0] ?? content.shortGoal,
      wordBank: [
        content.keyPoints[0] ?? content.shortGoal,
        "формула қолданылмайды",
        "өлшем бірлік болмайды",
        "физика есеппен байланысты емес",
      ],
      explanation: "Негізгі ой тақырыпты түсінуге көмектеседі.",
    }),
    makeFill({
      id: `${topic.slug}-fill-3`,
      before: "Тақырыпты түсіну үшін алдымен анықтаманы",
      after: "керек.",
      correctAnswer: "түсіну",
      wordBank: ["түсіну", "ұмыту", "өткізіп жіберу", "шатастыру"],
      explanation: "Физикада анықтаманы түсіну есеп шығаруға негіз болады.",
    }),
    makeFill({
      id: `${topic.slug}-fill-4`,
      before: "Формула немесе негізгі идеяны",
      after: "арқылы бекіту қажет.",
      correctAnswer: "мысал",
      wordBank: ["мысал", "көшірме", "болжам", "қате"],
      explanation: "Тақырып мысал арқылы жақсы есте қалады.",
    }),
  ];
}

export function isFillBlankAnswerCorrect(params: {
  answer: string;
  correctAnswer: string;
}) {
  return normalize(params.answer) === normalize(params.correctAnswer);
}

export function isFillBlankStepCompleted(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  answers: Record<string, string>;
}) {
  const questions = getFillBlankQuestions(params.topic, params.level);

  return questions.every((question) => {
    const value = params.answers[question.id];
    return typeof value === "string" && value.trim().length > 0;
  });
}