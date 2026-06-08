import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ attemptId: string }> };
type Payload = { score?: number; feedback?: string };

export async function POST(request: Request, context: Context) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  if (profile.role !== "teacher" && profile.role !== "admin") {
    return NextResponse.json({ error: "Бұл әрекет мұғалімге ғана қолжетімді." }, { status: 403 });
  }

  const { attemptId } = await context.params;
  const body = (await request.json().catch(() => null)) as Payload | null;
  const score = Number(body?.score);

  if (!Number.isFinite(score) || score < 0) {
    return NextResponse.json({ error: "Балл мәнін дұрыс енгізіңіз." }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Сервер конфигурациясы толық емес." },
      { status: 500 },
    );
  }

  const { data: attempt, error: readError } = await supabase
    .from("task_pack_attempts")
    .select("id,max_score,student_id")
    .eq("id", attemptId)
    .maybeSingle();

  if (readError || !attempt) {
    return NextResponse.json({ error: "Жұмыс табылмады." }, { status: 404 });
  }

  if (profile.role === "teacher") {
    const { data: link } = await supabase
      .from("teacher_student_links")
      .select("id")
      .eq("teacher_id", profile.id)
      .eq("student_id", attempt.student_id)
      .eq("status", "active")
      .maybeSingle();

    if (!link) {
      return NextResponse.json({ error: "Бұл оқушыны бағалауға рұқсат жоқ." }, { status: 403 });
    }
  }

  if (score > Number(attempt.max_score)) {
    return NextResponse.json({ error: `Максималды балл: ${attempt.max_score}.` }, { status: 400 });
  }

  const feedback = String(body?.feedback ?? "").trim();
  const { error } = await supabase
    .from("task_pack_attempts")
    .update({
      teacher_score: score,
      teacher_feedback: feedback,
      score,
      review_status: "reviewed",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      feedback: feedback || "Мұғалім тексерді.",
    })
    .eq("id", attemptId);

  if (error) {
    return NextResponse.json({ error: "Бағаны сақтау мүмкін болмады. 016–020 миграцияларын тексеріңіз." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
