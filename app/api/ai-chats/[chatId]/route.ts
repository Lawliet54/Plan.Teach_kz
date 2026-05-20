import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: RouteProps) {
  const profile = await getCurrentProfile();
  const { chatId } = await params;

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("ai_chats")
    .delete()
    .eq("id", chatId)
    .eq("student_id", profile.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}