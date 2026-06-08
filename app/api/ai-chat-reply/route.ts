import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getStudentInterests } from "@/lib/interests";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTopicBySlug,
  isValidGrade,
  type Grade,
  type TopicLevel,
} from "@/data/physicsTopics";
import { buildAiChatAnswer } from "@/lib/aiChatEngine";
import {
  buildPersonalizedAiAnswer,
  type StudentAiContext,
} from "@/lib/studentAiPersonalization";
import type { StoredAdaptiveProgress } from "@/lib/adaptiveEngine";

type AiReplyPayload = {
  chatId?: string;
  question?: string;
  grade?: string;
  topicSlug?: string;
  level?: TopicLevel;
  adaptiveProgress?: StoredAdaptiveProgress | null;
  previousMessages?: {
    role: "user" | "assistant";
    text: string;
  }[];
};

function isValidLevel(value?: string): value is TopicLevel {
  return value === "basic" || value === "medium" || value === "advanced";
}

function getShortTitle(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");

  if (!cleaned) return "Жаңа чат";

  return cleaned.length > 34 ? `${cleaned.slice(0, 34)}...` : cleaned;
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as AiReplyPayload;

  const chatId = body.chatId;
  const question = body.question?.trim();

  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }

  if (!question) {
    return NextResponse.json({ error: "Question is empty" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: chat, error: chatError } = await supabase
    .from("ai_chats")
    .select("id, title")
    .eq("id", chatId)
    .eq("student_id", profile.id)
    .single();

  if (chatError || !chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const grade =
    body.grade && isValidGrade(body.grade)
      ? (Number(body.grade) as Grade)
      : null;

  const topic =
    grade && body.topicSlug
      ? getTopicBySlug(grade, body.topicSlug) ?? null
      : null;

  const level: TopicLevel = isValidLevel(body.level) ? body.level : "basic";

  const [{ data: latestResult }, interests] = await Promise.all([
    supabase
      .from("diagnostic_results")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getStudentInterests(profile.id),
  ]);

  const studentContext: StudentAiContext = {
    studentName: profile.full_name,
    profileLevel: profile.level,
    interests: interests.map((interest) => interest.title),
    diagnosticSummary: latestResult?.ai_summary ?? null,
    strongTopics:
      (latestResult?.strong_topics as string[] | null | undefined) ?? [],
    weakTopics:
      (latestResult?.weak_topics as string[] | null | undefined) ?? [],
  };

  const progress = body.adaptiveProgress ?? null;

  const baseAnswer = buildAiChatAnswer({
    question,
    currentTopic: topic,
    currentLevel: progress?.currentLevel ?? level,
    progress,
    previousMessages: body.previousMessages ?? [],
  });

  const answer = buildPersonalizedAiAnswer({
    baseAnswer,
    question,
    topic,
    level: progress?.currentLevel ?? level,
    progress,
    context: studentContext,
  });

  const { data: userMessage, error: userMessageError } = await supabase
    .from("ai_chat_messages")
    .insert({
      chat_id: chatId,
      student_id: profile.id,
      role: "user",
      content: question,
    })
    .select("id, role, content, created_at")
    .single();

  if (userMessageError) {
    return NextResponse.json(
      { error: userMessageError.message },
      { status: 500 }
    );
  }

  const { data: assistantMessage, error: assistantMessageError } =
    await supabase
      .from("ai_chat_messages")
      .insert({
        chat_id: chatId,
        student_id: profile.id,
        role: "assistant",
        content: answer,
      })
      .select("id, role, content, created_at")
      .single();

  if (assistantMessageError) {
    return NextResponse.json(
      { error: assistantMessageError.message },
      { status: 500 }
    );
  }

  const nextTitle =
    chat.title === "Жаңа чат" ? getShortTitle(question) : chat.title;

  const { error: updateError } = await supabase
    .from("ai_chats")
    .update({
      title: nextTitle,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId)
    .eq("student_id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    chatTitle: nextTitle,
    userMessage: {
      id: userMessage.id,
      role: userMessage.role,
      text: userMessage.content,
      createdAt: userMessage.created_at,
    },
    assistantMessage: {
      id: assistantMessage.id,
      role: assistantMessage.role,
      text: assistantMessage.content,
      createdAt: assistantMessage.created_at,
    },
  });
}
