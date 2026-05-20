import type { PhysicsTopic, TopicLevel } from "@/data/physicsTopics";

export type MatchingTerm = {
  id: string;
  label: string;
};

export type MatchingDefinition = {
  id: string;
  label: string;
  correctTermId: string;
};

export type MatchingTask = {
  terms: MatchingTerm[];
  definitions: MatchingDefinition[];
};

function makeGenericMatchingTask(topic: PhysicsTopic, level: TopicLevel): MatchingTask {
  const content = topic.levels[level];

  return {
    terms: [
      {
        id: "topic",
        label: topic.title,
      },
      {
        id: "goal",
        label: "Оқу мақсаты",
      },
      {
        id: "formula",
        label: "Формула",
      },
      {
        id: "example",
        label: "Мысал",
      },
    ],
    definitions: [
      {
        id: "def-topic",
        label: content.simpleExplanation,
        correctTermId: "topic",
      },
      {
        id: "def-goal",
        label: content.shortGoal,
        correctTermId: "goal",
      },
      {
        id: "def-formula",
        label: content.formula ?? "Бұл тақырыпта негізгі ұғымдар мен байланыстар қолданылады.",
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

function getOhmsLawMatchingTask(): MatchingTask {
  return {
    terms: [
      { id: "current", label: "Ток күші" },
      { id: "voltage", label: "Кернеу" },
      { id: "resistance", label: "Кедергі" },
      { id: "ohm-law", label: "Ом заңы" },
    ],
    definitions: [
      {
        id: "def-current",
        label: "Өткізгіш арқылы өтетін электр зарядының қозғалысын сипаттайтын шама.",
        correctTermId: "current",
      },
      {
        id: "def-voltage",
        label: "Электр зарядтарын қозғалысқа келтіретін электрлік әсер.",
        correctTermId: "voltage",
      },
      {
        id: "def-resistance",
        label: "Өткізгіштің электр тогына қарсы әсерін сипаттайтын шама.",
        correctTermId: "resistance",
      },
      {
        id: "def-ohm-law",
        label: "Ток күші кернеуге тура, кедергіге кері пропорционал екенін көрсететін заң.",
        correctTermId: "ohm-law",
      },
    ],
  };
}

function getDensityMatchingTask(): MatchingTask {
  return {
    terms: [
      { id: "density", label: "Тығыздық" },
      { id: "mass", label: "Масса" },
      { id: "volume", label: "Көлем" },
      { id: "density-formula", label: "ρ = m / V" },
    ],
    definitions: [
      {
        id: "def-density",
        label: "Заттың бірлік көлеміндегі массасын сипаттайтын физикалық шама.",
        correctTermId: "density",
      },
      {
        id: "def-mass",
        label: "Денедегі зат мөлшерін сипаттайтын физикалық шама.",
        correctTermId: "mass",
      },
      {
        id: "def-volume",
        label: "Дененің кеңістікте алатын орнын сипаттайтын шама.",
        correctTermId: "volume",
      },
      {
        id: "def-density-formula",
        label: "Тығыздықты табу үшін массаны көлемге бөлу керек екенін көрсетеді.",
        correctTermId: "density-formula",
      },
    ],
  };
}

function getSpeedMatchingTask(): MatchingTask {
  return {
    terms: [
      { id: "speed", label: "Жылдамдық" },
      { id: "distance", label: "Жол" },
      { id: "time", label: "Уақыт" },
      { id: "speed-formula", label: "v = s / t" },
    ],
    definitions: [
      {
        id: "def-speed",
        label: "Дененің уақыт бірлігінде қанша жол жүретінін көрсететін шама.",
        correctTermId: "speed",
      },
      {
        id: "def-distance",
        label: "Дененің қозғалыс кезінде жүріп өткен арақашықтығы.",
        correctTermId: "distance",
      },
      {
        id: "def-time",
        label: "Қозғалыстың қанша уақытқа созылғанын көрсететін шама.",
        correctTermId: "time",
      },
      {
        id: "def-speed-formula",
        label: "Жылдамдықты табу үшін жолды уақытқа бөлу керек екенін көрсетеді.",
        correctTermId: "speed-formula",
      },
    ],
  };
}

export function getMatchingTask(topic: PhysicsTopic, level: TopicLevel): MatchingTask {
  const slug = topic.slug.toLowerCase();

  if (slug.includes("ohms-law")) {
    return getOhmsLawMatchingTask();
  }

  if (slug.includes("density")) {
    return getDensityMatchingTask();
  }

  if (slug.includes("speed")) {
    return getSpeedMatchingTask();
  }

  return makeGenericMatchingTask(topic, level);
}

export function isMatchingStepCompleted(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  answers: Record<string, string>;
}) {
  const task = getMatchingTask(params.topic, params.level);

  return task.definitions.every((definition) => {
    const selectedTermId = params.answers[definition.id];
    return typeof selectedTermId === "string" && selectedTermId.length > 0;
  });
}

export function getMatchingCorrectCount(params: {
  topic: PhysicsTopic;
  level: TopicLevel;
  answers: Record<string, string>;
}) {
  const task = getMatchingTask(params.topic, params.level);

  return task.definitions.filter(
    (definition) => params.answers[definition.id] === definition.correctTermId
  ).length;
}