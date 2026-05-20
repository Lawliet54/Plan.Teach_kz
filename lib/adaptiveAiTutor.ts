import {
  levelLabels,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import type { StoredAdaptiveProgress } from "@/lib/adaptiveEngine";

export type AdaptiveTutorInput = {
  question: string;
  topic: PhysicsTopic;
  level: TopicLevel;
  progress: StoredAdaptiveProgress | null;
};

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function getProgressSummary(progress: StoredAdaptiveProgress | null) {
  if (!progress) {
    return "Бұл тақырып бойынша сіз әлі тапсырма орындамағансыз. Сондықтан AI алдымен негізгі ұғымдарды жеңіл тілмен түсіндіреді.";
  }

  const last = progress.lastPercent ?? 0;

  if (last >= 80) {
    return `Соңғы нәтижеңіз ${last}%. Бұл жақсы көрсеткіш. Жақсы серия: ${progress.goodStreak}/3. Тағы жақсы орындасаңыз, деңгей көтерілуі мүмкін.`;
  }

  if (last >= 60) {
    return `Соңғы нәтижеңіз ${last}%. Тақырыптың негізі түсінікті, бірақ кейбір ұғымдарды бекіту керек.`;
  }

  return `Соңғы нәтижеңіз ${last}%. Бұл тақырыпта қиындық бар. AI сізге тақырыпты жеңіл тілмен қайта түсіндіреді және қарапайым мысал береді.`;
}

function getSimpleAnalogy(topic: PhysicsTopic) {
  const slug = topic.slug;

  if (slug.includes("ohms-law")) {
    return "Ом заңын су құбырымен елестетуге болады: кернеу — суды итеретін қысым, ток — ағып жатқан су, кедергі — құбырдың тарлығы.";
  }

  if (slug.includes("density")) {
    return "Тығыздықты бірдей көлемдегі екі қораппен елестетіңіз: бір қорапта мақта, екіншісінде темір болса, темір тұрған қорап ауыр болады. Себебі темірдің тығыздығы үлкен.";
  }

  if (slug.includes("speed")) {
    return "Жылдамдықты жүгірумен салыстыруға болады: бірдей уақытта кім көп қашықтық жүрсе, соның жылдамдығы жоғары.";
  }

  if (slug.includes("force") || slug.includes("newton")) {
    return "Күшті арбаны итерумен түсінуге болады: арбаны қатты итерсеңіз, ол тезірек қозғалады. Ауыр арбаны қозғалту қиынырақ.";
  }

  if (slug.includes("magnetic")) {
    return "Магнит өрісін көрінбейтін әсер аймағы ретінде елестетіңіз: магнит темірді ұстамай-ақ өзіне тартады.";
  }

  if (slug.includes("electric")) {
    return "Электр өрісі — зарядтың айналасындағы көрінбейтін әсер аймағы. Сол аймақ басқа зарядтарға күшпен әсер етеді.";
  }

  if (slug.includes("photoeffect")) {
    return "Фотоэффектті жарықтың металл бетіндегі электрондарды итеріп шығаруымен елестетуге болады. Жарық энергиясы жеткілікті болса ғана электрон ұшып шығады.";
  }

  return "Бұл тақырыпты күнделікті өмірдегі құбылыспен байланыстырып түсінген дұрыс: алдымен негізгі ұғымды түсініп, кейін формула мен мысалға өтеміз.";
}

function getPracticeAdvice(progress: StoredAdaptiveProgress | null) {
  if (!progress) {
    return "Алдымен теорияны оқып, кейін жеңіл тест пен бос орын толтыру тапсырмасын орындаңыз.";
  }

  if ((progress.lastPercent ?? 0) < 60) {
    return "Қазір күрделі есепке асықпаңыз. Алдымен теориядағы 3 негізгі ойды қайталап, жеңіл тапсырма орындаңыз.";
  }

  if ((progress.lastPercent ?? 0) < 80) {
    return "Нәтиже орташа. Енді формуланы қолданып 1–2 есеп шығарып көріңіз.";
  }

  if (progress.goodStreak >= 2) {
    return "Сіз жақсы келе жатырсыз. Тағы бір жақсы нәтиже деңгей көтеруге көмектеседі.";
  }

  return "Тақырыпты жақсы меңгеріп жатырсыз. Енді орташа деңгейдегі тапсырмаларға дайындалуға болады.";
}

function buildExample(topic: PhysicsTopic, level: TopicLevel) {
  const content = topic.levels[level];

  if (topic.slug.includes("ohms-law")) {
    return [
      "Мысал:",
      "Кернеу U = 24 В, кедергі R = 12 Ом.",
      "Ом заңы: I = U / R.",
      "I = 24 / 12 = 2 А.",
      "Жауабы: ток күші 2 А.",
    ].join("\n");
  }

  if (topic.slug.includes("density")) {
    return [
      "Мысал:",
      "Масса m = 200 г, көлем V = 100 см³.",
      "Тығыздық формуласы: ρ = m / V.",
      "ρ = 200 / 100 = 2 г/см³.",
      "Жауабы: тығыздық 2 г/см³.",
    ].join("\n");
  }

  if (topic.slug.includes("speed")) {
    return [
      "Мысал:",
      "Дене 100 м жолды 20 с ішінде жүрді.",
      "Жылдамдық формуласы: v = s / t.",
      "v = 100 / 20 = 5 м/с.",
      "Жауабы: жылдамдық 5 м/с.",
    ].join("\n");
  }

  return [
    "Мысал:",
    content.example,
    content.formula ? `Қолданылатын формула: ${content.formula}` : "",
    "Алдымен берілген шамаларды анықтап, кейін формуланы қолдану керек.",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildSimilarTask(topic: PhysicsTopic, level: TopicLevel) {
  if (topic.slug.includes("ohms-law")) {
    return "Ұқсас тапсырма: кернеу 36 В, кедергі 9 Ом болса, ток күшін табыңыз.";
  }

  if (topic.slug.includes("density")) {
    return "Ұқсас тапсырма: массасы 300 г, көлемі 150 см³ дененің тығыздығын табыңыз.";
  }

  if (topic.slug.includes("speed")) {
    return "Ұқсас тапсырма: дене 240 м жолды 30 с ішінде жүрсе, жылдамдығын табыңыз.";
  }

  if (topic.slug.includes("force") || topic.slug.includes("newton")) {
    return "Ұқсас тапсырма: массасы 6 кг дене 2 м/с² үдеумен қозғалса, күшті табыңыз.";
  }

  return `Ұқсас тапсырма: "${topic.title}" тақырыбы бойынша негізгі анықтаманы жазып, бір күнделікті өмірлік мысал келтіріңіз.`;
}

export function buildAdaptiveTutorAnswer(input: AdaptiveTutorInput) {
  const question = input.question.trim();
  const text = question.toLowerCase();
  const topic = input.topic;
  const level = input.progress?.currentLevel ?? input.level;
  const content = topic.levels[level];

  const wantsSimple =
    includesAny(text, [
      "түсінбедім",
      "түсіндір",
      "қарапайым",
      "оңай",
      "не деген",
      "что это",
      "объясни",
      "не понял",
    ]) || question.length < 8;

  const wantsFormula = includesAny(text, [
    "формула",
    "есеп",
    "шығару",
    "қалай табам",
    "қалай есептейм",
    "решить",
    "формулу",
  ]);

  const wantsMistake = includesAny(text, [
    "қате",
    "неге дұрыс емес",
    "неге қате",
    "ошибка",
    "почему неправильно",
  ]);

  const wantsExample = includesAny(text, [
    "мысал",
    "пример",
    "ұқсас",
    "тағы",
    "тапсырма",
  ]);

  const parts: string[] = [];

  parts.push(`Тақырып: ${topic.title}`);
  parts.push(`Деңгей: ${levelLabels[level]}`);
  parts.push("");

  parts.push("Adaptive талдау:");
  parts.push(getProgressSummary(input.progress));
  parts.push("");

  if (wantsMistake) {
    parts.push("Қате болуы мүмкін негізгі себептер:");
    parts.push("1. Формуладағы шамаларды шатастыру.");
    parts.push("2. Өлшем бірлікті дұрыс алмау.");
    parts.push("3. Берілген шаманы дұрыс оқымау.");
    parts.push("4. Есепте соңғы амалға дейін бармау.");
    parts.push("");
    parts.push("Қазір сізге ең дұрыс әрекет:");
    parts.push(getPracticeAdvice(input.progress));
    parts.push("");
  }

  if (wantsFormula && content.formula) {
    parts.push("Формула:");
    parts.push(content.formula);
    parts.push("");
    parts.push("Формуланы қолдану тәртібі:");
    parts.push("1. Берілген шамаларды жаз.");
    parts.push("2. Қай шаманы табу керек екенін анықта.");
    parts.push("3. Формуланы таңда.");
    parts.push("4. Сандарды қойып есепте.");
    parts.push("5. Өлшем бірлігін жаз.");
    parts.push("");
    parts.push(buildExample(topic, level));
    parts.push("");
  }

  if (wantsExample) {
    parts.push(buildExample(topic, level));
    parts.push("");
    parts.push(buildSimilarTask(topic, level));
    parts.push("");
  }

  if (wantsSimple || (!wantsFormula && !wantsMistake && !wantsExample)) {
    parts.push("Қарапайым түсіндіру:");
    parts.push(content.simpleExplanation);
    parts.push("");
    parts.push("Күнделікті өмірмен байланыс:");
    parts.push(getSimpleAnalogy(topic));
    parts.push("");
    parts.push("Есте сақтау керек:");
    content.keyPoints.forEach((point, index) => {
      parts.push(`${index + 1}. ${point}`);
    });
    parts.push("");
  }

  parts.push("AI ұсынысы:");
  parts.push(getPracticeAdvice(input.progress));
  parts.push("");
  parts.push("Келесі қадам:");
  parts.push(buildSimilarTask(topic, level));

  return parts.join("\n");
}

export function getQuickTutorQuestions(topic: PhysicsTopic) {
  return [
    `${topic.title} тақырыбын қарапайым тілмен түсіндір`,
    "Формуласын қалай қолданам?",
    "Маған бір мысал шығарып бер",
    "Менің қатем қай жерде болуы мүмкін?",
    "Осы тақырыпқа ұқсас тапсырма бер",
  ];
}