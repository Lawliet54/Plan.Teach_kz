import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskPack = {
  id: string;
  grade: number;
  title: string;
  slug: string;
  section_title: string;
  description: string;
  formula: string | null;
  difficulty: "basic" | "intermediate" | "advanced";
  order_index: number;
  estimated_minutes: number;
  is_active: boolean;
  source?: "database" | "fallback";
};

export type TaskPackItem = {
  id: string;
  pack_id: string;
  kind: "test" | "calculation" | "lab";
  order_index: number;
  title: string;
  prompt: string;
  instruction: string | null;
  answer_type: "single_choice" | "number" | "text" | "manual_review";
  options: { id: string; text: string }[];
  explanation: string | null;
  skill_codes: string[];
  max_score: number;
  is_active: boolean;
};

export type TaskPackAttempt = {
  id: string;
  student_id: string;
  pack_id: string;
  item_id: string;
  submitted_answer: unknown;
  is_correct: boolean | null;
  score: number | null;
  max_score: number;
  review_status: "auto_checked" | "pending_review" | "reviewed";
  feedback: string | null;
  teacher_score?: number | null;
  teacher_feedback?: string | null;
  created_at: string;
};

type TopicDefinition = [title: string, formula: string, slug: string];

const gradeTopics: Record<number, TopicDefinition[]> = {
  7: [
    ["Физикалық шамалар және өлшеу", "SI жүйесі", "g7-measurement"],
    ["Тығыздықты зерттеу", "ρ = m / V", "g7-density"],
    ["Қысым және күш", "p = F / S", "g7-pressure"],
    ["Архимед күші", "Fₐ = ρgV", "g7-archimedes"],
    ["Механикалық жұмыс", "A = Fs", "g7-work"],
    ["Энергияның сақталуы", "E = const", "g7-energy"],
    ["Иіндік және тепе-теңдік", "M = Fl", "g7-lever"],
    ["Серпімділік және Гук заңы", "F = kx", "g7-hooke"],
    ["Қозғалыс графиктері", "v = s/t", "g7-motion-graphs"],
    ["7-сынып интеграциялық зерттеу", "Зерттеу циклі", "g7-capstone"],
  ],
  8: [
    ["Жылу мөлшері", "Q = cmΔT", "g8-heat"],
    ["Агрегаттық күйлер", "Q = λm", "g8-phase"],
    ["Электр тогы", "I = q/t", "g8-current"],
    ["Ом заңы", "I = U/R", "g8-ohm"],
    ["Тізбектерді жалғау", "R = R₁ + R₂", "g8-circuits"],
    ["Электр жұмысы және қуат", "P = UI", "g8-power"],
    ["Тұрақты магниттер", "B өрісі", "g8-magnets"],
    ["Жарықтың шағылуы", "α = β", "g8-reflection"],
    ["Линзалар", "1/F = 1/d + 1/f", "g8-lenses"],
    ["8-сынып инженерлік зерттеу", "STEM жоба", "g8-capstone"],
  ],
  9: [
    ["Түзусызықты қозғалыс", "s = v₀t + at²/2", "g9-kinematics"],
    ["Ньютон заңдары", "F = ma", "g9-newton"],
    ["Гравитация", "F = Gm₁m₂/r²", "g9-gravity"],
    ["Импульстің сақталуы", "p = mv", "g9-momentum"],
    ["Тербелістер", "T = 1/f", "g9-oscillation"],
    ["Толқындар", "v = λf", "g9-waves"],
    ["Дыбыс", "v = λf", "g9-sound"],
    ["Электромагниттік индукция", "ε = -ΔΦ/Δt", "g9-induction"],
    ["Атом құрылысы", "E = hν", "g9-atom"],
    ["9-сынып зерттеу жобасы", "Зерттеу есебі", "g9-capstone"],
  ],
  10: [
    ["Молекулалық-кинетикалық теория", "p = nkT", "g10-mkt"],
    ["Идеал газ", "pV = νRT", "g10-gas"],
    ["Термодинамиканың бірінші заңы", "Q = ΔU + A", "g10-thermo"],
    ["Электр өрісі", "E = F/q", "g10-field"],
    ["Кулон заңы", "F = kq₁q₂/r²", "g10-coulomb"],
    ["Конденсаторлар", "C = q/U", "g10-capacitor"],
    ["Тұрақты ток заңдары", "I = ε/(R+r)", "g10-dc"],
    ["Магнит өрісіндегі күштер", "F = BIl sinα", "g10-magnetic-force"],
    ["Электромагниттік индукция", "ε = -ΔΦ/Δt", "g10-induction"],
    ["10-сынып ғылыми зерттеу", "Ғылыми әдіс", "g10-capstone"],
  ],
  11: [
    ["Гармониялық тербелістер", "x = A cos(ωt)", "g11-oscillation"],
    ["Айнымалы ток", "I = Iₘ sin(ωt)", "g11-ac"],
    ["Трансформатор", "U₁/U₂ = N₁/N₂", "g11-transformer"],
    ["Электромагниттік толқындар", "c = λf", "g11-em-wave"],
    ["Интерференция", "d sinφ = kλ", "g11-interference"],
    ["Дифракция", "d sinφ = kλ", "g11-diffraction"],
    ["Фотоэффект", "hν = A + Eₖ", "g11-photoeffect"],
    ["Атом спектрлері", "ΔE = hν", "g11-spectrum"],
    ["Ядролық физика", "N = N₀·2^(-t/T)", "g11-nuclear"],
    ["11-сынып зерттеу жобасы", "Ғылыми жоба", "g11-capstone"],
  ],
};

const fallbackTestDefinitions = [
  {
    title: "Модельді таңдау",
    prompt: "моделін қолданар алдында қандай тексеріс бірінші орындалуы керек?",
    options: [
      "Тек формуланы жатқа жазу",
      "Шамалардың физикалық мағынасын, SI бірлігін және модельдің қолданылу шартын тексеру",
      "Бір ғана кездейсоқ өлшеуді пайдалану",
      "График құрмай нәтижені дөңгелектеу",
    ],
  },
  {
    title: "Графикті дәлелмен талдау",
    prompt: "бойынша тәжірибеде график нүктелері теориялық сызықтан аздап ауытқыды. Ең ғылыми әрекетті таңдаңыз.",
    options: [
      "Ауытқуды жасырып, тек теориялық сызықты қалдыру",
      "Бір нүктені өшіріп, қалғанын есептемеу",
      "Өлшеуді қайталап, қателікті бағалап, ауытқудың себебін түсіндіру",
      "Формула жарамсыз деп бірден қорытынды жасау",
    ],
  },
  {
    title: "Бақыланатын параметр",
    prompt: "заңындағы бір шаманың әсерін жеке анықтау үшін эксперимент қалай ұйымдастырылады?",
    options: [
      "Бір параметрді өзгертіп, қалған маңызды параметрлерді тұрақты ұстау",
      "Барлық параметрді бір уақытта өзгерту",
      "Тек соңғы өлшеуді сақтау",
      "Өлшеусіз теориялық тұжырым жазу",
    ],
  },
  {
    title: "SI жүйесін тексеру",
    prompt: "есебінде жасырын өлшем бірлігі қатесін болдырмайтын дұрыс тәсілді таңдаңыз.",
    options: [
      "Сандарды бірден калькуляторға енгізу",
      "Жауап шыққаннан кейін ғана бірліктерді қосу",
      "Тек үлкен сандарды SI жүйесіне ауыстыру",
      "Берілгендерді жазып, әр шаманы SI жүйесіне түрлендіріп, содан кейін формуланы қолдану",
    ],
  },
  {
    title: "Эксперимент дәлелі",
    prompt: "заңын тәжірибемен растауға қай дерек ең сенімді дәлел болады?",
    options: [
      "Бір рет алынған кез келген сан",
      "Кемінде үш өлшеуден алынған кесте, сәйкес график және модельмен салыстырылған қорытынды",
      "Тек формуланың атауы",
      "Өлшем бірлігі көрсетілмеген нәтиже",
    ],
  },
  {
    title: "Қате нәтижені диагностикалау",
    prompt: "есебінің жауабы күтілген шамадан 1000 есе артық шықты. Тексеруді неден бастаған дұрыс?",
    options: [
      "Формуланың түсін өзгерту",
      "График атауын өшіру",
      "SI түрлендіруін және 10, 100, 1000 коэффициенттерін қайта тексеру",
      "Қатені елемей жауапты дөңгелектеу",
    ],
  },
  {
    title: "Тәуелділікті анықтау",
    prompt: "бойынша тәуелділікті анықтау үшін графикпен жұмыс істеудің дұрыс ретін таңдаңыз.",
    options: [
      "Осьтерді бірлікпен белгілеу, бірнеше нүкте енгізу, трендті талдау және формуламен салыстыру",
      "Осьтерді атамай екі нүктені қосу",
      "Тек ең үлкен нүктені көрсету",
      "График орнына формуланы қайта көшіру",
    ],
  },
  {
    title: "Модель шекарасы",
    prompt: "моделін кез келген жағдайда тікелей қолдануға болмайды. Неге?",
    options: [
      "Барлық заң тек бір ғана санға арналған",
      "Өлшем бірлігі физикада маңызды емес",
      "Кез келген формула тек графиксіз жұмыс істейді",
      "Әр модель нақты шарттар мен жуықтауларға сүйенеді; олар бұзылса нәтижені қайта бағалау керек",
    ],
  },
  {
    title: "Зерттеу жоспары",
    prompt: "бойынша қысқа зерттеу жүргізу үшін қандай өлшеу жоспары жеткілікті дәлел береді?",
    options: [
      "Бір өлшеу және дайын жауап",
      "Кемінде үш түрлі параметр мәні, өлшеу кестесі, график және қателік туралы қысқа түсіндірме",
      "Тек формула жазылған парақ",
      "Бір параметрді өлшем бірлігінсіз көрсету",
    ],
  },
  {
    title: "Ғылыми қорытынды",
    prompt: "бойынша ғылыми қорытынды қандай түрде жазылуы керек?",
    options: [
      "Тек соңғы санды жазу",
      "Нәтижені дәлелсіз дұрыс деп атау",
      "Дерекке сүйеніп заңдылықты сипаттау, модельмен салыстыру және ауытқудың ықтимал себебін көрсету",
      "Графикті түсіндірмей көшіру",
    ],
  },
] as const;

const calculationDefinitions = [
  ["Тура есеп және SI жүйесі", "моделіндегі шамаларды физикалық мағынасына сай атаңыз, үш реалистік SI мәнін таңдаңыз және белгісіз шаманы толық шешу жолымен есептеңіз."],
  ["Кері есеп және формуланы түрлендіру", "формуласындағы нәтиже алдын ала берілді деп алып, қажетті параметрдің мәнін шығарыңыз. Формуланы түрлендіру қадамын бөлек көрсетіңіз."],
  ["Қате шешімді диагностикалау", "бойынша оқушы SI түрлендіруінде бір коэффициентті қате қолданды деп есептеңіз. Қате жауаптың қалай өзгеретінін сандық мысалмен дәлелдеңіз."],
  ["Кесте мен график арқылы талдау", "бойынша кемінде төрт мәннен тұратын деректер кестесін құрып, осьтерді бірлікпен белгілеңіз және график көлбеулігінің физикалық мағынасын түсіндіріңіз."],
  ["Инженерлік параметрді таңдау", "моделін қолданып, берілген нәтижеге жету үшін қай параметрді өзгерту тиімді екенін есеппен және қысқа негіздемемен көрсетіңіз."],
] as const;

function fallbackPacks(): TaskPack[] {
  return Object.entries(gradeTopics).flatMap(([grade, topics]) =>
    topics.map(([title, formula, slug], index) => ({
      id: `fallback-${slug}`,
      grade: Number(grade),
      title,
      slug,
      section_title: index === 9 ? "Қорытынды жоба" : "Физика бөлімі",
      description: `${title} бойынша 10 тест, 5 есеп және 1 зертханалық/практикалық жұмыс.`,
      formula,
      difficulty: index < 2 ? "basic" : index < 7 ? "intermediate" : "advanced",
      order_index: index + 1,
      estimated_minutes: index === 9 ? 75 : 55,
      is_active: true,
      source: "fallback",
    }))
  );
}

function fallbackItems(pack: TaskPack): TaskPackItem[] {
  const tests: TaskPackItem[] = fallbackTestDefinitions.map((definition, index) => ({
    id: `${pack.id}-test-${index + 1}`,
    pack_id: pack.id,
    kind: "test",
    order_index: index + 1,
    title: definition.title,
    prompt: `${pack.title}: ${pack.formula ?? "негізгі физикалық заң"} ${definition.prompt}`,
    instruction: "Бір дұрыс жауапты таңдаңыз. Жауап формула жаттауды емес, физикалық пайымдауды тексереді.",
    answer_type: "single_choice",
    options: definition.options.map((text, optionIndex) => ({ id: String.fromCharCode(97 + optionIndex), text })),
    explanation: "Физикалық модельді қолдануда формула, SI жүйесі, бақыланатын параметр және дерекке сүйенген қорытынды бірге қарастырылады.",
    skill_codes: ["concept_understanding", "formula_application", "reasoning"],
    max_score: 1,
    is_active: true,
  }));

  const calculations: TaskPackItem[] = calculationDefinitions.map(([title, task], index) => ({
    id: `${pack.id}-calc-${index + 1}`,
    pack_id: pack.id,
    kind: "calculation",
    order_index: 11 + index,
    title,
    prompt: `${pack.title}: ${pack.formula ?? "негізгі физикалық заң"} ${task}`,
    instruction: "Формула, берілгендер, SI түрлендіруі, аралық есептеулер және қорытынды міндетті. Жұмысты мұғалім тексереді.",
    answer_type: "text",
    options: [],
    explanation: "Ашық есепте тек соңғы сан емес, модельді таңдау, түрлендіру, дәлел және қорытынды бағаланады.",
    skill_codes: ["formula_application", "unit_conversion", "calculation", "reasoning"],
    max_score: 3,
    is_active: true,
  }));

  return [
    ...tests,
    ...calculations,
    {
      id: `${pack.id}-lab`,
      pack_id: pack.id,
      kind: "lab",
      order_index: 16,
      title: "Зертханалық / практикалық зерттеу",
      prompt: `${pack.title} бойынша виртуалды немесе қолжетімді құралдармен зерттеу жүргізіңіз. Бір тәуелсіз параметрді кемінде үш рет өзгертіңіз, қалған маңызды параметрлерді тұрақты ұстаңыз, өлшеу кестесін жасаңыз, графикті сипаттаңыз, қателік көзін атаңыз және дерекке сүйенген қорытынды жазыңыз.`,
      instruction: "Төмендегі 2D зертханаға өтуге болады. Жауапта құралдар, параметрлер, кемінде 3 өлшеу, график сипаттамасы, қателік көзі және қорытынды болуы керек.",
      answer_type: "manual_review",
      options: [],
      explanation: "Жұмыс мұғалім тексеруіне жіберіледі.",
      skill_codes: ["experiment_setup", "measurement", "graph_analysis", "data_analysis", "conclusion"],
      max_score: 10,
      is_active: true,
    },
  ];
}

export async function getTaskPacks(grade?: number) {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("task_packs").select("*").eq("is_active", true).order("grade").order("order_index");
  if (grade) query = query.eq("grade", grade);
  const { data, error } = await query;
  if (!error && data?.length) return (data as TaskPack[]).map((pack) => ({ ...pack, source: "database" as const }));
  return fallbackPacks().filter((pack) => !grade || pack.grade === grade);
}

export async function getTaskPackBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("task_packs").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (!error && data) return { ...data, source: "database" as const } as TaskPack;
  return fallbackPacks().find((pack) => pack.slug === slug) ?? null;
}

export async function getTaskPackItems(pack: TaskPack) {
  if (pack.source === "fallback") return fallbackItems(pack);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("task_pack_items_public").select("*").eq("pack_id", pack.id).order("order_index");
  if (error || !data?.length) return fallbackItems(pack);
  return data as TaskPackItem[];
}

export async function getStudentPackAttempts(studentId: string, packId?: string) {
  if (packId?.startsWith("fallback-")) return [] as TaskPackAttempt[];
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("task_pack_attempts").select("*").eq("student_id", studentId).order("created_at", { ascending: false });
  if (packId) query = query.eq("pack_id", packId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as TaskPackAttempt[];
}
