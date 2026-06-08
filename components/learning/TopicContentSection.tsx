import type { ReactNode } from "react";
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
  Sigma,
  Target,
  type LucideIcon,
} from "lucide-react";

import type { NormalizedTopicLevelContent } from "@/lib/contentModel";

type TopicContentSectionProps = {
  content: NormalizedTopicLevelContent;
};

function LessonSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-5 last:border-b-0">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f1efff] text-[#5b4ce6]">
          <Icon className="h-4 w-4" />
        </span>

        <h2 className="text-lg font-black text-slate-950">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function NumberedItems({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#f1efff] text-[10px] font-black text-[#5b4ce6]">
            {index + 1}
          </span>

          <p className="text-sm leading-7 text-slate-700">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function TopicContentSection({
  content,
}: TopicContentSectionProps) {
  return (
    <article>
      <LessonSection title="Сабақтың мақсаты және оқу нәтижесі" icon={Target}>
        <div className="rounded-xl border border-[#ddd6ff] bg-[#f8f7ff] p-3">
          <p className="text-sm font-bold leading-7 text-slate-800">
            {content.shortGoal}
          </p>
        </div>
      </LessonSection>

      <LessonSection title="Тақырыпты түсіндіру" icon={BookOpen}>
        {content.intro ? (
          <p className="mb-3 text-sm font-semibold leading-7 text-slate-700">
            {content.intro}
          </p>
        ) : null}

        <div className="space-y-3">
          {content.theory.map((paragraph, index) => (
            <p
              key={`${paragraph}-${index}`}
              className="text-sm leading-7 text-slate-700"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 shrink-0 text-amber-600" />

            <p className="text-xs font-black text-amber-700">
              Қарапайым тілмен
            </p>
          </div>

          <p className="mt-1 text-sm font-semibold leading-7 text-slate-700">
            {content.simpleExplanation}
          </p>
        </div>
      </LessonSection>

      {content.keyConcepts.length > 0 ? (
        <LessonSection title="Негізгі ұғымдар" icon={BrainCircuit}>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.keyConcepts.map((concept) => (
              <div
                key={concept.term}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-black text-slate-950">
                  {concept.term}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {concept.definition}
                </p>
              </div>
            ))}
          </div>
        </LessonSection>
      ) : null}

      {content.formula ? (
        <LessonSection title="Негізгі формула" icon={Calculator}>
          <div className="rounded-xl border border-[#ddd6ff] bg-[#f8f7ff] p-4">
            <p className="text-center font-mono text-xl font-black text-slate-950 sm:text-2xl">
              {content.formula.expression}
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-700">
              {content.formula.explanation}
            </p>
          </div>
        </LessonSection>
      ) : null}

      {content.formula?.symbols.length ? (
        <LessonSection title="Физикалық шамалар" icon={Sigma}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {content.formula.symbols.map((item) => (
              <div
                key={`${item.symbol}-${item.meaning}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="font-mono text-sm font-black text-[#5b4ce6]">
                  {item.symbol}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.meaning}
                  {item.unit ? ` · ${item.unit}` : ""}
                </p>
              </div>
            ))}
          </div>
        </LessonSection>
      ) : null}

      {content.units.length > 0 ? (
        <LessonSection title="Өлшем бірліктері" icon={Ruler}>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.units.map((unit) => (
              <div
                key={`${unit.name}-${unit.symbol}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-black text-slate-950">
                  {unit.name} · {unit.symbol}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {unit.explanation}
                </p>
              </div>
            ))}
          </div>
        </LessonSection>
      ) : null}

      {content.measurementTools.length > 0 ? (
        <LessonSection title="Өлшеу құралдары" icon={FlaskConical}>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.measurementTools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-sm font-black text-slate-950">
                  {tool.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {tool.use}
                </p>
              </div>
            ))}
          </div>
        </LessonSection>
      ) : null}

      {content.realLifeExamples.length > 0 ? (
        <LessonSection
          title="Күнделікті өмірдегі мысалдар"
          icon={CheckCircle2}
        >
          <NumberedItems items={content.realLifeExamples} />
        </LessonSection>
      ) : null}

      {content.workedExample ? (
        <LessonSection title="Шешілген есеп" icon={ClipboardList}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-black text-slate-950">
              {content.workedExample.title}
            </p>

            <p className="mt-2 text-sm leading-7 text-slate-700">
              {content.workedExample.problem}
            </p>

            {content.workedExample.given.length > 0 ? (
              <div className="mt-3 rounded-xl bg-white p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Берілгені
                </p>

                <NumberedItems items={content.workedExample.given} />
              </div>
            ) : null}

            {content.workedExample.solutionSteps.length > 0 ? (
              <div className="mt-3 rounded-xl bg-white p-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                  Шешуі
                </p>

                <NumberedItems items={content.workedExample.solutionSteps} />
              </div>
            ) : null}

            <div className="mt-3 rounded-xl border border-[#ddd6ff] bg-[#f8f7ff] p-3">
              <p className="text-xs font-black text-[#5b4ce6]">Жауабы</p>

              <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
                {content.workedExample.answer}
              </p>
            </div>
          </div>
        </LessonSection>
      ) : null}

      {content.commonMistakes.length > 0 ? (
        <LessonSection title="Жиі кездесетін қателер" icon={AlertTriangle}>
          <div className="space-y-2">
            {content.commonMistakes.map((item, index) => (
              <div
                key={`${item.mistake}-${index}`}
                className="rounded-xl border border-amber-200 bg-amber-50 p-3"
              >
                <p className="text-xs font-black text-amber-700">
                  Қате: {item.mistake}
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
                  Дұрысы: {item.correction}
                </p>
              </div>
            ))}
          </div>
        </LessonSection>
      ) : null}

      {content.remember.length > 0 ? (
        <LessonSection title="Есте сақтау керек" icon={ListChecks}>
          <NumberedItems items={content.remember} />
        </LessonSection>
      ) : null}

      {content.checkQuestions.length > 0 ? (
        <LessonSection title="Өзін-өзі тексеру сұрақтары" icon={HelpCircle}>
          <NumberedItems items={content.checkQuestions} />
        </LessonSection>
      ) : null}
    </article>
  );
}