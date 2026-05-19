"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BrainCircuit,
  MessageCircle,
  PenLine,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createLocalTutorReply,
  type LocalAiProfile,
} from "@/lib/local-ai";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type SavedChat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

type AiChatClientProps = {
  aiProfile: LocalAiProfile;
  displayName: string;
  storageKey: string;
  initialQuestion?: string;
};

const starterQuestions = [
  "Сен не білесің?",
  "Ом заңы туралы айт",
  "U=12 В, R=4 Ом, ток күшін тап",
  "Формуланы қалай таңдаймын?",
];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function createEmptyChat(): SavedChat {
  const createdAt = now();

  return {
    id: createId(),
    title: "Жаңа чат",
    messages: [
      {
        id: createId(),
        role: "assistant",
        content:
          "Сәлем! Физикадан сұрағыңды жаза бер. Заңды түсіндіріп, формуланы ашып, есеп болса шығарып бере аламын.",
        createdAt,
      },
    ],
    createdAt,
    updatedAt: createdAt,
  };
}

function loadInitialChats(storageKey: string) {
  if (typeof window === "undefined") {
    return [createEmptyChat()];
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return [createEmptyChat()];
  }

  try {
    const parsed = JSON.parse(raw) as SavedChat[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    window.localStorage.removeItem(storageKey);
  }

  return [createEmptyChat()];
}

function withInitialQuestion(
  chats: SavedChat[],
  initialQuestion: string | undefined,
  aiProfile: LocalAiProfile
) {
  const clean = initialQuestion?.trim();

  if (!clean) {
    return chats;
  }

  const [firstChat, ...rest] = chats.length > 0 ? chats : [createEmptyChat()];
  const alreadyAsked = firstChat.messages.some(
    (message) => message.role === "user" && message.content === clean
  );

  if (alreadyAsked) {
    return chats;
  }

  const createdAt = now();
  const history = firstChat.messages.map((message) => message.content);
  const userMessage: ChatMessage = {
    id: createId(),
    role: "user",
    content: clean,
    createdAt,
  };
  const assistantMessage: ChatMessage = {
    id: createId(),
    role: "assistant",
    content: createLocalTutorReply({
      question: clean,
      aiProfile,
      history,
    }),
    createdAt: now(),
  };

  return [
    {
      ...firstChat,
      title: firstChat.messages.some((message) => message.role === "user")
        ? firstChat.title
        : getChatTitle(clean),
      messages: [...firstChat.messages, userMessage, assistantMessage],
      updatedAt: now(),
    },
    ...rest,
  ];
}

function getChatTitle(question: string) {
  const clean = question.trim().replace(/\s+/g, " ");

  if (!clean) {
    return "Жаңа чат";
  }

  return clean.length > 34 ? `${clean.slice(0, 34)}...` : clean;
}

export function AiChatClient({
  aiProfile,
  displayName,
  storageKey,
  initialQuestion,
}: AiChatClientProps) {
  const initialChats = useMemo(
    () => withInitialQuestion(loadInitialChats(storageKey), initialQuestion, aiProfile),
    [aiProfile, initialQuestion, storageKey]
  );
  const [chats, setChats] = useState<SavedChat[]>(() => initialChats);
  const [activeChatId, setActiveChatId] = useState(
    () => initialChats[0]?.id ?? ""
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats]
  );

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(chats));
    }
  }, [chats, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  function createNewChat() {
    const chat = createEmptyChat();
    setChats((current) => [chat, ...current]);
    setActiveChatId(chat.id);
    setInput("");
  }

  function deleteChat(chatId: string) {
    setChats((current) => {
      const next = current.filter((chat) => chat.id !== chatId);

      if (next.length === 0) {
        const fallback = createEmptyChat();
        setActiveChatId(fallback.id);
        return [fallback];
      }

      if (chatId === activeChatId) {
        setActiveChatId(next[0].id);
      }

      return next;
    });
  }

  const sendQuestion = useCallback((question: string) => {
    const clean = question.trim();

    if (!clean || !activeChat) {
      return;
    }

    const createdAt = now();
    const history = activeChat.messages.map((message) => message.content);
    const reply = createLocalTutorReply({
      question: clean,
      aiProfile,
      history,
    });
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: clean,
      createdAt,
    };
    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: reply,
      createdAt: now(),
    };

    setChats((current) =>
      current.map((chat) => {
        if (chat.id !== activeChat.id) {
          return chat;
        }

        const hasUserMessages = chat.messages.some(
          (message) => message.role === "user"
        );

        return {
          ...chat,
          title: hasUserMessages ? chat.title : getChatTitle(clean),
          messages: [...chat.messages, userMessage, assistantMessage],
          updatedAt: now(),
        };
      })
    );
    setInput("");
  }, [activeChat, aiProfile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className="grid h-screen min-h-0 bg-white lg:grid-cols-[310px_1fr]">
      <aside className="hidden min-h-0 border-r border-slate-200 bg-[#f7f7fb] lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-4">
          <button
            type="button"
            onClick={createNewChat}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#5b4ce6] px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(91,76,230,0.22)]"
          >
            <PenLine className="h-4 w-4" />
            Жаңа чат
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">
            Сөйлескен чаттар
          </p>
          <div className="grid gap-1.5">
            {chats.map((chat) => {
              const active = chat.id === activeChat?.id;

              return (
                <div
                  key={chat.id}
                  className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                    active
                      ? "bg-white font-black text-slate-950 shadow-sm"
                      : "font-semibold text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveChatId(chat.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-[#5b4ce6]" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteChat(chat.id)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                    aria-label="Чатты өшіру"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#f1efff]">
                <BrainCircuit className="h-4 w-4 text-[#5b4ce6]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  Local AI
                </p>
                <p className="text-xs text-slate-500">
                  {aiProfile.parameter_count} параметр
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col bg-white">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">
              Plan.Teach AI Tutor
            </p>
            <p className="truncate text-xs text-slate-500">
              Диалог сақталады · {aiProfile.mastery_percent}% меңгеру ·{" "}
              {aiProfile.learning_style}
            </p>
          </div>
          <button
            type="button"
            onClick={createNewChat}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm lg:hidden"
          >
            <PenLine className="h-4 w-4" />
            Жаңа
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
            {activeChat && activeChat.messages.length > 1 ? null : (
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f1efff]">
                  <BrainCircuit className="h-6 w-6 text-[#5b4ce6]" />
                </div>
                <h1 className="text-2xl font-black text-slate-950">
                  Физика бойынша көмек
                </h1>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Бір чат ішінде бірнеше сұрақ қоя беріңіз. Чаттан шығып қайта
                  кірсеңіз де, сөйлесу осы жерде сақталады.
                </p>
              </div>
            )}

            <div className="space-y-5">
              {(activeChat?.messages ?? []).map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[82%] rounded-3xl bg-[#5b4ce6] px-4 py-3 text-sm leading-6 text-white">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1efff]">
                      <BrainCircuit className="h-4 w-4 text-[#5b4ce6]" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-3xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800">
                      <pre className="whitespace-pre-wrap font-sans">
                        {message.content}
                      </pre>
                    </div>
                  </div>
                )
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                {starterQuestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendQuestion(item)}
                    className="rounded-2xl border border-slate-200 bg-white p-3 text-left text-xs font-bold leading-5 text-slate-700 shadow-sm transition hover:border-[#5b4ce6]/40"
                  >
                    <Sparkles className="mb-2 h-4 w-4 text-[#5b4ce6]" />
                    {item}
                  </button>
                ))}
              </div>

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#5b4ce6]"
              placeholder={`${displayName}, сұрағыңызды жазыңыз...`}
            />
            <button
              type="submit"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#5b4ce6] text-white shadow-[0_12px_24px_rgba(91,76,230,0.22)]"
              aria-label="Жіберу"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
