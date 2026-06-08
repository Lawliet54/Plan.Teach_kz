"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Send, Sparkles } from "lucide-react";

import type { Grade, TopicLevel } from "@/data/physicsTopics";

type TopicAiAskBoxProps = {
  grade: Grade;
  topicSlug: string;
  topicTitle: string;
  level: TopicLevel;
};

export function TopicAiAskBox({
  grade,
  topicSlug,
  topicTitle,
  level,
}: TopicAiAskBoxProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  const suggestions = [
    `${topicTitle} тақырыбын қарапайым тілмен түсіндір`,
    "Формуланы қалай қолданатынымды көрсет",
    "Осы тақырып бойынша бір есеп шығарып бер",
    "Қандай қателер жиі кездеседі?",
  ];

  function openAi(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();

    const params = new URLSearchParams({
      grade: String(grade),
      topic: topicSlug,
      level,
    });

    if (finalQuestion) {
      params.set("q", finalQuestion);
    }

    router.push(`/ai?${params.toString()}`);
  }

  return (
    <section
      id="topic-ai"
      className="scroll-mt-20 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-accent)] bg-[var(--purple-soft)] shadow-[var(--shadow-xs)]"
    >
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--primary)] text-white">
            <BrainCircuit className="h-4 w-4" />
          </span>

          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />

              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--primary)]">
                Контекстік AI көмекші
              </p>
            </div>

            <h2 className="mt-1 text-base font-black text-[var(--text)]">
              Тақырып бойынша сұрақ қойыңыз
            </h2>

            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
              AI көмекші сіздің сыныбыңызды, ағымдағы тақырыпты және деңгейіңізді
              ескеріп жауап береді.
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-2">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                openAi();
              }
            }}
            className="min-h-[76px] w-full resize-none rounded-[var(--radius-sm)] bg-transparent px-2 py-1.5 text-sm leading-6 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
            placeholder="Мысалы: формуладағы шамалардың байланысын қарапайым тілмен түсіндір"
          />

          <div className="flex flex-col gap-2 border-t border-[var(--border-soft)] pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-semibold text-[var(--text-muted)]">
              Enter — жіберу · Shift + Enter — жаңа жол
            </p>

            <button
              type="button"
              onClick={() => openAi()}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--primary)] px-3 text-xs font-bold text-white transition hover:bg-[var(--primary-2)]"
            >
              <Send className="h-3.5 w-3.5" />
              AI-дан сұрау
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => openAi(suggestion)}
              className="rounded-full border border-[var(--border-accent)] bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--primary)] transition hover:bg-[var(--surface-soft)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}