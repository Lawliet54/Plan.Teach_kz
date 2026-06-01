export type LabSlug =
  | "newton-second-law"
  | "hooke-law"
  | "archimedes-law"
  | "ohm-law"
  | "reflection-law";

export type LabDifficulty = "оңай" | "орта" | "күрделі";

export type LabDefinition = {
  slug: LabSlug;
  title: string;
  shortTitle: string;
  description: string;
  gradeLabels: string[];
  formula: string;
  difficulty: LabDifficulty;
  estimatedMinutes: number;
  iconName:
    | "FlaskConical"
    | "Rocket"
    | "Waves"
    | "Zap"
    | "Sun";
  learningGoals: string[];
  theorySummary: string;
};

export const labs: LabDefinition[] = [
  {
    slug: "newton-second-law",
    title: "Ньютонның екінші заңын зерттеу",
    shortTitle: "Ньютон II заңы",
    description:
      "Күш пен масса өзгергенде үдеу қалай өзгеретінін өлшеп, a = F / m тәуелділігін тексеріңіз.",
    gradeLabels: ["7-сынып", "8-сынып"],
    formula: "F = ma",
    difficulty: "орта",
    estimatedMinutes: 12,
    iconName: "Rocket",
    learningGoals: [
      "Күш, масса, үдеу арасындағы байланысты түсіндіру",
      "Өлшеу жүргізіп, a(F) графигін талдау",
      "Берілген формуланы тәжірибемен тексеру",
    ],
    theorySummary:
      "Ньютонның екінші заңы бойынша дененің үдеуі әсер етуші қорытқы күшке тура, массаға кері пропорционал: a = F / m. Бұл зертханада F және m мәндерін өзгертіп, үдеудің өзгерісін бақылайсыз.",
  },
  {
    slug: "hooke-law",
    title: "Гук заңын зерттеу",
    shortTitle: "Гук заңы",
    description:
      "Серіппенің ұзаруын өлшеп, күш пен ұзару арасындағы F = kx тәуелділігін тексеріңіз.",
    gradeLabels: ["7-сынып", "8-сынып"],
    formula: "F = kx",
    difficulty: "оңай",
    estimatedMinutes: 10,
    iconName: "Waves",
    learningGoals: [
      "Серіппе қатаңдығы ұғымын бекіту",
      "F(x) графигін құрып, сызықтық тәуелділікті көру",
      "Өлшеу кестесін дұрыс толтыру",
    ],
    theorySummary:
      "Кішкентай деформациялар үшін серіппедегі серпімділік күші ұзаруға тура пропорционал: F = kx. Бұл жерде F = mg, ал ұзару x = F / k арқылы есептеледі.",
  },
  {
    slug: "archimedes-law",
    title: "Архимед күшін зерттеу",
    shortTitle: "Архимед күші",
    description:
      "Сұйықтық түрі, көлем және бату деңгейіне қарай Архимед күшінің өзгерісін өлшеңіз.",
    gradeLabels: ["7-сынып", "8-сынып", "9-сынып"],
    formula: "Fₐ = ρgV",
    difficulty: "орта",
    estimatedMinutes: 12,
    iconName: "FlaskConical",
    learningGoals: [
      "Сұйықтық тығыздығының әсерін салыстыру",
      "Fₐ(V) тәуелділігін бақылау",
      "Бату деңгейін өзгертіп, заңдылықты түсіндіру",
    ],
    theorySummary:
      "Сұйыққа батырылған денеге жоғары бағытталған Архимед күші әсер етеді: Fₐ = ρgV. Мұндағы ρ — сұйықтық тығыздығы, V — батырылған бөліктің көлемі.",
  },
  {
    slug: "ohm-law",
    title: "Ом заңын зерттеу",
    shortTitle: "Ом заңы",
    description:
      "Кернеу мен кедергіні өзгертіп, ток күші I = U / R тәуелділігін өлшеңіз.",
    gradeLabels: ["8-сынып", "9-сынып"],
    formula: "I = U / R",
    difficulty: "оңай",
    estimatedMinutes: 10,
    iconName: "Zap",
    learningGoals: [
      "U, R және I арасындағы байланысты бекіту",
      "I(U) графигін құрып, пропорционалдықты көру",
      "Өлшеу нәтижелерін салыстыру",
    ],
    theorySummary:
      "Ом заңы бойынша электр тізбегіндегі ток күші кернеуге тура, кедергіге кері пропорционал: I = U / R. Бұл зертханада виртуалды аспаптар арқылы мәндерді бақылайсыз.",
  },
  {
    slug: "reflection-law",
    title: "Жарықтың шағылу заңын зерттеу",
    shortTitle: "Шағылу заңы",
    description:
      "Түсу бұрышын өзгертіп, шағылу бұрышының α = β теңдігін тексеріңіз.",
    gradeLabels: ["7-сынып", "8-сынып"],
    formula: "α = β",
    difficulty: "оңай",
    estimatedMinutes: 8,
    iconName: "Sun",
    learningGoals: [
      "Нормаль, түсу және шағылу сәулелерін ажырату",
      "α және β бұрыштарының теңдігін дәлелдеу",
      "Бұрыш өлшеуін кестеге енгізу",
    ],
    theorySummary:
      "Жарық айнадан шағылғанда түсу бұрышы α мен шағылу бұрышы β бір-біріне тең болады (нормальға қатысты өлшенеді): α = β.",
  },
];

export function getLabDefinition(slug: string) {
  return labs.find((lab) => lab.slug === slug) ?? null;
}

