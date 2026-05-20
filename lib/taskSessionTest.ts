import {
  getContentRememberItems,
  getFormulaExpression,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";

export type TestQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

function hashText(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function uniqueOptions(options: string[]) {
  const seen = new Set<string>();

  return options.filter((option) => {
    const normalized = option.trim().toLowerCase();

    if (!normalized || seen.has(normalized)) return false;

    seen.add(normalized);
    return true;
  });
}

function makeQuestion(params: {
  id: string;
  question: string;
  correct: string;
  distractors: string[];
  explanation: string;
}): TestQuestion {
  const allOptions = uniqueOptions([
    params.correct,
    ...params.distractors,
    "Берілген мәлімет жеткіліксіз.",
    "Бұл жауап тақырыпқа сәйкес емес.",
  ]).slice(0, 4);

  const sortedOptions = [...allOptions].sort((a, b) => {
    const hashA = hashText(`${params.id}-${a}`);
    const hashB = hashText(`${params.id}-${b}`);

    return hashA - hashB;
  });

  return {
    id: params.id,
    question: params.question,
    options: sortedOptions,
    correctIndex: sortedOptions.findIndex((option) => option === params.correct),
    explanation: params.explanation,
  };
}

function getCommonDistractors() {
  return [
    "Тек анықтаманы жаттау жеткілікті.",
    "Физикалық шамалардың өлшем бірлігі болмайды.",
    "Формула есеп шығаруға қолданылмайды.",
    "Құбылыс ешқандай заңға бағынбайды.",
  ];
}

function getOhmsLawQuestions(topic: PhysicsTopic): TestQuestion[] {
  return [
    makeQuestion({
      id: `${topic.slug}-test-1`,
      question: "Ом заңының негізгі формуласы қайсы?",
      correct: "I = U / R",
      distractors: ["U = I / R", "R = I · U", "I = R / U"],
      explanation: "Ом заңы бойынша ток күші кернеуге тура, кедергіге кері пропорционал.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-2`,
      question: "Кедергі артса, кернеу тұрақты болғанда ток күші қалай өзгереді?",
      correct: "Ток күші азаяды.",
      distractors: ["Ток күші артады.", "Ток күші өзгермейді.", "Кернеу нөлге тең болады."],
      explanation: "I = U / R, сондықтан R артса, I азаяды.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-3`,
      question: "Ток күшінің өлшем бірлігі қандай?",
      correct: "Ампер",
      distractors: ["Вольт", "Ом", "Джоуль"],
      explanation: "Ток күші ампермен өлшенеді.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-4`,
      question: "Кернеудің өлшем бірлігі қандай?",
      correct: "Вольт",
      distractors: ["Ампер", "Ом", "Ватт"],
      explanation: "Кернеу вольтпен өлшенеді.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-5`,
      question: "Ом заңын есепте қолданудың дұрыс реті қандай?",
      correct: "Берілген шамаларды жазып, формуланы таңдап, сандарды қою.",
      distractors: [
        "Алдымен жауапты болжап жазу.",
        "Өлшем бірлікті мүлде жазбау.",
        "Формуланы қолданбай тек мәтінді көшіру.",
      ],
      explanation: "Физика есебінде берілгені, формула, есептеу және жауап реті сақталады.",
    }),
  ];
}

function getDensityQuestions(topic: PhysicsTopic): TestQuestion[] {
  return [
    makeQuestion({
      id: `${topic.slug}-test-1`,
      question: "Тығыздықтың негізгі формуласы қайсы?",
      correct: "ρ = m / V",
      distractors: ["ρ = V / m", "m = ρ / V", "V = ρ · m"],
      explanation: "Тығыздық масса мен көлемнің қатынасына тең.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-2`,
      question: "Тығыздық нені көрсетеді?",
      correct: "Заттың бірлік көлеміндегі массасын көрсетеді.",
      distractors: [
        "Дененің температурасын көрсетеді.",
        "Дененің жүрген жолын көрсетеді.",
        "Заттың түсін көрсетеді.",
      ],
      explanation: "Тығыздық — масса мен көлемге байланысты шама.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-3`,
      question: "Көлем артса, масса тұрақты болса, тығыздық қалай өзгереді?",
      correct: "Азаяды.",
      distractors: ["Артады.", "Өзгермейді.", "Нөлге тең болады."],
      explanation: "ρ = m / V, көлем артса тығыздық азаяды.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-4`,
      question: "Тығыздықтың жиі қолданылатын өлшем бірлігі қайсы?",
      correct: "кг/м³",
      distractors: ["м/с", "Н", "В"],
      explanation: "ХБЖ жүйесінде тығыздық кг/м³ арқылы өлшенеді.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-5`,
      question: "Бірдей көлемдегі темір мен мақтаның массасы неге әртүрлі?",
      correct: "Себебі олардың тығыздығы әртүрлі.",
      distractors: [
        "Себебі көлемнің өлшем бірлігі жоқ.",
        "Себебі масса әрқашан бірдей болады.",
        "Себебі тығыздық қозғалысқа ғана байланысты.",
      ],
      explanation: "Тығыздығы үлкен зат бірдей көлемде ауыр болады.",
    }),
  ];
}

function getSpeedQuestions(topic: PhysicsTopic): TestQuestion[] {
  return [
    makeQuestion({
      id: `${topic.slug}-test-1`,
      question: "Жылдамдықтың негізгі формуласы қайсы?",
      correct: "v = s / t",
      distractors: ["v = t / s", "s = v / t", "t = s · v"],
      explanation: "Жылдамдық жүрген жолдың уақытқа қатынасына тең.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-2`,
      question: "Жылдамдық нені көрсетеді?",
      correct: "Дененің уақыт бірлігінде қанша жол жүретінін көрсетеді.",
      distractors: [
        "Дененің массасын көрсетеді.",
        "Дененің тығыздығын көрсетеді.",
        "Дененің температурасын көрсетеді.",
      ],
      explanation: "Жылдамдық қозғалыстың шапшаңдығын сипаттайды.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-3`,
      question: "Жол артса, уақыт тұрақты болса, жылдамдық қалай өзгереді?",
      correct: "Артады.",
      distractors: ["Азаяды.", "Өзгермейді.", "Нөлге тең болады."],
      explanation: "v = s / t, жол артса жылдамдық артады.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-4`,
      question: "Жылдамдықтың ХБЖ-дегі өлшем бірлігі қайсы?",
      correct: "м/с",
      distractors: ["кг/м³", "Н", "Ом"],
      explanation: "Жылдамдық метр/секундпен өлшенеді.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-5`,
      question: "Орташа жылдамдықты табу үшін не қажет?",
      correct: "Жалпы жолды жалпы уақытқа бөлу керек.",
      distractors: [
        "Массаны көлемге бөлу керек.",
        "Күшті ауданға бөлу керек.",
        "Кернеуді ток күшіне көбейту керек.",
      ],
      explanation: "Орташа жылдамдық жалпы жол мен жалпы уақыт арқылы табылады.",
    }),
  ];
}

export function getTestQuestions(
  topic: PhysicsTopic,
  level: TopicLevel
): TestQuestion[] {
  const slug = topic.slug.toLowerCase();
  const content = topic.levels[level];

  if (slug.includes("ohms-law")) {
    return getOhmsLawQuestions(topic);
  }

  if (slug.includes("density")) {
    return getDensityQuestions(topic);
  }

  if (slug.includes("speed")) {
    return getSpeedQuestions(topic);
  }

  const formulaAnswer =
    getFormulaExpression(content.formula) ??
    "Негізгі ұғымды түсініп, оны мысалмен байланыстыру.";
  const rememberItems = getContentRememberItems(content);

  return [
    makeQuestion({
      id: `${topic.slug}-test-1`,
      question: `"${topic.title}" тақырыбының негізгі мақсаты қандай?`,
      correct: content.shortGoal,
      distractors: getCommonDistractors(),
      explanation: "Оқу мақсаты тақырыпты қандай деңгейде меңгеру керек екенін көрсетеді.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-2`,
      question: "Бұл тақырыптағы ең маңызды ой қайсы?",
      correct: rememberItems[0] ?? content.shortGoal,
      distractors: getCommonDistractors(),
      explanation: "Негізгі ойды түсінбей есеп шығару қиын болады.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-3`,
      question: "Осы тақырыпта қандай формула немесе негізгі тәсіл қолданылады?",
      correct: formulaAnswer,
      distractors: getCommonDistractors(),
      explanation: "Формула немесе негізгі тәсіл есеп шығаруға көмектеседі.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-4`,
      question: "Тақырыпты қарапайым тілмен қалай түсіндіруге болады?",
      correct: content.simpleExplanation,
      distractors: getCommonDistractors(),
      explanation: "Қарапайым түсіндіру күрделі ұғымды жеңіл қабылдауға көмектеседі.",
    }),
    makeQuestion({
      id: `${topic.slug}-test-5`,
      question: "Осы тақырыпты меңгеру үшін не істеу керек?",
      correct: "Анықтаманы түсініп, формула немесе негізгі ойды мысалда қолдану керек.",
      distractors: [
        "Тек мәтінді жаттау керек.",
        "Өлшем бірліктерді елемеу керек.",
        "Есептің берілгенін жазбай шығару керек.",
      ],
      explanation: "Физиканы түсіну үшін анықтама, формула және мысал бірге қолданылуы керек.",
    }),
  ];
}

export function isTestStepCompleted(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  answers: Record<string, number>;
}) {
  const questions = getTestQuestions(params.topic, params.level);

  return questions.every(
    (question) => typeof params.answers[question.id] === "number"
  );
}
