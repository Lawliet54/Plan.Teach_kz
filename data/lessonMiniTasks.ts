import {
  physicsTopics,
  type Grade,
} from "@/data/physicsTopics";

export type LessonMiniTaskType =
  | "single-choice"
  | "multiple-choice"
  | "matching";

export type LessonMiniTaskOption = {
  id: string;
  text: string;
};

export type LessonMiniTaskMatchingItem = {
  id: string;
  text: string;
};

export type LessonMiniTaskMatchingPair = {
  leftId: string;
  rightId: string;
};

type LessonMiniTaskBase = {
  id: string;
  grade: Grade;
  topicSlug: string;
  title: string;
  instruction: string;
  successMessage: string;
  errorMessage: string;
};

export type SingleChoiceLessonMiniTask = LessonMiniTaskBase & {
  type: "single-choice";
  question: string;
  options: LessonMiniTaskOption[];
  correctOptionId: string;
};

export type MultipleChoiceLessonMiniTask = LessonMiniTaskBase & {
  type: "multiple-choice";
  question: string;
  options: LessonMiniTaskOption[];
  correctOptionIds: string[];
};

export type MatchingLessonMiniTask = LessonMiniTaskBase & {
  type: "matching";
  leftItems: LessonMiniTaskMatchingItem[];
  rightItems: LessonMiniTaskMatchingItem[];
  correctPairs: LessonMiniTaskMatchingPair[];
};

export type LessonMiniTask =
  | SingleChoiceLessonMiniTask
  | MultipleChoiceLessonMiniTask
  | MatchingLessonMiniTask;

const commonMessages = {
  successMessage: "Дұрыс! Келесі тақырыпқа өтуге болады.",
  errorMessage: "Қате. Қайта ойланып, тапсырманы қайта орындаңыз.",
};

export const lessonMiniTasks = [
  // =========================================================
  // 7-СЫНЫП
  // =========================================================

  {
    ...commonMessages,
    id: "mini-g7-physical-quantities",
    grade: 7,
    topicSlug: "physical-quantities",
    type: "matching",
    title: "Өлшеу құралдарын сәйкестендіру",
    instruction:
      "Физикалық шамаларды оларды өлшейтін құралдармен сәйкестендіріңіз.",
    leftItems: [
      { id: "length", text: "Ұзындық" },
      { id: "mass", text: "Масса" },
      { id: "time", text: "Уақыт" },
      { id: "volume", text: "Сұйық көлемі" },
    ],
    rightItems: [
      { id: "ruler", text: "Сызғыш" },
      { id: "balance", text: "Таразы" },
      { id: "stopwatch", text: "Секундомер" },
      { id: "cylinder", text: "Мензурка" },
    ],
    correctPairs: [
      { leftId: "length", rightId: "ruler" },
      { leftId: "mass", rightId: "balance" },
      { leftId: "time", rightId: "stopwatch" },
      { leftId: "volume", rightId: "cylinder" },
    ],
  },

  {
    ...commonMessages,
    id: "mini-g7-density",
    grade: 7,
    topicSlug: "density",
    type: "single-choice",
    title: "Тығыздық формуласын анықтау",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question: "Заттың тығыздығын қандай формула арқылы анықтаймыз?",
    options: [
      { id: "a", text: "ρ = m / V" },
      { id: "b", text: "ρ = V / m" },
      { id: "c", text: "ρ = m · V" },
      { id: "d", text: "ρ = m + V" },
    ],
    correctOptionId: "a",
  },

  {
    ...commonMessages,
    id: "mini-g7-speed",
    grade: 7,
    topicSlug: "speed",
    type: "single-choice",
    title: "Жылдамдықты есептеу",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question:
      "Дене 100 метр жолды 20 секундта жүріп өтті. Оның жылдамдығы қандай?",
    options: [
      { id: "a", text: "2 м/с" },
      { id: "b", text: "5 м/с" },
      { id: "c", text: "20 м/с" },
      { id: "d", text: "120 м/с" },
    ],
    correctOptionId: "b",
  },

  {
    ...commonMessages,
    id: "mini-g7-force",
    grade: 7,
    topicSlug: "force",
    type: "multiple-choice",
    title: "Күштің әсерін анықтау",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Күш денеге қандай әсер етуі мүмкін?",
    options: [
      { id: "a", text: "Дененің жылдамдығын өзгертуі мүмкін" },
      { id: "b", text: "Қозғалыс бағытын өзгертуі мүмкін" },
      { id: "c", text: "Дененің пішінін өзгертуі мүмкін" },
      { id: "d", text: "Дененің массасын автоматты түрде арттырады" },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  {
    ...commonMessages,
    id: "mini-g7-pressure",
    grade: 7,
    topicSlug: "pressure",
    type: "single-choice",
    title: "Қысым формуласын таңдау",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question: "Қысым күш пен аудан арқылы қалай есептеледі?",
    options: [
      { id: "a", text: "p = F / S" },
      { id: "b", text: "p = S / F" },
      { id: "c", text: "p = F · S" },
      { id: "d", text: "p = F + S" },
    ],
    correctOptionId: "a",
  },

  // =========================================================
  // 8-СЫНЫП
  // =========================================================

  {
    ...commonMessages,
    id: "mini-g8-thermal-motion",
    grade: 8,
    topicSlug: "thermal-motion",
    type: "multiple-choice",
    title: "Жылулық қозғалысты сипаттау",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Жылулық қозғалысқа қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      { id: "a", text: "Молекулалар үздіксіз қозғалып тұрады" },
      {
        id: "b",
        text: "Температура артқанда молекулалардың қозғалысы күшейеді",
      },
      {
        id: "c",
        text: "Диффузия молекулалардың қозғалысын дәлелдейді",
      },
      {
        id: "d",
        text: "Бөлме температурасында молекулалар толығымен тоқтайды",
      },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  {
    ...commonMessages,
    id: "mini-g8-heat-quantity",
    grade: 8,
    topicSlug: "heat-quantity",
    type: "single-choice",
    title: "Жылу мөлшерін есептеу",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question:
      "Денені қыздыруға қажетті жылу мөлшерін қандай формуламен есептейміз?",
    options: [
      { id: "a", text: "Q = cmΔT" },
      { id: "b", text: "Q = m / V" },
      { id: "c", text: "Q = UI" },
      { id: "d", text: "Q = F / S" },
    ],
    correctOptionId: "a",
  },

  {
    ...commonMessages,
    id: "mini-g8-electric-current",
    grade: 8,
    topicSlug: "electric-current",
    type: "multiple-choice",
    title: "Электр тогының пайда болу шарттары",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Электр тогы пайда болуы үшін қандай шарттар қажет?",
    options: [
      { id: "a", text: "Еркін зарядталған бөлшектер болуы керек" },
      { id: "b", text: "Электр өрісі болуы керек" },
      { id: "c", text: "Электр тізбегі тұйық болуы керек" },
      { id: "d", text: "Тек магнит болуы жеткілікті" },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  {
    ...commonMessages,
    id: "mini-g8-ohms-law",
    grade: 8,
    topicSlug: "ohms-law",
    type: "matching",
    title: "Ом заңының шамаларын сәйкестендіру",
    instruction:
      "Физикалық шамаларды олардың белгіленуімен және мағынасымен сәйкестендіріңіз.",
    leftItems: [
      { id: "current", text: "Ток күші" },
      { id: "voltage", text: "Кернеу" },
      { id: "resistance", text: "Кедергі" },
      { id: "formula", text: "Ом заңы" },
    ],
    rightItems: [
      { id: "i", text: "I, ампермен өлшенеді" },
      { id: "u", text: "U, вольтпен өлшенеді" },
      { id: "r", text: "R, оммен өлшенеді" },
      { id: "ohm", text: "I = U / R" },
    ],
    correctPairs: [
      { leftId: "current", rightId: "i" },
      { leftId: "voltage", rightId: "u" },
      { leftId: "resistance", rightId: "r" },
      { leftId: "formula", rightId: "ohm" },
    ],
  },

  {
    ...commonMessages,
    id: "mini-g8-series-parallel",
    grade: 8,
    topicSlug: "series-parallel",
    type: "multiple-choice",
    title: "Электр тізбектерін салыстыру",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question:
      "Тізбектей және параллель жалғауға қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      {
        id: "a",
        text: "Тізбектей жалғауда барлық өткізгіш арқылы бірдей ток өтеді",
      },
      {
        id: "b",
        text: "Параллель жалғауда тармақтардағы кернеу бірдей болады",
      },
      {
        id: "c",
        text: "Тізбектей тізбектегі бір шам үзілсе, барлық шам өшуі мүмкін",
      },
      {
        id: "d",
        text: "Параллель жалғауда жалпы кедергі әрқашан кедергілердің қосындысына тең",
      },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  // =========================================================
  // 9-СЫНЫП
  // =========================================================

  {
    ...commonMessages,
    id: "mini-g9-newton-laws",
    grade: 9,
    topicSlug: "newton-laws",
    type: "matching",
    title: "Ньютон заңдарын сәйкестендіру",
    instruction: "Ньютон заңдарын олардың мағынасымен сәйкестендіріңіз.",
    leftItems: [
      { id: "first", text: "Ньютонның бірінші заңы" },
      { id: "second", text: "Ньютонның екінші заңы" },
      { id: "third", text: "Ньютонның үшінші заңы" },
    ],
    rightItems: [
      {
        id: "inertia",
        text: "Қорытқы күш болмаса, дене тыныштық немесе бірқалыпты қозғалыс күйін сақтайды",
      },
      {
        id: "fma",
        text: "Дененің үдеуі күшке тура, массаға кері пропорционал",
      },
      {
        id: "action",
        text: "Әрекетке әрқашан тең және қарама-қарсы қарсы әрекет бар",
      },
    ],
    correctPairs: [
      { leftId: "first", rightId: "inertia" },
      { leftId: "second", rightId: "fma" },
      { leftId: "third", rightId: "action" },
    ],
  },

  {
    ...commonMessages,
    id: "mini-g9-work-energy",
    grade: 9,
    topicSlug: "work-energy",
    type: "multiple-choice",
    title: "Жұмыс пен энергияны ажырату",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Механикалық жұмыс пен энергияға қатысты дұрыс жауаптарды таңдаңыз.",
    options: [
      {
        id: "a",
        text: "Күш әсерінен дене орын ауыстырса, механикалық жұмыс орындалады",
      },
      {
        id: "b",
        text: "Қозғалып тұрған дененің кинетикалық энергиясы болады",
      },
      {
        id: "c",
        text: "Биіктікте тұрған дененің потенциалдық энергиясы болуы мүмкін",
      },
      {
        id: "d",
        text: "Энергия ешқандай өзгеріссіз жоғалып кетеді",
      },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  {
    ...commonMessages,
    id: "mini-g9-momentum",
    grade: 9,
    topicSlug: "momentum",
    type: "single-choice",
    title: "Импульс формуласын анықтау",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question: "Дене импульсі қандай формуламен есептеледі?",
    options: [
      { id: "a", text: "p = mv" },
      { id: "b", text: "p = m / v" },
      { id: "c", text: "p = F / S" },
      { id: "d", text: "p = ρV" },
    ],
    correctOptionId: "a",
  },

  {
    ...commonMessages,
    id: "mini-g9-electric-field",
    grade: 9,
    topicSlug: "electric-field",
    type: "multiple-choice",
    title: "Электр өрісін сипаттау",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Электр өрісіне қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      { id: "a", text: "Электр өрісі зарядталған денелердің айналасында пайда болады" },
      { id: "b", text: "Электр өрісі басқа зарядтарға күшпен әсер етеді" },
      { id: "c", text: "Өріс күш сызықтары оң зарядтан теріс зарядқа қарай бағытталады" },
      { id: "d", text: "Электр өрісі тек магниттердің айналасында пайда болады" },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  {
    ...commonMessages,
    id: "mini-g9-magnetic-field",
    grade: 9,
    topicSlug: "magnetic-field",
    type: "matching",
    title: "Магнит өрісі ұғымдарын сәйкестендіру",
    instruction: "Ұғымдарды олардың түсіндірмелерімен сәйкестендіріңіз.",
    leftItems: [
      { id: "magnetic-field", text: "Магнит өрісі" },
      { id: "field-lines", text: "Магнит өрісінің сызықтары" },
      { id: "current", text: "Тогы бар өткізгіш" },
      { id: "ampere-force", text: "Ампер күші" },
    ],
    rightItems: [
      { id: "area", text: "Магниттік әсер байқалатын аймақ" },
      { id: "direction", text: "Өрістің бағытын көрсететін шартты сызықтар" },
      { id: "creates", text: "Өз айналасында магнит өрісін тудырады" },
      { id: "acts", text: "Магнит өрісіндегі тогы бар өткізгішке әсер етеді" },
    ],
    correctPairs: [
      { leftId: "magnetic-field", rightId: "area" },
      { leftId: "field-lines", rightId: "direction" },
      { leftId: "current", rightId: "creates" },
      { leftId: "ampere-force", rightId: "acts" },
    ],
  },

  // =========================================================
  // 10-СЫНЫП
  // =========================================================

  {
    ...commonMessages,
    id: "mini-g10-kinematics",
    grade: 10,
    topicSlug: "kinematics",
    type: "multiple-choice",
    title: "Қозғалысты сипаттайтын шамалар",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Кинематикаға қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      { id: "a", text: "Координата дененің орнын сипаттайды" },
      { id: "b", text: "Жылдамдық орын ауыстырудың өзгеру шапшаңдығын сипаттайды" },
      { id: "c", text: "Үдеу жылдамдықтың өзгеру шапшаңдығын сипаттайды" },
      { id: "d", text: "v-t графигінің астындағы аудан орын ауыстыруды береді" },
      { id: "e", text: "Кез келген қозғалыста үдеу міндетті түрде тұрақты болады" },
    ],
    correctOptionIds: ["a", "b", "c", "d"],
  },

  {
    ...commonMessages,
    id: "mini-g10-dynamics",
    grade: 10,
    topicSlug: "dynamics",
    type: "single-choice",
    title: "Қорытқы күшті есептеу",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question:
      "Массасы 4 кг дене 3 м/с² үдеумен қозғалады. Қорытқы күшті табыңыз.",
    options: [
      { id: "a", text: "0,75 Н" },
      { id: "b", text: "7 Н" },
      { id: "c", text: "12 Н" },
      { id: "d", text: "16 Н" },
    ],
    correctOptionId: "c",
  },

  {
    ...commonMessages,
    id: "mini-g10-molecular-physics",
    grade: 10,
    topicSlug: "molecular-physics",
    type: "matching",
    title: "Молекулалық физика ұғымдарын сәйкестендіру",
    instruction: "Ұғымдарды олардың мағынасымен сәйкестендіріңіз.",
    leftItems: [
      { id: "diffusion", text: "Диффузия" },
      { id: "temperature", text: "Температура" },
      { id: "pressure", text: "Газ қысымы" },
      { id: "brownian", text: "Броундық қозғалыс" },
    ],
    rightItems: [
      { id: "mixing", text: "Зат бөлшектерінің өздігінен араласуы" },
      { id: "motion", text: "Молекулалардың орташа қозғалыс энергиясымен байланысты шама" },
      { id: "collision", text: "Молекулалардың ыдыс қабырғасына соқтығысуынан пайда болады" },
      { id: "random", text: "Ұсақ бөлшектердің ретсіз қозғалысы" },
    ],
    correctPairs: [
      { leftId: "diffusion", rightId: "mixing" },
      { leftId: "temperature", rightId: "motion" },
      { leftId: "pressure", rightId: "collision" },
      { leftId: "brownian", rightId: "random" },
    ],
  },

  {
    ...commonMessages,
    id: "mini-g10-electrostatics",
    grade: 10,
    topicSlug: "electrostatics",
    type: "single-choice",
    title: "Кулон заңын таңдау",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question:
      "Екі нүктелік зарядтың өзара әсер күшін қандай формула сипаттайды?",
    options: [
      { id: "a", text: "F = k|q₁q₂| / r²" },
      { id: "b", text: "F = ma" },
      { id: "c", text: "F = pS" },
      { id: "d", text: "F = ρV" },
    ],
    correctOptionId: "a",
  },

  {
    ...commonMessages,
    id: "mini-g10-current-laws",
    grade: 10,
    topicSlug: "current-laws",
    type: "multiple-choice",
    title: "Толық тізбек заңдарын анықтау",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Ток көзі бар толық тізбекке қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      { id: "a", text: "Толық тізбек үшін Ом заңы: I = ε / (R + r)" },
      { id: "b", text: "Қысқыштардағы кернеу: U = ε - Ir" },
      {
        id: "c",
        text: "Ток артқанда ішкі кедергідегі кернеу түсуі артады",
      },
      {
        id: "d",
        text: "Ток күші сыртқы және ішкі кедергілерге тәуелсіз",
      },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  // =========================================================
  // 11-СЫНЫП
  // =========================================================

  {
    ...commonMessages,
    id: "mini-g11-electromagnetic-induction",
    grade: 11,
    topicSlug: "electromagnetic-induction",
    type: "single-choice",
    title: "Индукциялық токтың пайда болуы",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question: "Өткізгіш контурда индукциялық ток қашан пайда болады?",
    options: [
      {
        id: "a",
        text: "Контур арқылы өтетін магнит ағыны өзгерген кезде",
      },
      {
        id: "b",
        text: "Контур тыныш тұрған кезде және магнит өрісі өзгермегенде",
      },
      {
        id: "c",
        text: "Өткізгіштің массасы артқан кезде",
      },
      {
        id: "d",
        text: "Контурдың температурасы бөлме температурасымен тең болғанда",
      },
    ],
    correctOptionId: "a",
  },

  {
    ...commonMessages,
    id: "mini-g11-ac-current",
    grade: 11,
    topicSlug: "ac-current",
    type: "multiple-choice",
    title: "Айнымалы токтың қасиеттері",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Айнымалы токқа қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      {
        id: "a",
        text: "Айнымалы токтың бағыты мен шамасы периодты түрде өзгеруі мүмкін",
      },
      {
        id: "b",
        text: "Трансформатор айнымалы кернеуді өзгертуге қолданылады",
      },
      {
        id: "c",
        text: "Энергияны алысқа жеткізгенде кернеуді арттыру шығынды азайтады",
      },
      {
        id: "d",
        text: "Кәдімгі батарея тікелей айнымалы ток өндіреді",
      },
    ],
    correctOptionIds: ["a", "b", "c"],
  },

  {
    ...commonMessages,
    id: "mini-g11-optics",
    grade: 11,
    topicSlug: "optics",
    type: "matching",
    title: "Оптика ұғымдарын сәйкестендіру",
    instruction: "Ұғымдарды олардың анықтамаларымен сәйкестендіріңіз.",
    leftItems: [
      { id: "reflection", text: "Жарықтың шағылуы" },
      { id: "refraction", text: "Жарықтың сынуы" },
      { id: "lens", text: "Линза" },
      { id: "focus", text: "Фокус" },
    ],
    rightItems: [
      { id: "return", text: "Жарықтың орта шекарасынан кері қайтуы" },
      { id: "change", text: "Жарықтың бір ортадан екінші ортаға өткенде бағытын өзгертуі" },
      { id: "transparent", text: "Жарықты жинайтын немесе шашырататын мөлдір дене" },
      { id: "point", text: "Сәулелер жиналатын немесе олардың жалғасы қиылысатын нүкте" },
    ],
    correctPairs: [
      { leftId: "reflection", rightId: "return" },
      { leftId: "refraction", rightId: "change" },
      { leftId: "lens", rightId: "transparent" },
      { leftId: "focus", rightId: "point" },
    ],
  },

  {
    ...commonMessages,
    id: "mini-g11-photoeffect",
    grade: 11,
    topicSlug: "photoeffect",
    type: "single-choice",
    title: "Фотоэффект шартын анықтау",
    instruction: "Бір дұрыс жауапты таңдаңыз.",
    question: "Металдан электрон ұшып шығуы үшін қандай шарт орындалуы керек?",
    options: [
      {
        id: "a",
        text: "Фотон энергиясы металдың шығу жұмысынан кем болмауы керек",
      },
      {
        id: "b",
        text: "Жарық жиілігі әрқашан нөлге тең болуы керек",
      },
      {
        id: "c",
        text: "Металл міндетті түрде магнит болуы керек",
      },
      {
        id: "d",
        text: "Жарықтың түсі мен жиілігі ешқандай әсер етпейді",
      },
    ],
    correctOptionId: "a",
  },

  {
    ...commonMessages,
    id: "mini-g11-nuclear-physics",
    grade: 11,
    topicSlug: "nuclear-physics",
    type: "multiple-choice",
    title: "Атом ядросының құрылысын анықтау",
    instruction: "Бір немесе бірнеше дұрыс жауапты таңдаңыз.",
    question: "Ядролық физикаға қатысты дұрыс тұжырымдарды таңдаңыз.",
    options: [
      { id: "a", text: "Протонның электр заряды оң" },
      { id: "b", text: "Нейтронның электр заряды жоқ" },
      {
        id: "c",
        text: "Тұрақсыз ядролар радиоактивті ыдырауға ұшырауы мүмкін",
      },
      {
        id: "d",
        text: "Электрон атом ядросының негізгі құрамдас бөлігі",
      },
    ],
    correctOptionIds: ["a", "b", "c"],
  },
] satisfies LessonMiniTask[];

export function getLessonMiniTaskKey(grade: Grade, topicSlug: string) {
  return `${grade}:${topicSlug}`;
}

export function getLessonMiniTask(
  grade: Grade,
  topicSlug: string
): LessonMiniTask | null {
  return (
    lessonMiniTasks.find(
      (task) => task.grade === grade && task.topicSlug === topicSlug
    ) ?? null
  );
}

export function isLessonMiniTaskType(
  value: string
): value is LessonMiniTaskType {
  return (
    value === "single-choice" ||
    value === "multiple-choice" ||
    value === "matching"
  );
}

export function getMissingLessonMiniTaskTopics() {
  return physicsTopics.filter(
    (topic) => !getLessonMiniTask(topic.grade, topic.slug)
  );
}

export function getDuplicateLessonMiniTaskKeys() {
  const seenKeys = new Set<string>();
  const duplicateKeys = new Set<string>();

  lessonMiniTasks.forEach((task) => {
    const key = getLessonMiniTaskKey(task.grade, task.topicSlug);

    if (seenKeys.has(key)) {
      duplicateKeys.add(key);
    }

    seenKeys.add(key);
  });

  return Array.from(duplicateKeys);
}

export function hasCompleteLessonMiniTaskCoverage() {
  return (
    getMissingLessonMiniTaskTopics().length === 0 &&
    getDuplicateLessonMiniTaskKeys().length === 0
  );
}