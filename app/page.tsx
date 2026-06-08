import { ArrowRight, BarChart3, Bot, CheckCircle2, FlaskConical, Gauge, Sparkles } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PhysicsHero } from "@/components/visual/PhysicsHero";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const grades = [
  [7,"Физикалық шамалар, механика, қысым және энергия","Бастапқы зерттеу дағдылары"],
  [8,"Жылу, электр тогы, магнит өрісі және оптика","Формула мен экспериментті байланыстыру"],
  [9,"Кинематика, динамика, тербелістер және толқындар","Күрделі есептер мен графиктер"],
  [10,"Молекулалық физика, термодинамика және электростатика","Модельдеу және қолданбалы талдау"],
  [11,"Электромагниттік толқындар, оптика және кванттық физика","Жоғары деңгейлі зерттеу тапсырмалары"],
];
const capabilities = [
  [Gauge,"Skill mastery","Жүйе жалпы пайызбен шектелмейді. Әр дағдыны жеке талдап, келесі тапсырманы нақты әлсіз тұсқа қарай береді."],
  [FlaskConical,"2D зертханалар","Оқушы параметрді өзгертеді, өлшейді, кесте мен график құрады және қорытындыны сақтайды."],
  [Bot,"AI көмекші","Дайын жауапты бірден айтпайды. Қатені анықтап, деңгейге сай жетелеуші түсіндірме береді."],
  [BarChart3,"Кинематографиялық аналитика","Оқушы мен мұғалім прогресті, әлсіз дағдыларды және әрекеттер тарихын бір экраннан көреді."],
];
const flow = [
  ["01","Диагностика","Бастапқы деңгей мен әлсіз дағдылар анықталады."],
  ["02","Жеке маршрут","Теория, есеп және зертхана деңгейге сәйкес ашылады."],
  ["03","Нақты тексеру","Әр жауап skill mastery көрсеткішін жаңартады."],
  ["04","Қайталау жүйесі","Әлсіз дағды remediation және review queue арқылы бекітіледі."],
];
export default function HomePage() {
  return <main className="min-h-screen bg-[var(--app-bg)]">
    <PublicHeader />
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-white">
      <div className="absolute inset-0 physics-grid opacity-70" />
      <div className="compact-container relative grid gap-7 py-8 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:py-12">
        <div>
          <Badge variant="primary" className="gap-1.5 px-2.5 py-1"><Sparkles className="h-3.5 w-3.5" /> Физикаға арналған адаптивті жүйе</Badge>
          <h1 className="mt-4 max-w-3xl text-[34px] font-black leading-[1.08] tracking-[-.055em] text-[var(--text)] sm:text-5xl lg:text-[58px]">Физиканы жаттамай, <span className="text-[var(--primary)]">зерттеу</span> арқылы меңгер.</h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[var(--text-muted)] sm:text-base">Plan.Teach_kz — 7–11 сыныптарға арналған интеллектуалды оқу платформасы. Теория, күрделі есеп, интерактивті тәжірибе және аналитика бір оқу ағынында жұмыс істейді.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Button href="/register" size="lg">Оқуды бастау <ArrowRight className="h-4 w-4" /></Button><Button href="/login" variant="ghost" size="lg">Аккаунтқа кіру</Button></div>
          <div className="mt-6 grid max-w-2xl gap-2 sm:grid-cols-3">{["Қазақ тіліндегі интерфейс","7–11 сынып бағдарламасы","Мұғалім бақылауы"].map((item)=><div key={item} className="flex items-center gap-2 border-l-2 border-[var(--primary)] bg-white/70 px-2 py-1.5 text-xs font-extrabold text-[var(--text-soft)]"><CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />{item}</div>)}</div>
        </div>
        <PhysicsHero />
      </div>
    </section>

    <section id="grades" className="compact-container py-9">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="data-label text-[var(--primary)]">Сыныптар</p><h2 className="mt-1 text-2xl font-black tracking-[-.035em] text-[var(--text)]">7–11 сынып физикасы</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Әр сыныпта теория, есептер, тесттер және зертханалық тәжірибелер бірізді күрделенеді.</p></div><Badge variant="cyan">5 оқу деңгейі</Badge></div>
      <div className="mt-4 grid gap-2 lg:grid-cols-5">{grades.map(([grade,description,focus],index)=><Card key={String(grade)} className="group relative overflow-hidden p-3 transition hover:-translate-y-1 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-hover)]"><span className="absolute right-2 top-1 text-5xl font-black text-[#eef1f6] transition group-hover:text-[#ebe9ff]">{String(grade)}</span><div className="relative"><p className="data-label">{String(index+1).padStart(2,"0")} / 05</p><h3 className="mt-5 text-lg font-black text-[var(--text)]">{String(grade)}-сынып</h3><p className="mt-2 text-xs font-medium leading-5 text-[var(--text-muted)]">{String(description)}</p><p className="mt-3 border-t border-[var(--border-soft)] pt-2 text-[11px] font-extrabold leading-4 text-[var(--primary)]">{String(focus)}</p></div></Card>)}</div>
    </section>

    <section id="platform" className="border-y border-[var(--border)] bg-white">
      <div className="compact-container py-9"><p className="data-label text-[var(--primary)]">Платформа мүмкіндіктері</p><h2 className="mt-1 text-2xl font-black tracking-[-.035em] text-[var(--text)]">Жай LMS емес. Нақты оқу қозғалтқышы.</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{capabilities.map(([Icon,title,text])=><article key={String(title)} className="science-panel rounded-[6px] p-4"><div className="relative flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] bg-[var(--purple-soft)] text-[var(--primary)]"><Icon className="h-4.5 w-4.5" /></span><div><h3 className="text-sm font-black text-[var(--text)]">{String(title)}</h3><p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">{String(text)}</p></div></div></article>)}</div></div>
    </section>

    <section id="workflow" className="compact-container py-9"><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><div><p className="data-label text-[var(--primary)]">Adaptive workflow</p><h2 className="mt-1 text-2xl font-black tracking-[-.035em] text-[var(--text)]">Оқушының әр әрекеті келесі қадамды өзгертеді.</h2><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Жүйе қате жауапты жай ғана белгілемейді. Қатенің қай дағдыға байланысты екенін анықтап, сол skill бойынша түсіндіру мен тәжірибе ұсынады.</p></div><div className="grid gap-2 sm:grid-cols-2">{flow.map(([n,title,text])=><div key={n} className="rounded-[5px] border border-[var(--border)] bg-white p-3"><p className="text-[11px] font-black tracking-[.14em] text-[var(--primary)]">{n}</p><h3 className="mt-3 text-sm font-black text-[var(--text)]">{title}</h3><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{text}</p></div>)}</div></div></section>

    <section className="border-t border-[var(--border)] bg-[var(--navy)]"><div className="compact-container grid gap-5 py-7 text-white sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-white/45">Plan.Teach_kz</p><h2 className="mt-1 text-xl font-black">Физиканы түсініп оқуға дайынсың ба?</h2><p className="mt-1 text-sm text-white/60">Диагностикадан өтіп, жеке оқу бағытыңды баста.</p></div><Button href="/register" size="lg">Тіркелу <ArrowRight className="h-4 w-4" /></Button></div></section>
    <footer className="border-t border-white/10 bg-[var(--navy)]"><div className="compact-container flex flex-wrap items-center justify-between gap-2 py-4 text-[11px] font-bold text-white/45"><span>© 2026 Plan.Teach_kz</span><span>Adaptive Physics Learning Platform</span></div></footer>
  </main>;
}
