import {
  physicsTopics,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import type { StoredAdaptiveProgress } from "@/lib/adaptiveEngine";

export type StudentAiContext = {
  studentName?: string | null;
  profileLevel?: string | null;
  interests?: string[];
  diagnosticSummary?: string | null;
  strongTopics?: string[];
  weakTopics?: string[];
};

type PersonalizationInput = {
  baseAnswer: string;
  question: string;
  topic?: PhysicsTopic | null;
  level?: TopicLevel;
  progress?: StoredAdaptiveProgress | null;
  context?: StudentAiContext;
};

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function inferTopic(question: string, fallbackTopic?: PhysicsTopic | null) {
  if (fallbackTopic) return fallbackTopic;

  const text = normalize(question);

  let bestTopic: PhysicsTopic | null = null;
  let bestScore = 0;

  for (const topic of physicsTopics) {
    let score = 0;

    const title = normalize(topic.title);
    const unit = normalize(topic.unit);
    const description = normalize(topic.description);
    const slug = normalize(topic.slug.replaceAll("-", " "));

    const words = `${title} ${unit} ${description} ${slug}`
      .split(" ")
      .filter((word) => word.length > 2);

    for (const word of words) {
      if (text.includes(word)) score += 1;
    }

    if (text.includes("ом") && topic.slug.includes("ohms-law")) score += 10;
    if (text.includes("тығыз") && topic.slug.includes("density")) score += 10;
    if (text.includes("жылдам") && topic.slug.includes("speed")) score += 10;
    if (text.includes("қысым") && topic.slug.includes("pressure")) score += 10;
    if (text.includes("күш") && topic.slug.includes("force")) score += 8;
    if (text.includes("магнит") && topic.slug.includes("magnetic")) score += 8;
    if (text.includes("фотоэффект") && topic.slug.includes("photoeffect")) {
      score += 10;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestScore >= 2 ? bestTopic : null;
}

function getMainInterest(interests?: string[]) {
  if (!interests || interests.length === 0) return null;

  return interests[0];
}

function buildInterestExample(topic: PhysicsTopic, interest: string) {
  const text = normalize(interest);
  const slug = topic.slug;

  if (includesAny(text, ["ғарыш", "космос", "астрономия"])) {
    if (slug.includes("speed")) {
      return "Сен ғарышқа қызықсаң, жылдамдықты спутниктің Жерді айналуымен елестетуге болады: спутник белгілі уақыт ішінде белгілі қашықтық жүреді.";
    }

    if (slug.includes("force") || slug.includes("newton")) {
      return "Ғарыш мысалы: зымыран қозғалғанда оған күш әсер етеді. Күш үлкен болса, үдеу де артады.";
    }

    if (slug.includes("magnetic")) {
      return "Ғарыш мысалы: Жердің магнит өрісі Күннен келетін зарядталған бөлшектерден қорғайды.";
    }

    return "Ғарышпен байланыстырсақ: физика денелердің қозғалысын, энергиясын және өрістердің әсерін түсіндіреді.";
  }

  if (includesAny(text, ["робот", "робототехника", "техника"])) {
    if (slug.includes("ohms-law") || slug.includes("electric")) {
      return "Робототехникада Ом заңы өте маңызды: моторға, сенсорға немесе LED-ке дұрыс ток беру үшін кернеу мен кедергіні есептеу керек.";
    }

    if (slug.includes("force")) {
      return "Робот қолы затты көтергенде күш әсер етеді. Егер зат ауыр болса, мотор көбірек күш беруі керек.";
    }

    return "Техникада бұл тақырып құрылғылардың қалай жұмыс істейтінін түсінуге көмектеседі.";
  }

  if (includesAny(text, ["медицина", "дәрігер", "биология"])) {
    if (slug.includes("pressure")) {
      return "Медицинада қысым қан қысымын түсіндіру үшін маңызды. Қысым күш пен ауданға байланысты.";
    }

    if (slug.includes("optics")) {
      return "Медицинада оптика көзілдірік, линза, микроскоп және эндоскоп сияқты құралдарда қолданылады.";
    }

    return "Медицинада физика құралдардың жұмысын, жарықтың өтуін, қысымды және энергияны түсіндіруге көмектеседі.";
  }

  if (includesAny(text, ["ойын", "game", "симуляция"])) {
    if (slug.includes("speed")) {
      return "Ойында кейіпкердің қозғалысы жылдамдықпен байланысты: ол қанша уақытта қанша қашықтық жүретінін физика сипаттайды.";
    }

    if (slug.includes("force")) {
      return "Ойында секіру, соқтығысу, құлау сияқты қозғалыстар күш және үдеумен байланысты.";
    }

    return "Симуляцияда параметрді өзгерткен сайын нәтиже өзгереді. Бұл физикалық заңдардың жұмысын көруге көмектеседі.";
  }

  if (includesAny(text, ["күнделікті", "өмір", "тұрмыс"])) {
    if (slug.includes("density")) {
      return "Күнделікті өмірде тығыздықты май мен судың араласпауынан көруге болады: олардың тығыздығы әртүрлі.";
    }

    if (slug.includes("pressure")) {
      return "Күнделікті өмірде қысымды пышақпен түсінуге болады: жүзі жұқа болғандықтан қысым үлкен болады.";
    }

    return "Бұл тақырып күнделікті өмірдегі қозғалыс, жарық, электр, жылу сияқты құбылыстарды түсіндіреді.";
  }

  return null;
}

function isWeakTopic(topic: PhysicsTopic, weakTopics?: string[]) {
  if (!weakTopics || weakTopics.length === 0) return false;

  const topicText = normalize(`${topic.title} ${topic.slug} ${topic.unit}`);

  return weakTopics.some((weak) => {
    const weakText = normalize(weak);
    return topicText.includes(weakText) || weakText.includes(topicText);
  });
}

function isStrongTopic(topic: PhysicsTopic, strongTopics?: string[]) {
  if (!strongTopics || strongTopics.length === 0) return false;

  const topicText = normalize(`${topic.title} ${topic.slug} ${topic.unit}`);

  return strongTopics.some((strong) => {
    const strongText = normalize(strong);
    return topicText.includes(strongText) || strongText.includes(topicText);
  });
}

function buildProgressAdvice(progress?: StoredAdaptiveProgress | null) {
  if (!progress) {
    return "Бұл тақырып бойынша әлі нәтиже жоқ, сондықтан алдымен жеңіл түсіндіру мен қарапайым тапсырмадан бастаған дұрыс.";
  }

  const percent = progress.lastPercent ?? 0;

  if (percent < 50) {
    return "Соңғы нәтиже төмен болғандықтан, қазір күрделі есепке өтпей, анықтама → формула → жеңіл мысал ретін ұстанған дұрыс.";
  }

  if (percent < 80) {
    return "Нәтиже орташа. Негізгі ой түсінікті, бірақ формуланы қолдану немесе ұғымдарды ажырату бойынша тағы 1–2 тапсырма орындау керек.";
  }

  if (progress.goodStreak >= 2) {
    return "Жақсы келе жатырсың. Тағы бір жақсы нәтиже көрсетсең, жүйе деңгейді көтере алады.";
  }

  return "Нәтиже жақсы. Енді ұқсас тапсырмаларды орындап, білімді бекіту керек.";
}

export function buildPersonalizedAiAnswer(input: PersonalizationInput) {
  const topic = inferTopic(input.question, input.topic);
  const context = input.context;

  if (!context && !input.progress) {
    return input.baseAnswer;
  }

  const additions: string[] = [];

  if (topic) {
    const interest = getMainInterest(context?.interests);
    const interestExample = interest
      ? buildInterestExample(topic, interest)
      : null;

    if (interestExample) {
      additions.push("Жеке мысал:");
      additions.push(interestExample);
      additions.push("");
    }

    if (isWeakTopic(topic, context?.weakTopics)) {
      additions.push("Диагностика бойынша ұсыныс:");
      additions.push(
        "Бұл бағыт сізге қиындау болуы мүмкін, сондықтан жауапты бірден күрделендірмей, алдымен негізгі ұғымнан бастаған дұрыс."
      );
      additions.push("");
    }

    if (isStrongTopic(topic, context?.strongTopics)) {
      additions.push("Күшті жағыңызбен байланыс:");
      additions.push(
        "Диагностикада бұл бағыт жақсырақ көрінген. Сондықтан осы тақырыпта күрделірек мысалдарға біртіндеп өтуге болады."
      );
      additions.push("");
    }
  }

  if (input.progress) {
    additions.push("Adaptive ұсыныс:");
    additions.push(buildProgressAdvice(input.progress));
    additions.push("");
  }

  if (additions.length === 0) {
    return input.baseAnswer;
  }

  return `${input.baseAnswer}\n\n${additions.join("\n").trim()}`;
}