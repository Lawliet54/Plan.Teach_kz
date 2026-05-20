import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: chats, error } = await supabase
    .from("ai_chats")
    .select(
      `
      id,
      title,
      created_at,
      updated_at,
      ai_messages (
        id,
        role,
        content,
        created_at
      )
    `
    )
    .eq("student_id", profile.id)
    .order("updated_at", { ascending: false })
    .order("created_at", {
      referencedTable: "ai_messages",
      ascending: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chats: chats ?? [] });
}

export async function POST() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: chat, error } = await supabase
    .from("ai_chats")
    .insert({
      student_id: profile.id,
      title: "Жаңа чат",
    })
    .select("id, title, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: message, error: messageError } = await supabase
    .from("ai_messages")
    .insert({
      chat_id: chat.id,
      student_id: profile.id,
      role: "assistant",
      content:
        "Сәлем! Сұрағыңызды жазыңыз. Мен физика тақырыбын түсіндіре аламын, есеп шығарып бере аламын және тақырыпты қарапайым тілмен түсіндіремін.",
    })
    .select("id, role, content, created_at")
    .single();

  if (messageError) {
    return NextResponse.json({ error: messageError.message }, { status: 500 });
  }

  return NextResponse.json({
    chat: {
      ...chat,
      ai_messages: [message],
    },
  });
}