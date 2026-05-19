export type PhysicsInterest = {
  key: string;
  title: string;
  category: string;
  description: string;
};

export const physicsInterests: PhysicsInterest[] = [
  {
    key: "mechanics",
    title: "Механика",
    category: "Негізгі физика",
    description: "Қозғалыс, күш, қысым, жұмыс, қуат және энергия.",
  },
  {
    key: "measurements",
    title: "Өлшеулер және тәжірибе",
    category: "Зерттеу дағдысы",
    description: "Физикалық шамалар, өлшеу дәлдігі, кесте және қорытынды.",
  },
  {
    key: "heat",
    title: "Жылу құбылыстары",
    category: "8-сынып бағыты",
    description: "Температура, жылу мөлшері, ішкі энергия және жылу берілу.",
  },
  {
    key: "electricity",
    title: "Электр құбылыстары",
    category: "Электродинамика",
    description: "Электр тогы, Ом заңы, кернеу, кедергі және электр қуаты.",
  },
  {
    key: "magnetism",
    title: "Магнит өрісі",
    category: "Электромагнетизм",
    description: "Магнит өрісі, Ампер күші, Лоренц күші және индукция.",
  },
  {
    key: "optics",
    title: "Оптика",
    category: "Жарық құбылыстары",
    description: "Жарықтың шағылуы, сынуы, линза және оптикалық аспаптар.",
  },
  {
    key: "waves",
    title: "Тербелістер мен толқындар",
    category: "9–11 сынып бағыты",
    description: "Период, жиілік, толқын ұзындығы, дыбыс және резонанс.",
  },
  {
    key: "astronomy",
    title: "Астрономия",
    category: "Ғарыш",
    description: "Күн жүйесі, аспан денелері, жұлдыздар және космология.",
  },
  {
    key: "atomic",
    title: "Атомдық физика",
    category: "Жоғары деңгей",
    description: "Фотоэффект, радиоактивтілік, атом ядросы және кванттық ұғымдар.",
  },
  {
    key: "problem_solving",
    title: "Есеп шығару",
    category: "Дағды",
    description: "Формула қолдану, өлшем бірлік, сандық және графиктік есептер.",
  },
];