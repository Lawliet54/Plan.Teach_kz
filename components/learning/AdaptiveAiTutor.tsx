"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  BrainCircuit,
  CheckCircle2,
  MessageCircle,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import {
  grades,
  levelLabels,
  physicsTopics,
  type PhysicsTopic,
  type TopicLevel,
} from "@/data/physicsTopics";
import {
  readAdaptiveProgress,
  type StoredAdaptiveProgress,
} from "@/lib/adaptiveEngine";
import {
  buildAdaptiveTutorAnswer,
  getQuickTutorQuestions,
} from "@/lib/adaptiveAiTutor";

type AdaptiveAiTutorProps = {
  initialGrade?: string;
  initialTopicSlug?: string;
  initialLevel?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function isValidLevel(value?: string): value is TopicLevel {
  return value === "basic" || value === "medium" || value === "advanced";
}

function findInitialTopic(initialGrade?: string, initialTopicSlug?: string) {
  const gradeNumber = Number(initialGrade);

  if (gradeNumber && initialTopicSlug) {
    const found = physicsTopics.find(
      (topic) => topic.grade === gradeNumber && topic.slug === initialTopicSlug
    );

    if (found) return found;
  }

  return physicsTopics[0];
}

function getTopicValue(topic: PhysicsTopic) {
  return `${topic.grade}:${topic.slug}`;
}

function getProgressStatus(progress: StoredAdaptiveProgress | null) {
  if (!progress) return "Бұл тақырып бойынша нәтиже жоқ";

  const last = progress.lastPercent ?? 0;

  if (last >= 80) return "Жақсы нәтиже";
  if (last >= 60) return "Орташа нәтиже";
  return "Қайталау қажет";
}

export function AdaptiveAiTutor({
  initialGrade,
  initialTopicSlug,
  initialLevel,
}: AdaptiveAiTutorProps) {
  const initialTopic = findInitialTopic(initialGrade, initialTopicSlug);

  const [selectedTopicValue, setSelectedTopicValue] = useState(
    getTopicValue(initialTopic)
  );
  const [level, setLevel] = useState<TopicLevel>(
    isValidLevel(initialLevel) ? initialLevel : "basic"
  );
  const [progress, setProgress] = useState<StoredAdaptiveProgress | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Сәлем! Мен adaptive AI көмекшімін. Тақырыпты таңдаңыз да, не түсініксіз екенін жазыңыз. Мен сіздің деңгейіңізге және соңғы нәтижеңізге қарап жауап беремін.",
    },
  ]);

  const selectedTopic = useMemo(() => {
    const [gradeRaw, slug] = selectedTopicValue.split(":");
    const grade = Number(gradeRaw);

    return (
      physicsTopics.find((topic) => topic.grade === grade && topic.slug === slug) ??
      physicsTopics[0]
    );
  }, [selectedTopicValue]);

  const groupedTopics = useMemo(() => {
    return grades.map((grade) => ({
      grade,
      topics: physicsTopics.filter((topic) => topic.grade === grade),
    }));
  }, []);

  const quickQuestions = useMemo(
    () => getQuickTutorQuestions(selectedTopic),
    [selectedTopic]
  );

  useEffect(() => {
    const nextProgress = readAdaptiveProgress(
      selectedTopic.grade,
      selectedTopic.slug
    );

    setProgress(nextProgress);

    if (nextProgress?.currentLevel) {
      setLevel(nextProgress.currentLevel);
    } else if (!isValidLevel(initialLevel)) {
      setLevel("basic");
    }
  }, [selectedTopic, initialLevel]);

  function sendQuestion(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();

    if (!finalQuestion) return;

    const answer = buildAdaptiveTutorAnswer({
      question: finalQuestion,
      topic: selectedTopic,
      level,
      progress,
    });

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: finalQuestion,
      },
      {
        role: "assistant",
        text: answer,
      },
    ]);

    setQuestion("");
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <section className="rounded-[10px] bg-[linear-gradient(135deg,#3021b8_0%,#4438ca_45%,#5b21b6_100%)] p-4 text-white shadow-sm sm:p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              Adaptive AI tutor
            </p>

            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
              AI көмекші
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/80">
              AI оқушының тақырыбын, деңгейін және соңғы нәтижесін ескеріп,
              қарапайым түсіндіру, формула, мысал және ұқсас тапсырма береді.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
            <p className="text-xs font-bold text-white/70">Қазіргі режим</p>
            <p className="mt-1 text-sm font-black text-white">
              {levelLabels[level]} · {getProgressStatus(progress)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <main className="space-y-3">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Чат</CardTitle>
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser ? (
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
                        <Bot className="h-4 w-4" />
                      </div>
                    ) : null}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "bg-[#5b4ce6] text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>

                    {isUser ? (
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-slate-200 text-slate-600">
                        <User className="h-4 w-4" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                    sendQuestion();
                  }
                }}
                className="min-h-[72px] flex-1 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold leading-6 outline-none focus:border-[#5b4ce6]"
                placeholder="Мысалы: Ом заңын түсінбедім, қарапайым тілмен түсіндір..."
              />

              <button
                type="button"
                onClick={() => sendQuestion()}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#5b4ce6] px-5 text-sm font-bold text-white transition hover:bg-[#493dd6] sm:h-auto"
              >
                <Send className="mr-1.5 h-4 w-4" />
                Жіберу
              </button>
            </div>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Кеңес: Ctrl + Enter бассаңыз, сұрақ бірден жіберіледі.
            </p>
          </Card>
        </main>

        <aside className="space-y-3">
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Оқушы контексті</CardTitle>
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-bold text-slate-500">
                  Тақырып
                </p>

                <select
                  value={selectedTopicValue}
                  onChange={(event) => setSelectedTopicValue(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-[#5b4ce6]"
                >
                  {groupedTopics.map((group) => (
                    <optgroup key={group.grade} label={`${group.grade}-сынып`}>
                      {group.topics.map((topic) => (
                        <option key={topic.id} value={getTopicValue(topic)}>
                          {topic.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold text-slate-500">
                  Деңгей
                </p>

                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as TopicLevel)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-[#5b4ce6]"
                >
                  <option value="basic">Базалық</option>
                  <option value="medium">Орташа</option>
                  <option value="advanced">Күрделі</option>
                </select>
              </div>

              <div className="rounded-2xl border border-[#ddd6ff] bg-[#f1efff] p-3">
                <p className="text-xs font-bold text-[#5b4ce6]">
                  Adaptive нәтиже
                </p>

                {progress ? (
                  <div className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
                    <p>
                      Соңғы нәтиже:{" "}
                      <span className="font-black text-slate-950">
                        {progress.lastPercent ?? 0}%
                      </span>
                    </p>

                    <p>
                      Жақсы серия:{" "}
                      <span className="font-black text-slate-950">
                        {progress.goodStreak}/3
                      </span>
                    </p>

                    <p>
                      Тапсыру саны:{" "}
                      <span className="font-black text-slate-950">
                        {progress.attempts}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    Бұл тақырып бойынша әлі нәтиже жоқ.
                  </p>
                )}
              </div>

              {progress?.decision ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">
                    Соңғы adaptive шешім
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    {progress.decision.message}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {progress.decision.recommendation}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Дайын сұрақтар</CardTitle>
            </div>

            <div className="space-y-2">
              {quickQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendQuestion(item)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold leading-5 text-slate-700 transition hover:border-[#ddd6ff] hover:bg-[#f1efff] hover:text-[#5b4ce6]"
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <CardTitle>AI не істейді?</CardTitle>
            </div>

            <div className="space-y-2 text-xs font-semibold leading-5 text-slate-600">
              <p>1. Оқушының тақырыбын анықтайды.</p>
              <p>2. Adaptive деңгейін оқиды.</p>
              <p>3. Соңғы нәтижесін ескереді.</p>
              <p>4. Қарапайым тілмен түсіндіреді.</p>
              <p>5. Ұқсас тапсырма береді.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}