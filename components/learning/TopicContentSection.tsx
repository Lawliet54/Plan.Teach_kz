import {
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Ruler,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  getContentRememberItems,
  getFormulaExpression,
  type TopicLevel,
  type TopicLevelContent,
} from "@/data/physicsTopics";

type TopicContentSectionProps = {
  content: TopicLevelContent;
  level: TopicLevel;
};

function getLevelDescription(level: TopicLevel) {
  if (level === "basic") {
    return "Бұл деңгейде тақырып қарапайым тілмен түсіндіріледі. Негізгі ұғымдар, жеңіл мысалдар және бастапқы тапсырмалар беріледі.";
  }

  if (level === "medium") {
    return "Бұл деңгейде оқушы формуланы қолдануды, салыстыруды және есеп шығару қадамдарын меңгереді.";
  }

  return "Бұл деңгейде оқушы тақырыпты талдау, тәжірибе, қателік және қорытынды жасау арқылы терең меңгереді.";
}

function toParagraphs(theory: TopicLevelContent["theory"]) {
  return Array.isArray(theory) ? theory : [theory];
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#5b4ce6]" />
        <CardTitle>{title}</CardTitle>
      </div>

      {children}
    </Card>
  );
}

function NumberedItems({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2">
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[#f1efff] text-xs font-black text-[#5b4ce6]">
            {index + 1}
          </div>
          <p className="text-sm font-semibold leading-6 text-slate-700">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

export function TopicContentSection({
  content,
  level,
}: TopicContentSectionProps) {
  const formulaExpression = getFormulaExpression(content.formula);
  const formulaDetails =
    content.formula && typeof content.formula === "object"
      ? content.formula
      : null;
  const rememberItems = getContentRememberItems(content);
  const intro = content.intro ?? content.simpleExplanation;
  const workedExample =
    content.workedExample ??
    (content.example
      ? {
          title: "Мысал",
          problem: content.example,
          given: [],
          solutionSteps: [],
          answer: content.example,
        }
      : null);
  const keyConcepts =
    content.keyConcepts ??
    rememberItems.map((item, index) => ({
      term: `Негізгі ой ${index + 1}`,
      definition: item,
    }));

  return (
    <>
      <SectionCard title="1. Оқу мақсаты" icon={Target}>
        <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] p-3">
          <p className="text-sm font-bold leading-6 text-slate-900">
            {content.shortGoal}
          </p>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {getLevelDescription(level)}
        </p>
      </SectionCard>

      <SectionCard title="2. Тақырыпқа кіріспе" icon={Sparkles}>
        <p className="text-sm leading-7 text-slate-700">{intro}</p>
      </SectionCard>

      <SectionCard title="3. Толық теория" icon={BookOpen}>
        <div className="space-y-3">
          {toParagraphs(content.theory).map((paragraph, index) => (
            <p key={index} className="text-sm leading-7 text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="4. Қарапайым түсіндіру" icon={Lightbulb}>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold leading-7 text-slate-800">
            {content.simpleExplanation}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="5. Негізгі ұғымдар" icon={BrainCircuit}>
        <div className="grid gap-2 sm:grid-cols-2">
          {keyConcepts.map((concept) => (
            <div
              key={concept.term}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-sm font-black text-slate-950">
                {concept.term}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {concept.definition}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {formulaExpression ? (
        <SectionCard title="6. Формула" icon={Calculator}>
          <div className="rounded-2xl border border-[#ddd6ff] bg-[#f8f7ff] p-4">
            <p className="text-center font-mono text-2xl font-black text-slate-950">
              {formulaExpression}
            </p>
            {formulaDetails ? (
              <>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                  {formulaDetails.explanation}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {formulaDetails.symbols.map((item) => (
                    <div
                      key={item.symbol}
                      className="rounded-xl border border-white bg-white p-2 shadow-sm"
                    >
                      <p className="font-mono text-sm font-black text-[#5b4ce6]">
                        {item.symbol}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        {item.meaning}
                        {item.unit ? `, ${item.unit}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      {content.units?.length ? (
        <SectionCard title="7. Өлшем бірліктер" icon={Ruler}>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.units.map((unit) => (
              <div
                key={`${unit.name}-${unit.symbol}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-black text-slate-950">
                  {unit.name} · {unit.symbol}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {unit.explanation}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {content.measurementTools?.length ? (
        <SectionCard title="8. Өлшеу құралдары" icon={FlaskConical}>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.measurementTools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-black text-slate-950">
                  {tool.name}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {tool.use}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {content.realLifeExamples?.length ? (
        <SectionCard title="9. Күнделікті өмірдегі мысалдар" icon={CheckCircle2}>
          <NumberedItems items={content.realLifeExamples} />
        </SectionCard>
      ) : null}

      {workedExample ? (
        <SectionCard title="10. Қадамдық мысал" icon={ClipboardList}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-black text-slate-950">
              {workedExample.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {workedExample.problem}
            </p>

            {workedExample.given.length ? (
              <div className="mt-3 rounded-xl bg-white p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  Берілгені
                </p>
                <NumberedItems items={workedExample.given} />
              </div>
            ) : null}

            {workedExample.solutionSteps.length ? (
              <div className="mt-3 rounded-xl bg-white p-3">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  Шешуі
                </p>
                <NumberedItems items={workedExample.solutionSteps} />
              </div>
            ) : null}

            <div className="mt-3 rounded-xl border border-[#ddd6ff] bg-[#f8f7ff] p-3">
              <p className="text-sm font-black text-slate-950">Жауабы</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                {workedExample.answer}
              </p>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {content.commonMistakes?.length ? (
        <SectionCard title="11. Жиі кездесетін қателер" icon={AlertTriangle}>
          <div className="grid gap-2">
            {content.commonMistakes.map((item, index) => (
              <div
                key={`${item.mistake}-${index}`}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-3"
              >
                <p className="text-sm font-black text-amber-800">
                  Қате: {item.mistake}
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-amber-900">
                  Дұрысы: {item.correction}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {rememberItems.length ? (
        <SectionCard title="12. Есте сақтау керек" icon={ListChecks}>
          <NumberedItems items={rememberItems} />
        </SectionCard>
      ) : null}

      {content.checkQuestions?.length ? (
        <SectionCard title="13. Өзін-өзі тексеру сұрақтары" icon={HelpCircle}>
          <NumberedItems items={content.checkQuestions} />
        </SectionCard>
      ) : null}
    </>
  );
}
