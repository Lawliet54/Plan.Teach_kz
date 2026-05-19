import type { Profile, StudentLevel } from "@/lib/types";

type GradeScores = Record<string, { correct: number; total: number }>;

export type LocalAiParameter = {
  key: string;
  category: string;
  label: string;
  value: number;
  weight: number;
};

export type LocalAiProfile = {
  version: "local-ai-v1";
  parameter_count: 1000;
  level: StudentLevel;
  mastery_percent: number;
  learning_style: string;
  tutor_tone: string;
  answer_depth: "short" | "guided" | "detailed";
  weak_topics: string[];
  strong_topics: string[];
  recommendations: string[];
  parameters: LocalAiParameter[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hashToScore(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 100000;
  }

  return hash % 101;
}

type PhysicsTopicInfo = {
  aliases: string[];
  title: string;
  explain: string;
  formula?: string;
  example?: string;
};

const physicsTopics: PhysicsTopicInfo[] = [
  {
    aliases: ["ом", "ohm", "кедергі", "кернеу", "ток"],
    title: "Ом заңы",
    explain:
      "Ом заңы электр тізбегіндегі ток күші, кернеу және кедергінің байланысын көрсетеді. Кернеу артса ток та артады, ал кедергі артса ток азаяды.",
    formula: "I = U / R, мұнда I - ток күші, U - кернеу, R - кедергі.",
    example: "Мысалы, U = 12 В, R = 4 Ом болса, I = 12 / 4 = 3 А.",
  },
  {
    aliases: ["ньютон", "newton", "күш", "үдеу", "масса"],
    title: "Ньютонның екінші заңы",
    explain:
      "Бұл заң денеге әсер ететін күш дененің массасы мен үдеуіне байланысты екенін айтады. Масса көп болса, бірдей үдеу беру үшін көбірек күш керек.",
    formula: "F = m · a, мұнда F - күш, m - масса, a - үдеу.",
    example: "m = 2 кг, a = 3 м/с² болса, F = 2 · 3 = 6 Н.",
  },
  {
    aliases: ["архимед", "ығыстыру", "сұйық", "көтеруші күш"],
    title: "Архимед күші",
    explain:
      "Сұйыққа немесе газға батырылған денеге жоғары бағытталған көтеруші күш әсер етеді. Сол күш дене ығыстырған сұйықтың салмағына тең.",
    formula: "F_A = ρ · g · V, мұнда ρ - сұйық тығыздығы, V - батырылған көлем.",
  },
  {
    aliases: ["жылдамдық", "қозғалыс", "жол", "уақыт", "v=", "s="],
    title: "Жылдамдық",
    explain:
      "Жылдамдық дененің бір уақыт ішінде қанша жол жүргенін көрсетеді. Егер жол көп, уақыт аз болса, жылдамдық жоғары болады.",
    formula: "v = s / t, мұнда v - жылдамдық, s - жол, t - уақыт.",
    example: "s = 100 м, t = 20 с болса, v = 100 / 20 = 5 м/с.",
  },
  {
    aliases: ["тығыздық", "көлем", "rho", "ρ"],
    title: "Тығыздық",
    explain:
      "Тығыздық заттың бірлік көлеміндегі массасын көрсетеді. Бір көлемде масса көп болса, зат тығызырақ болады.",
    formula: "ρ = m / V, мұнда ρ - тығыздық, m - масса, V - көлем.",
  },
  {
    aliases: ["қуат", "жұмыс", "энергия"],
    title: "Қуат",
    explain:
      "Қуат жұмыстың қаншалықты тез орындалатынын көрсетеді. Бірдей жұмысты аз уақытта орындаса, қуат үлкен болады.",
    formula: "P = A / t, мұнда P - қуат, A - жұмыс, t - уақыт.",
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/ё/g, "е").trim();
}

function findTopic(question: string) {
  const normalized = normalizeText(question);

  return physicsTopics.find((topic) =>
    topic.aliases.some((alias) => normalized.includes(normalizeText(alias)))
  );
}

function hasAny(question: string, words: string[]) {
  const normalized = normalizeText(question);
  return words.some((word) => normalized.includes(normalizeText(word)));
}

function extractNumbers(question: string) {
  return [...question.matchAll(/-?\d+(?:[,.]\d+)?/g)].map((match) =>
    Number(match[0].replace(",", "."))
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function solveSimplePhysics(question: string, topic?: PhysicsTopicInfo) {
  const normalized = normalizeText(question);
  const numbers = extractNumbers(question);

  if (numbers.length < 2) {
    return null;
  }

  if (topic?.title === "Ом заңы" || hasAny(normalized, ["ом", "кернеу", "кедергі", "ток"])) {
    const [first, second] = numbers;

    if (hasAny(normalized, ["ток", "i", "ампер", "а таб", "i таб"])) {
      const current = first / second;
      return [
        "Берілгенін былай жазуға болады:",
        `U = ${formatNumber(first)} В`,
        `R = ${formatNumber(second)} Ом`,
        "",
        "Табу керек: I",
        "Формула: I = U / R",
        `Шешуі: I = ${formatNumber(first)} / ${formatNumber(second)} = ${formatNumber(current)} А`,
        "",
        `Жауабы: ${formatNumber(current)} А.`,
      ].join("\n");
    }

    if (hasAny(normalized, ["кернеу", "u", "вольт", "u таб"])) {
      const voltage = first * second;
      return [
        "Берілгенін бөліп алайық:",
        `I = ${formatNumber(first)} А`,
        `R = ${formatNumber(second)} Ом`,
        "",
        "Табу керек: U",
        "Формула: U = I · R",
        `Шешуі: U = ${formatNumber(first)} · ${formatNumber(second)} = ${formatNumber(voltage)} В`,
        "",
        `Жауабы: ${formatNumber(voltage)} В.`,
      ].join("\n");
    }
  }

  if (topic?.title === "Жылдамдық" || hasAny(normalized, ["жылдамдық", "жол", "уақыт"])) {
    const [distance, time] = numbers;
    const speed = distance / time;

    return [
      "Берілгені:",
      `s = ${formatNumber(distance)} м`,
      `t = ${formatNumber(time)} с`,
      "",
      "Табу керек: v",
      "Формула: v = s / t",
      `Шешуі: v = ${formatNumber(distance)} / ${formatNumber(time)} = ${formatNumber(speed)} м/с`,
      "",
      `Жауабы: ${formatNumber(speed)} м/с.`,
    ].join("\n");
  }

  if (topic?.title === "Ньютонның екінші заңы" || hasAny(normalized, ["күш", "үдеу", "масса"])) {
    const [mass, acceleration] = numbers;
    const force = mass * acceleration;

    return [
      "Берілгені:",
      `m = ${formatNumber(mass)} кг`,
      `a = ${formatNumber(acceleration)} м/с²`,
      "",
      "Табу керек: F",
      "Формула: F = m · a",
      `Шешуі: F = ${formatNumber(mass)} · ${formatNumber(acceleration)} = ${formatNumber(force)} Н`,
      "",
      `Жауабы: ${formatNumber(force)} Н.`,
    ].join("\n");
  }

  return null;
}

export function getLocalAiSummary(profile: LocalAiProfile) {
  const weak = profile.weak_topics.slice(0, 3).join(", ") || "негізгі ұғымдар";
  const strong = profile.strong_topics.slice(0, 3).join(", ") || "қызығушылық";

  return `Local AI: оқушы деңгейі ${profile.level}, меңгеруі ${profile.mastery_percent}%. Күшті жағы: ${strong}. Негізгі жұмыс аймағы: ${weak}. Tutor режимі: ${profile.answer_depth}, стиль: ${profile.learning_style}.`;
}

export function buildLocalAiProfile(input: {
  profile?: Pick<Profile, "id" | "level" | "full_name"> | null;
  totalScore: number;
  maxScore: number;
  level: string;
  gradeScores?: GradeScores | null;
  strongTopics?: string[];
  weakTopics?: string[];
  interests?: string[];
}): LocalAiProfile {
  const masteryPercent = clamp(
    input.maxScore > 0 ? Math.round((input.totalScore / input.maxScore) * 100) : 0
  );
  const level = (
    input.level === "advanced"
      ? "advanced"
      : input.level === "intermediate"
        ? "intermediate"
        : "beginner"
  ) as StudentLevel;
  const weakTopics = input.weakTopics?.length
    ? input.weakTopics
    : ["Өлшем бірлік", "Формула қолдану"];
  const strongTopics = input.strongTopics?.length
    ? input.strongTopics
    : ["Теорияны қабылдау"];
  const interests = input.interests?.length ? input.interests : ["Есеп шығару"];
  const gradeScores = input.gradeScores ?? {};

  const answerDepth =
    level === "advanced" ? "detailed" : level === "intermediate" ? "guided" : "short";
  const learningStyle =
    masteryPercent >= 75
      ? "challenge-first"
      : masteryPercent >= 45
        ? "example-first"
        : "step-by-step";
  const tutorTone =
    masteryPercent >= 70
      ? "қысқа, нақты, күрделі есепке жетелейді"
      : masteryPercent >= 40
        ? "мысалмен түсіндіреді, қателікті бірге табады"
        : "өте қарапайым тілмен, бір қадамнан түсіндіреді";

  const seedParts = [
    input.profile?.id ?? "anonymous",
    input.profile?.full_name ?? "",
    level,
    masteryPercent,
    weakTopics.join("|"),
    strongTopics.join("|"),
    interests.join("|"),
    JSON.stringify(gradeScores),
  ];
  const seed = seedParts.join("::");
  const categories = [
    "diagnostic",
    "concept",
    "calculation",
    "unit",
    "formula",
    "graph",
    "interest",
    "teacher-signal",
    "motivation",
    "routing",
  ];
  const labels = [
    "Теорияны түсіну",
    "Формула таңдау",
    "Өлшем бірлік",
    "Сандық есеп",
    "График оқу",
    "Тәжірибе логикасы",
    "Қызығушылық бағыты",
    "Қателік ықтималдығы",
    "Қайталау қажеттілігі",
    "Келесі қадам",
  ];
  const baseByLevel = level === "advanced" ? 72 : level === "intermediate" ? 52 : 34;

  const parameters = Array.from({ length: 1000 }, (_, index) => {
    const category = categories[index % categories.length];
    const label = labels[index % labels.length];
    const topicPenalty = weakTopics.length * ((index % 5) + 1);
    const strengthBoost = strongTopics.length * ((index % 4) + 1);
    const interestBoost = interests.length * ((index % 3) + 1);
    const noise = hashToScore(`${seed}:${index}`) - 50;
    const value = clamp(
      Math.round(baseByLevel + masteryPercent * 0.35 + strengthBoost + interestBoost - topicPenalty + noise * 0.18)
    );

    return {
      key: `ai_param_${String(index + 1).padStart(4, "0")}`,
      category,
      label,
      value,
      weight: Number((0.15 + (index % 20) * 0.04).toFixed(2)),
    };
  });

  return {
    version: "local-ai-v1",
    parameter_count: 1000,
    level,
    mastery_percent: masteryPercent,
    learning_style: learningStyle,
    tutor_tone: tutorTone,
    answer_depth: answerDepth,
    weak_topics: weakTopics,
    strong_topics: strongTopics,
    recommendations: [
      `${weakTopics[0]} тақырыбын 10 минуттық қысқа қайталаудан бастау.`,
      `${interests[0]} бағытымен байланысты бір жеңіл есеп шығару.`,
      "Жауап бергенде формула, сан, өлшем бірлік ретін сақтау.",
      level === "advanced"
        ? "Күрделі есептерде дәлелдеуді және графикті бірге қолдану."
        : "Әр есепте бір ғана физикалық шаманы іздеп, содан кейін формула таңдау.",
    ],
    parameters,
  };
}

export function createLocalTutorReply(input: {
  question?: string;
  aiProfile: LocalAiProfile;
  history?: string[];
}) {
  const question = input.question?.trim() || "";
  const normalized = normalizeText(question);
  const context = input.history?.slice(-8).join("\n") ?? "";
  const topic = findTopic(question) ?? findTopic(context);
  const solution = solveSimplePhysics(question, topic);
  const opener =
    input.aiProfile.level === "advanced"
      ? "Жақсы, нақтылап өтейін."
      : input.aiProfile.level === "intermediate"
        ? "Иә, түсіндірейін."
        : "Иә, қарапайым тілмен айтайын.";

  if (!question) {
    return "Қандай тақырып немесе есеп керек? Мысалы: “Ом заңы туралы айт” немесе “U=12 В, R=4 Ом, ток күшін тап” деп жаза аласыз.";
  }

  if (hasAny(normalized, ["сен не білесің", "не білесің", "сен кімсің", "не істей аласың"])) {
    return [
      "Мен физикадан көмектесетін оқу көмекшісімін.",
      "",
      "Мен мыналарды істей аламын:",
      "1. Заңдарды қарапайым тілмен түсіндіремін.",
      "2. Формуланың мағынасын ашып беремін.",
      "3. Берілген есепті “Берілгені - Формула - Шешуі - Жауабы” түрінде шығарамын.",
      "4. Қате кеткен жерді табуға көмектесемін.",
      "5. Диагностика нәтижесіне қарай түсіндіруді жеңілдетіп немесе күрделендіріп беремін.",
      "",
      "Мысалы, “Ом заңы туралы айт” немесе “U=12 В, R=4 Ом, I тап” деп сұрап көр.",
    ].join("\n");
  }

  if (solution) {
    return `${opener}\n\n${solution}`;
  }

  if (topic && hasAny(normalized, ["айт", "түсіндір", "деген не", "заңы", "формула", "туралы"])) {
    return [
      opener,
      "",
      `${topic.title} - ${topic.explain}`,
      topic.formula ? `\nФормуласы: ${topic.formula}` : "",
      topic.example ? `\n${topic.example}` : "",
      "",
      "Қысқаша айтқанда, алдымен қандай шамалар берілгенін анықтайсың, содан кейін осы заңға сәйкес формуланы таңдайсың.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (topic) {
    return [
      opener,
      "",
      `Бұл сұрақ ${topic.title} тақырыбына ұқсайды.`,
      topic.explain,
      topic.formula ? `\nКерек формула: ${topic.formula}` : "",
      "",
      "Егер есеп шығару керек болса, сандарымен бірге жазыңыз. Мысалы: “U=12 В, R=4 Ом, ток күшін тап”.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (hasAny(normalized, ["есеп", "тап", "шығар", "берілген", "формула"])) {
    return [
      "Есепті шығарып беруге дайынмын, бірақ маған нақты сандар мен не табу керек екені керек.",
      "",
      "Мына форматпен жіберсең жақсы болады:",
      "Берілгені: U = 12 В, R = 4 Ом. Табу керек: I.",
      "",
      "Сонда мен берілгенін бөліп жазып, формуласын таңдап, шешуін толық көрсетемін.",
    ].join("\n");
  }

  return [
    opener,
    "",
    "Сұрағыңды түсіндім. Мұны физикада құбылыстың себебін, қолданылатын шамаларды және олардың байланысын табу арқылы түсіндіреді.",
    "",
    "Егер қай заңға немесе қай тақырыпқа қатысты екенін жазсаң, мен нақты формуламен және мысалмен түсіндіріп беремін. Ал есеп болса, берілген сандарын жібер - шығарып беремін.",
  ].join("\n");
}
