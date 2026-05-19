"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  sendTopicMessageAction,
  archiveChatAction,
} from "@/app/ai/actions";
import type { AiChatMessage } from "@/lib/ai/types";

type AiTutorProps = {
  chatId: string;
  topicId: string;
  topicTitle: string;
  contents: Array<{ content_type: string; content_text: string }>;
  initialMessages?: AiChatMessage[];
};

const hints = [
  { label: "Қарапайым тілмен түсіндіріңіз", key: "simple" },
  { label: "Формуламен түсіндіріңіз", key: "formula" },
  { label: "Тағы мысал келтіріңіз", key: "example" },
  { label: "Қысқаша қорытынды жаса", key: "summary" },
];

export function AiTutor({
  chatId,
  topicId,
  topicTitle,
  contents,
  initialMessages = [],
}: AiTutorProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input;

    if (!messageToSend.trim()) return;

    setIsLoading(true);

    try {
      const result = await sendTopicMessageAction(
        chatId,
        messageToSend,
        topicId,
        topicTitle,
        contents
      );

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-user`,
          chat_id: chatId,
          student_id: "",
          role: "user" as const,
          content: messageToSend,
          intent: null,
          created_at: new Date().toISOString(),
        },
      ]);

      // Add AI message
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai`,
          chat_id: chatId,
          student_id: "",
          role: "assistant" as const,
          content: result.message,
          intent: null,
          created_at: new Date().toISOString(),
        },
      ]);

      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Хабарлама жіберу сәтсіз болды. Кейін қайталап көріңіз.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveChatAction(chatId);
      setIsArchived(true);
    } catch (error) {
      console.error("Failed to archive chat:", error);
      alert("Архивтеу сәтсіз болды.");
    }
  };

  if (isArchived) {
    return (
      <Card className="p-4">
        <p className="text-sm text-slate-500">Бұл сұхбат архивталынды.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#5b4ce6]" />
          <h3 className="font-bold text-slate-900">AI білік құрылығы</h3>
        </div>
        <button
          onClick={handleArchive}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Архивтеу
        </button>
      </div>

      <div className="max-h-[300px] space-y-2 overflow-y-auto rounded bg-slate-50 p-3">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400">
            Сұхбат құрайын. Сұрақ беріңіз немесе төмендегі кеңес түрдерінен
            біреуін таңдаңыз.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded px-3 py-2 text-xs ${
                msg.role === "user"
                  ? "bg-[#5b4ce6] text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
            >
              {msg.content}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="space-y-2">
        <div className="flex gap-1.5 flex-wrap">
          {hints.map((hint) => (
            <button
              key={hint.key}
              onClick={() => handleSendMessage(hint.label)}
              disabled={isLoading}
              className="rounded bg-[#f1efff] px-2.5 py-1.5 text-xs font-bold text-[#5b4ce6] hover:bg-[#e8e6ff] disabled:opacity-50"
            >
              {hint.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Сұрақ беріңіз..."
            disabled={isLoading}
            className="flex-1 rounded border border-slate-200 bg-white px-3 py-2 text-xs placeholder-slate-400 focus:border-[#5b4ce6] focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="rounded bg-[#5b4ce6] p-2 text-white hover:bg-[#4a3bad] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
