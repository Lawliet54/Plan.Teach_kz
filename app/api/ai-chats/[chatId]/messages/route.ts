import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    chatId: string;
  }>;
};

type MessagePayload = {
  role?: "user" | "assistant";
  content?: string;
};

function getShortTitle(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");

  if (!cleaned) return "Жаңа чат";

  return cleaned.length > 34 ? `${cleaned.slice(0, 34)}...` : cleaned;
}

export async function POST(request: Request, { params }: RouteProps) {
  const profile = await getCurrentProfile();
  const { chatId } = await params;

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as MessagePayload;

  if (!body.role || !["user", "assistant"].includes(body.role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  if (!body.content || body.content.trim().length === 0) {
    return NextResponse.json({ error: "Message is empty" }, { status: 400 });
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

  const { data: message, error } = await supabase
    .from("ai_chat_messages")
    .insert({
      chat_id: chatId,
      student_id: profile.id,
      role: body.role,
      content: body.content,
    })
    .select("id, role, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const nextTitle =
    chat.title === "Жаңа чат" && body.role === "user"
      ? getShortTitle(body.content)
      : chat.title;

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
    message,
    chatTitle: nextTitle,
  });
}
