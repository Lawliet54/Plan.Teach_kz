import {
  physicsTopics,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import type { StoredAdaptiveProgress } from "@/lib/adaptiveEngine";

export type AiChatEngineInput = {
  question: string;
  currentTopic?: PhysicsTopic | null;
  currentLevel?: TopicLevel;
  progress?: StoredAdaptiveProgress | null;
  previousMessages?: {
    role: "user" | "assistant";
    text: string;
  }[];
};

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function getLevelLabel(level?: TopicLevel) {
  if (level === "advanced") return "күрделі";
  if (level === "medium") return "орташа";
  return "базалық";
}

function findBestTopic(question: string, fallbackTopic?: PhysicsTopic | null) {
  const text = normalize(question);

  let bestTopic: PhysicsTopic | null = null;
  let bestScore = 0;

  for (const topic of physicsTopics) {
    let score = 0;

    const title = normalize(topic.title);
    const unit = normalize(topic.unit);
    const description = normalize(topic.description);
    const slug = normalize(topic.slug.replaceAll("-", " "));

    const searchText = `${title} ${unit} ${description} ${slug}`;

    const titleWords = title.split(" ").filter((word) => word.length > 2);
    const slugWords = slug.split(" ").filter((word) => word.length > 2);

    for (const word of [...titleWords, ...slugWords]) {
      if (text.includes(word)) score += 3;
    }

    if (searchText.includes(text) && text.length > 4) score += 2;

    if (text.includes("ом") && topic.slug.includes("ohms-law")) score += 10;
    if (text.includes("тығыз") && topic.slug.includes("density")) score += 10;
    if (text.includes("жылдам") && topic.slug.includes("speed")) score += 10;
    if (text.includes("күш") && topic.slug.includes("force")) score += 8;
    if (text.includes("қысым") && topic.slug.includes("pressure")) score += 8;
    if (text.includes("магнит") && topic.slug.includes("magnetic")) score += 8;
    if (text.includes("электр өріс") && topic.slug.includes("electric-field")) {
      score += 8;
    }
    if (text.includes("фотоэффект") && topic.slug.includes("photoeffect")) {
      score += 8;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  if (bestScore >= 3) return bestTopic;

  return fallbackTopic ?? null;
}

function getTopicContent(topic: PhysicsTopic, level?: TopicLevel) {
  const safeLevel = level ?? "basic";
  return topic.levels[safeLevel] ?? topic.levels.basic;
}

function getSimplePhysicsAnalogy(topic: PhysicsTopic) {
  const slug = topic.slug;

  if (slug.includes("ohms-law")) {
    return "Ом заңын су құбыры сияқты елестетуге болады: кернеу — суды итеретін қысым, ток — ағып жатқан су, ал кедергі — құбырдың тарлығы.";
  }

  if (slug.includes("density")) {
    return "Тығыздықты бірдей көлемдегі екі қораппен елестетіңіз: бір қорапта мақта, екіншісінде темір болса, темір тұрған қорап ауыр болады.";
  }

  if (slug.includes("speed")) {
    return "Жылдамдықты жүгірумен салыстыруға болады: бірдей уақытта кім көбірек жол жүрсе, соның жылдамдығы жоғары.";
  }

  if (slug.includes("force") || slug.includes("newton")) {
    return "Күшті арбаны итерумен түсінуге болады: қаттырақ итерсеңіз, арба тезірек қозғалады.";
  }

  if (slug.includes("pressure")) {
    return "Қысымды инемен түсінуге болады: ине ұшы кішкентай болғандықтан қысым үлкен болады, сондықтан ол оңай кіреді.";
  }

  if (slug.includes("magnetic")) {
    return "Магнит өрісі — магниттің айналасындағы көрінбейтін әсер аймағы. Ол темірді ұстамай-ақ тарта алады.";
  }

  if (slug.includes("photoeffect")) {
    return "Фотоэффект — жарық металл бетіндегі электрондарды сыртқа шығаратын құбылыс сияқты.";
  }

  return "Бұл тақырыпты алдымен күнделікті өмірдегі қарапайым құбылыспен байланыстырып түсінген дұрыс.";
}

function findNumberBySymbol(text: string, symbols: string[]) {
  for (const symbol of symbols) {
    const regex = new RegExp(`${symbol}\\s*=\\s*(-?\\d+(?:[.,]\\d+)?)`, "i");
    const match = text.match(regex);

    if (match?.[1]) {
      return Number(match[1].replace(",", "."));
    }
  }

  return null;
}

function findNumberByUnit(text: string, units: string[]) {
  const escaped = units.map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(-?\\d+(?:[.,]\\d+)?)\\s*(${escaped.join("|")})`, "i");
  const match = text.match(regex);

  if (!match?.[1]) return null;

  return Number(match[1].replace(",", "."));
}

function solveDetectedProblem(question: string, topic: PhysicsTopic | null) {
  const text = normalize(question);
  const slug = topic?.slug ?? "";

  const wantsSolve = includesAny(text, [
    "есеп",
    "шығар",
    "тап",
    "есепте",
    "қанша",
    "реши",
    "найди",
    "calculate",
  ]);

  if (!wantsSolve) return null;

  if (slug.includes("ohms-law") || text.includes("ом")) {
    const u =
      findNumberBySymbol(text, ["u", "кернеу"]) ??
      findNumberByUnit(text, ["в", "v", "вольт"]);
    const r =
      findNumberBySymbol(text, ["r", "кедергі"]) ??
      findNumberByUnit(text, ["ом", "ohm"]);
    const i =
      findNumberBySymbol(text, ["i", "ток"]) ??
      findNumberByUnit(text, ["а", "a", "ампер"]);

    if (u !== null && r !== null) {
      return [
        "Ом заңы бойынша шығарайық.",
        "",
        `Берілгені: U = ${u} В, R = ${r} Ом.`,
        "Формула: I = U / R.",
        `Есептеу: I = ${u} / ${r} = ${(u / r).toFixed(2)} А.`,
        "",
        `Жауабы: I = ${(u / r).toFixed(2)} А.`,
      ].join("\n");
    }

    if (i !== null && r !== null) {
      return [
        "Ом заңы бойынша кернеуді табамыз.",
        "",
        `Берілгені: I = ${i} А, R = ${r} Ом.`,
        "Формула: U = I · R.",
        `Есептеу: U = ${i} · ${r} = ${(i * r).toFixed(2)} В.`,
        "",
        `Жауабы: U = ${(i * r).toFixed(2)} В.`,
      ].join("\n");
    }

    if (u !== null && i !== null) {
      return [
        "Ом заңы бойынша кедергіні табамыз.",
        "",
        `Берілгені: U = ${u} В, I = ${i} А.`,
        "Формула: R = U / I.",
        `Есептеу: R = ${u} / ${i} = ${(u / i).toFixed(2)} Ом.`,
        "",
        `Жауабы: R = ${(u / i).toFixed(2)} Ом.`,
      ].join("\n");
    }
  }

  if (slug.includes("density") || text.includes("тығыз")) {
    const m =
      findNumberBySymbol(text, ["m", "масса"]) ??
      findNumberByUnit(text, ["г", "kg", "кг"]);
    const v =
      findNumberBySymbol(text, ["v", "көлем"]) ??
      findNumberByUnit(text, ["см3", "см³", "м3", "м³"]);

    if (m !== null && v !== null) {
      return [
        "Тығыздық формуласымен шығарайық.",
        "",
        `Берілгені: m = ${m}, V = ${v}.`,
        "Формула: ρ = m / V.",
        `Есептеу: ρ = ${m} / ${v} = ${(m / v).toFixed(2)}.`,
        "",
        `Жауабы: ρ = ${(m / v).toFixed(2)}.`,
      ].join("\n");
    }
  }

  if (slug.includes("speed") || text.includes("жылдам")) {
    const s =
      findNumberBySymbol(text, ["s", "жол"]) ??
      findNumberByUnit(text, ["м", "км"]);
    const t =
      findNumberBySymbol(text, ["t", "уақыт"]) ??
      findNumberByUnit(text, ["с", "сек", "сағ"]);

    if (s !== null && t !== null) {
      return [
        "Жылдамдық формуласымен шығарайық.",
        "",
        `Берілгені: s = ${s}, t = ${t}.`,
        "Формула: v = s / t.",
        `Есептеу: v = ${s} / ${t} = ${(s / t).toFixed(2)}.`,
        "",
        `Жауабы: v = ${(s / t).toFixed(2)}.`,
      ].join("\n");
    }
  }

  if (slug.includes("force") || slug.includes("newton") || text.includes("күш")) {
    const m =
      findNumberBySymbol(text, ["m", "масса"]) ??
      findNumberByUnit(text, ["кг", "kg"]);
    const a =
      findNumberBySymbol(text, ["a", "үдеу"]) ??
      findNumberByUnit(text, ["м/с2", "м/с²"]);

    if (m !== null && a !== null) {
      return [
        "Ньютонның екінші заңы бойынша шығарайық.",
        "",
        `Берілгені: m = ${m} кг, a = ${a} м/с².`,
        "Формула: F = m · a.",
        `Есептеу: F = ${m} · ${a} = ${(m * a).toFixed(2)} Н.`,
        "",
        `Жауабы: F = ${(m * a).toFixed(2)} Н.`,
      ].join("\n");
    }
  }

  return null;
}

function buildTopicAnswer(question: string, topic: PhysicsTopic, level: TopicLevel) {
  const text = normalize(question);
  const content = getTopicContent(topic, level);

  const asksFormula = includesAny(text, [
    "формула",
    "формуласын",
    "қалай есеп",
    "есептеу",
    "формулу",
  ]);

  const asksExample = includesAny(text, [
    "мысал",
    "пример",
    "ұқсас",
    "есеп шығарып",
    "көрсет",
  ]);

  const asksSimple = includesAny(text, [
    "түсіндір",
    "түсінбедім",
    "оңай",
    "қарапайым",
    "не деген",
    "объясни",
    "не понял",
  ]);

  const parts: string[] = [];

  if (asksFormula && content.formula) {
    parts.push(`Формула: ${content.formula}`);
    parts.push("");
    parts.push("Қолдану тәртібі:");
    parts.push("1. Берілген шамаларды жаз.");
    parts.push("2. Қай шаманы табу керек екенін анықта.");
    parts.push("3. Формулаға сандарды қой.");
    parts.push("4. Жауаптың өлшем бірлігін жаз.");
    parts.push("");
  }

  if (asksExample) {
    parts.push("Мысал:");
    parts.push(content.example);
    parts.push("");
  }

  if (asksSimple || (!asksFormula && !asksExample)) {
    parts.push(`${topic.title} тақырыбын қарапайым түсіндірейін.`);
    parts.push("");
    parts.push(content.simpleExplanation);
    parts.push("");
    parts.push(getSimplePhysicsAnalogy(topic));
    parts.push("");
    parts.push("Есте сақтау керек:");
    content.keyPoints.forEach((point, index) => {
      parts.push(`${index + 1}. ${point}`);
    });
    parts.push("");
  }

  if (content.formula && !asksFormula) {
    parts.push(`Негізгі формула: ${content.formula}`);
    parts.push("");
  }

  parts.push(`Сен қазір ${getLevelLabel(level)} деңгейде түсініп алуың керек негізгі мақсат:`);
  parts.push(content.shortGoal);

  return parts.join("\n");
}

function buildGeneralAnswer(question: string) {
  const text = normalize(question);

  if (includesAny(text, ["сәлем", "салам", "привет", "hello", "hi"])) {
    return "Сәлем! Сұрағыңызды жазыңыз. Физика тақырыбын түсіндіре аламын, есеп шығарып бере аламын немесе оқу жоспарын құрып бере аламын.";
  }

  if (includesAny(text, ["қалай оқимын", "қалай дайындалам", "план", "жоспар"])) {
    return [
      "Оқу үшін мына тәсілді қолдан:",
      "",
      "1. Алдымен тақырыптың негізгі анықтамасын түсініп ал.",
      "2. Формуланы жаттамай, оның мағынасын түсін.",
      "3. Бір жеңіл мысал шығар.",
      "4. Кейін орташа есепке өт.",
      "5. Қате шықса, қай жерде шатасқаныңды жазып ал.",
      "",
      "Егер нақты тақырыпты жазсаң, мен соған арнайы жоспар жасап беремін.",
    ].join("\n");
  }

  if (includesAny(text, ["сен кімсің", "кто ты", "не істей аласың"])) {
    return "Мен Plan.Teach_kz ішіндегі AI көмекшімін. Мен оқушыға физика тақырыптарын түсіндіруге, есеп шығаруға, формуланы түсіндіруге және оқу бағытын ұсынуға арналғанмын.";
  }

  return [
    "Сұрағыңызды түсіндім.",
    "",
    "Мен бұл сұраққа қысқаша жауап берейін: нақты нәтиже алу үшін сұрақты физика тақырыбымен немесе есептің берілгендерімен бірге жазған дұрыс.",
    "",
    "Мысалы:",
    "- Ом заңын түсіндір",
    "- U = 24 В, R = 12 Ом болса, ток күшін тап",
    "- Тығыздық деген не?",
    "- Магнит өрісі қалай пайда болады?",
    "",
    "Сіздің сұрағыңыз:",
    question,
  ].join("\n");
}

export function buildAiChatAnswer(input: AiChatEngineInput) {
  const question = input.question.trim();

  if (!question) {
    return "Сұрақ жазыңыз, мен жауап беремін.";
  }

  const level = input.progress?.currentLevel ?? input.currentLevel ?? "basic";
  const topic = findBestTopic(question, input.currentTopic);

  const solved = solveDetectedProblem(question, topic);

  if (solved) {
    return solved;
  }

  if (topic) {
    return buildTopicAnswer(question, topic, level);
  }

  return buildGeneralAnswer(question);
}