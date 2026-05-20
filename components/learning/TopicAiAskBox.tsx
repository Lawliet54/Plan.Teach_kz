"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Send } from "lucide-react";
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
    "Осы тақырып бойынша бір мысал көрсет",
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
    <section className="rounded-[10px] border border-[#ddd6ff] bg-[#f8f7ff] p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-[#5b4ce6] shadow-sm">
          <BrainCircuit className="h-4 w-4" />
        </div>

        <div>
          <h2 className="text-base font-black text-slate-950">
            15. AI көмекші
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Түсінбей қалған жеріңіз болса, сұрағыңызды жазыңыз. AI көмекші осы
            тақырып, сынып және деңгей бойынша жауап береді.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              openAi();
            }
          }}
          className="min-h-[70px] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Мысалы: осы формуланы қалай қолданамын?"
        />

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] font-semibold text-slate-400">
            Enter — жіберу, Shift + Enter — жаңа жол
          </p>

          <button
            type="button"
            onClick={() => openAi()}
            className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
          >
            <Send className="mr-1.5 h-4 w-4" />
            AI-дан сұрау
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => openAi(item)}
            className="rounded-full border border-[#ddd6ff] bg-white px-3 py-1.5 text-xs font-bold text-[#5b4ce6] transition hover:bg-[#f1efff]"
          >
            {item}
          </button>
        ))}
      </div>
    </section>
  );
}
