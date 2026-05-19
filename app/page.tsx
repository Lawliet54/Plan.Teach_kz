import {
  Activity,
  Atom,
  BarChart3,
  BrainCircuit,
  FlaskConical,
  GraduationCap,
  Route,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";

const features = [
  {
    title: "Міндетті диагностика",
    text: "Оқушы алғаш кіргенде 7–11 сынып бойынша физика деңгейін анықтайтын тест тапсырады.",
    icon: UserRoundCheck,
  },
  {
    title: "Адаптивті оқу",
    text: "Дұрыс жауап берсе — тапсырма күрделенеді, қателессе — түсіндіру және жеңіл ұқсас есеп беріледі.",
    icon: Route,
  },
  {
    title: "AI Tutor",
    text: "Әр тақырыпта оқушы деңгейіне сай қазақша түсіндіретін жасанды интеллект көмекшісі болады.",
    icon: BrainCircuit,
  },
  {
    title: "Виртуалды зертхана",
    text: "Ом заңы, магнит өрісі, линза секілді заңдарды график және модель арқылы зерттейді.",
    icon: FlaskConical,
  },
  {
    title: "Есеп анализаторы",
    text: "Формула, сан қою, өлшем бірлік және логика бойынша оқушы жауабын талдайды.",
    icon: Activity,
  },
  {
    title: "Мұғалім аналитикасы",
    text: "Мұғалім әр оқушының прогресін, әлсіз тақырыбын, тест және тапсырма нәтижесін көреді.",
    icon: BarChart3,
  },
];

const roles = [
  {
    title: "Оқушы",
    text: "Диагностикадан өтеді, жеке маршрутпен оқиды, AI Tutor қолданады, тапсырма орындайды.",
  },
  {
    title: "Мұғалім",
    text: "Өзіне тіркелген оқушыларды бақылайды, жұмыстарын тексереді, марапат бере алады.",
  },
  {
    title: "Админ",
    text: "Пайдаланушыларды, мұғалімдерді, контентті және жүйе аналитикасын басқарады.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <PublicHeader />

      <section className="compact-container grid gap-6 pb-10 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-12">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d7e3ff] bg-[#eef2ff] px-3 py-1 text-xs font-bold text-[#5b3ee4]">
            <Sparkles className="h-3.5 w-3.5" />
            Физикаға арналған интеллектуалды LMS
          </div>

          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Plan.Teach_kz — физиканы деңгейге сай үйрететін адаптивті платформа
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Платформа оқушының деңгейін анықтайды, жеке оқу маршрутын жасайды,
            AI арқылы түсіндіреді, зертхана арқылы тәжірибе жасатады және
            мұғалімге нақты аналитика береді.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button href="/register">Оқуды бастау</Button>
            <Button href="/login" variant="ghost">
              Аккаунтқа кіру
            </Button>
          </div>

          <div className="mt-6 grid max-w-xl grid-cols-3 gap-2">
            <div className="compact-card p-3">
              <p className="text-lg font-black text-slate-950">3</p>
              <p className="text-xs text-slate-500">деңгей</p>
            </div>

            <div className="compact-card p-3">
              <p className="text-lg font-black text-slate-950">5</p>
              <p className="text-xs text-slate-500">сынып диагностикасы</p>
            </div>

            <div className="compact-card p-3">
              <p className="text-lg font-black text-slate-950">AI</p>
              <p className="text-xs text-slate-500">жеке көмекші</p>
            </div>
          </div>
        </div>

        <div className="compact-card relative overflow-hidden p-4">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#5b3ee4]/10 blur-3xl" />
          <div className="absolute bottom-[-70px] left-[-70px] h-44 w-44 rounded-full bg-sky-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Оқушы маршруты
                </p>
                <h2 className="text-base font-black text-slate-950">
                  Физика негіздері
                </h2>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">
                68%
              </span>
            </div>

            <div className="space-y-2">
              {[
                ["Диагностика", "Аяқталды", "bg-emerald-400"],
                ["Қозғалыс", "Оқылып жатыр", "bg-sky-400"],
                ["Күш және қысым", "Келесі тақырып", "bg-[#5b3ee4]"],
                ["Жұмыс және қуат", "Жабық", "bg-slate-400"],
              ].map(([title, status, color]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-950">
                      {title}
                    </p>
                    <p className="text-xs text-slate-500">{status}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-[#d7e3ff] bg-[#eef2ff] p-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#5b3ee4]" />
                <p className="text-sm font-black text-slate-950">AI кеңес</p>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Сен формуланы жақсы түсінесің, бірақ есеп шығарғанда өлшем
                бірлікті жиі шатастырасың. Келесі тапсырмада бірліктерге назар
                аудар.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="compact-container py-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5b3ee4]">
              Мүмкіндіктер
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              LMS емес, адаптивті оқу жүйесі
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title}>
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl border border-[#d7e3ff] bg-[#eef2ff]">
                  <Icon className="h-4 w-4 text-[#5b3ee4]" />
                </div>

                <CardTitle>{item.title}</CardTitle>
                <CardText>{item.text}</CardText>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="roles" className="compact-container py-6">
        <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-xl border border-[#d7e3ff] bg-[#eef2ff]">
              <GraduationCap className="h-4 w-4 text-[#5b3ee4]" />
            </div>

            <CardTitle>Толық рөлдік жүйе</CardTitle>
            <CardText>
              Жоба басынан бастап оқушы, мұғалім және админ рөліне бөлінеді.
              Алдымен оқушы мен мұғалім бөлігін іске қосамыз, кейін админ панель
              қосылады.
            </CardText>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.title}>
                <CardTitle>{role.title}</CardTitle>
                <CardText>{role.text}</CardText>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="ai" className="compact-container pb-12 pt-6">
        <Card className="grid gap-4 md:grid-cols-[0.7fr_1.3fr] md:items-center">
          <div>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-[#d7e3ff] bg-[#eef2ff]">
              <Atom className="h-5 w-5 text-[#5b3ee4]" />
            </div>

            <CardTitle className="text-lg">
              AI Tutor әр оқушыға жеке бейімделеді
            </CardTitle>

            <CardText>
              Жүйе оқушының диагностикасын, деңгейін, әлсіз тақырыптарын,
              қызығушылығын және чат тарихын ескеріп жауап береді.
            </CardText>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-bold text-slate-500">
              Мысал жауап
            </p>

            <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600 sm:text-sm">
              Ленц ережесінде индукциялық ток әрқашан өзін тудырған өзгеріске
              қарсы бағытталады. Қарапайым айтқанда, жүйе өзгеріске “қарсы
              жауап” береді. Бұл энергияның сақталу заңымен байланысты.
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}