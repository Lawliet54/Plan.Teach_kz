"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageSquare, Plus, Send, Trash2, User } from "lucide-react";
import { physicsTopics, type TopicLevel } from "@/data/physicsTopics";
import type { StudentAiContext } from "@/lib/studentAiPersonalization";
import { readAdaptiveProgress } from "@/lib/adaptiveEngine";


type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

type AiChatWorkspaceProps = {
  initialGrade?: string;
  initialTopicSlug?: string;
  initialLevel?: string;
  initialQuestion?: string;
  studentContext?: StudentAiContext;
};

type ApiChat = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  ai_messages?: {
    id: string;
    role: ChatRole;
    content: string;
    created_at: string;
  }[];
};

function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function now() {
  return new Date().toISOString();
}

function mapApiChat(chat: ApiChat): ChatSession {
  return {
    id: chat.id,
    title: chat.title,
    createdAt: chat.created_at,
    updatedAt: chat.updated_at,
    messages: (chat.ai_messages ?? []).map((message) => ({
      id: message.id,
      role: message.role,
      text: message.content,
      createdAt: message.created_at,
    })),
  };
}

function getInitialTopic(initialGrade?: string, initialTopicSlug?: string) {
  const gradeNumber = Number(initialGrade);

  if (!gradeNumber || !initialTopicSlug) return null;

  return (
    physicsTopics.find(
      (topic) => topic.grade === gradeNumber && topic.slug === initialTopicSlug
    ) ?? null
  );
}

function isValidLevel(value?: string): value is TopicLevel {
  return value === "basic" || value === "medium" || value === "advanced";
}

function formatChatTime(value: string) {
  try {
    return new Date(value).toLocaleDateString("kk-KZ", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function AiChatWorkspace({
  initialGrade,
  initialTopicSlug,
  initialLevel,
  initialQuestion,
}: AiChatWorkspaceProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const didSendInitialQuestionRef = useRef(false);

  const initialTopic = useMemo(
    () => getInitialTopic(initialGrade, initialTopicSlug),
    [initialGrade, initialTopicSlug]
  );

  const initialTopicLevel: TopicLevel = isValidLevel(initialLevel)
    ? initialLevel
    : "basic";

  const activeSession = useMemo(() => {
    return sessions.find((session) => session.id === activeSessionId) ?? null;
  }, [sessions, activeSessionId]);

  async function loadChats() {
    setIsLoadingChats(true);
    setErrorText(null);

    try {
      const response = await fetch("/api/ai-chats", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Чаттарды жүктеу мүмкін болмады.");
      }

      const data = (await response.json()) as {
        chats?: ApiChat[];
      };

      const loadedSessions = (data.chats ?? []).map(mapApiChat);

      if (loadedSessions.length > 0) {
        setSessions(loadedSessions);
        setActiveSessionId(loadedSessions[0].id);
      } else {
        await createChat();
      }
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Белгісіз қате пайда болды."
      );
    } finally {
      setIsLoadingChats(false);
    }
  }

  useEffect(() => {
    void loadChats();
    // The chat list is fetched once when the workspace opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createChat() {
    setErrorText(null);

    try {
      const response = await fetch("/api/ai-chats", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Жаңа чат жасау мүмкін болмады.");
      }

      const data = (await response.json()) as {
        chat: ApiChat;
      };

      const session = mapApiChat(data.chat);

      setSessions((current) => [session, ...current]);
      setActiveSessionId(session.id);
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Жаңа чат жасау қатесі."
      );
    }
  }

  async function deleteChat(sessionId: string) {
    const ok = window.confirm("Бұл чатты өшіреміз бе?");

    if (!ok) return;

    setErrorText(null);

    try {
      const response = await fetch(`/api/ai-chats/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Чатты өшіру мүмкін болмады.");
      }

      setSessions((current) => {
        const next = current.filter((session) => session.id !== sessionId);

        if (activeSessionId === sessionId) {
          setActiveSessionId(next[0]?.id ?? null);
        }

        return next;
      });

      if (sessions.length <= 1) {
        await createChat();
      }
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Чатты өшіру қатесі."
      );
    }
  }


  function addOptimisticMessages(params: {
    chatId: string;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
  }) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== params.chatId) return session;

        const nextTitle =
          session.title === "Жаңа чат" ? params.userMessage.text.slice(0, 34) : session.title;

        return {
          ...session,
          title:
            nextTitle.length >= 34 && !nextTitle.endsWith("...")
              ? `${nextTitle}...`
              : nextTitle,
          messages: [
            ...session.messages,
            params.userMessage,
            params.assistantMessage,
          ],
          updatedAt: now(),
        };
      })
    );
  }

  async function requestAiReply(params: {
  chatId: string;
  question: string;
}) {
  const progress =
    initialTopic !== null
      ? readAdaptiveProgress(initialTopic.grade, initialTopic.slug)
      : null;

  const response = await fetch("/api/ai-chat-reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId: params.chatId,
      question: params.question,
      grade: initialGrade,
      topicSlug: initialTopicSlug,
      level: progress?.currentLevel ?? initialTopicLevel,
      adaptiveProgress: progress,
      previousMessages: activeSession?.messages.slice(-8).map((message) => ({
        role: message.role,
        text: message.text,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("AI жауап беру кезінде қате пайда болды.");
  }

  const data = (await response.json()) as {
    chatTitle: string;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
  };

  return data;
}

  function replaceTempMessages(params: {
    chatId: string;
    tempUserId: string;
    tempAssistantId: string;
    savedUserMessage: ChatMessage;
    savedAssistantMessage: ChatMessage;
    chatTitle: string;
  }) {
    setSessions((current) =>
      current.map((session) => {
        if (session.id !== params.chatId) return session;

        return {
          ...session,
          title: params.chatTitle,
          updatedAt: now(),
          messages: session.messages.map((message) => {
            if (message.id === params.tempUserId) return params.savedUserMessage;
            if (message.id === params.tempAssistantId) {
              return params.savedAssistantMessage;
            }

            return message;
          }),
        };
      })
    );
  }

  async function sendMessage(questionOverride?: string) {
    const question = (questionOverride ?? input).trim();

    if (!question || !activeSession || isSending) return;

    setIsSending(true);
    setErrorText(null);

    if (!questionOverride) {
      setInput("");
    }

    const tempUserMessage: ChatMessage = {
      id: createTempId(),
      role: "user",
      text: question,
      createdAt: now(),
    };

    const tempAssistantMessage: ChatMessage = {
      id: createTempId(),
      role: "assistant",
      text: "Жауап дайындалып жатыр...",
      createdAt: now(),
    };

    addOptimisticMessages({
      chatId: activeSession.id,
      userMessage: tempUserMessage,
      assistantMessage: tempAssistantMessage,
    });

    try {
      const data = await requestAiReply({
        chatId: activeSession.id,
        question,
      });

      replaceTempMessages({
        chatId: activeSession.id,
        tempUserId: tempUserMessage.id,
        tempAssistantId: tempAssistantMessage.id,
        savedUserMessage: data.userMessage,
        savedAssistantMessage: data.assistantMessage,
        chatTitle: data.chatTitle,
      });
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "AI жауап қатесі пайда болды."
      );

      replaceTempMessages({
        chatId: activeSession.id,
        tempUserId: tempUserMessage.id,
        tempAssistantId: tempAssistantMessage.id,
        savedUserMessage: tempUserMessage,
        savedAssistantMessage: {
          ...tempAssistantMessage,
          text:
            "Кешіріңіз, жауап беру кезінде қате пайда болды. Серверді немесе Supabase байланысын тексеріңіз.",
        },
        chatTitle: activeSession.title,
      });
    } finally {
      setIsSending(false);
    }
  }

  useEffect(() => {
    if (!initialQuestion?.trim()) return;
    if (!activeSession) return;
    if (isLoadingChats) return;
    if (isSending) return;
    if (didSendInitialQuestionRef.current) return;

    didSendInitialQuestionRef.current = true;

    void sendMessage(initialQuestion);

    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
    // sendMessage uses the latest active session; re-triggering on its function identity would duplicate the initial question.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, activeSession, isLoadingChats, isSending]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [activeSession?.messages.length]);

  if (isLoadingChats) {
    return (
      <div className="grid h-[calc(100vh-96px)] place-items-center rounded-[14px] border border-slate-200 bg-white text-sm font-semibold text-slate-500">
        Чаттар жүктеліп жатыр...
      </div>
    );
  }

  return (
    <div className="grid h-[calc(100vh-96px)] min-h-0 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[270px_1fr]">
      <aside className="hidden min-h-0 border-r border-slate-200 bg-slate-50 lg:flex lg:flex-col">
        <div className="border-b border-slate-200 p-3">
          <button
            type="button"
            onClick={createChat}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#5b4ce6] px-4 text-sm font-bold text-white transition hover:bg-[#493dd6]"
          >
            <Plus className="h-4 w-4" />
            Жаңа чат
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={`group flex items-center gap-2 rounded-2xl border px-2 py-2 transition ${
                  isActive
                    ? "border-[#ddd6ff] bg-white shadow-sm"
                    : "border-transparent hover:border-slate-200 hover:bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveSessionId(session.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                      isActive
                        ? "bg-[#f1efff] text-[#5b4ce6]"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900">
                      {session.title}
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                      {formatChatTime(session.updatedAt)}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => deleteChat(session.id)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl text-slate-400 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                  title="Чатты өшіру"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex h-full min-h-0 flex-col bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
              <Bot className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-black text-slate-950">
                {activeSession?.title ?? "AI көмекші"}
              </h1>

              <p className="text-xs font-semibold text-slate-500">
                Plan.Teach_kz AI көмекші
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={createChat}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600"
              title="Жаңа чат"
            >
              <Plus className="h-4 w-4" />
            </button>

            {activeSession ? (
              <button
                type="button"
                onClick={() => deleteChat(activeSession.id)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600"
                title="Чатты өшіру"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </header>

        {errorText ? (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600">
            {errorText}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-3 py-4 sm:px-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {(activeSession?.messages ?? []).map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser ? (
                    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-[#f1efff] text-[#5b4ce6]">
                      <Bot className="h-4 w-4" />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm leading-7 ${
                      isUser
                        ? "bg-[#5b4ce6] text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>

                  {isUser ? (
                    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-slate-200 text-slate-600">
                      <User className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-[20px] border border-slate-200 bg-slate-50 p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              className="max-h-28 min-h-[44px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm font-semibold leading-6 text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Кез келген сұрақ жазыңыз..."
            />

            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isSending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#5b4ce6] text-white transition hover:bg-[#493dd6] disabled:cursor-not-allowed disabled:bg-slate-300"
              title="Жіберу"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] font-semibold text-slate-400">
            Enter — жіберу, Shift + Enter — жаңа жол
          </p>
        </footer>
      </main>
    </div>
  );
}