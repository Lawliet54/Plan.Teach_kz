import { NextResponse } from "next/server";

import { recordSkillMasteryForCodes } from "@/lib/adaptive-engine/server";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ packId: string }> };

type Payload = {
  itemId?: string;
  answer?: unknown;
  idempotencyKey?: string;
};

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(",", ".")
    .replace(/\s+/g, "");
}

export async function POST(request: Request, context: Context) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  if (profile.role !== "student") {
    return NextResponse.json({ error: "Бұл әрекет тек оқушыға қолжетімді." }, { status: 403 });
  }

  const { packId } = await context.params;
  const body = (await request.json().catch(() => null)) as Payload | null;

  if (!body?.itemId || !body.idempotencyKey) {
    return NextResponse.json({ error: "Тапсырма деректері толық емес." }, { status: 400 });
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

  // Private table is intentionally read only by the trusted server client.
  // correct_answer never leaves this route.
  const { data: item, error: itemError } = await supabase
    .from("task_pack_items")
    .select("*")
    .eq("id", body.itemId)
    .eq("pack_id", packId)
    .maybeSingle();

  if (itemError || !item) {
    return NextResponse.json({ error: "Тапсырма табылмады." }, { status: 404 });
  }

  let isCorrect: boolean | null = null;
  let score: number | null = null;
  let reviewStatus: "auto_checked" | "pending_review" = "auto_checked";
  let feedback = "Жауап сақталды.";

  if (item.answer_type === "single_choice") {
    isCorrect = normalize(body.answer) === normalize(item.correct_answer);
    score = isCorrect ? Number(item.max_score) : 0;
    feedback = isCorrect
      ? "Дұрыс. Дағды көрсеткіші жаңартылды."
      : "Жауап сәйкес келмеді. Формуланың физикалық мағынасын қайта қарап шығыңыз.";
  } else {
    reviewStatus = "pending_review";
    feedback =
      item.kind === "lab"
        ? "Практикалық жұмыс мұғалім тексеруіне жіберілді."
        : "Шешу жолы сақталды. Мұғалім формула, SI түрлендіруі және есептеу ретін тексереді.";
  }

  const { data: attempt, error } = await supabase
    .from("task_pack_attempts")
    .insert({
      student_id: profile.id,
      pack_id: packId,
      item_id: item.id,
      submitted_answer: { value: body.answer },
      is_correct: isCorrect,
      score,
      max_score: item.max_score,
      review_status: reviewStatus,
      feedback,
      idempotency_key: body.idempotencyKey,
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    return NextResponse.json({ error: "Бұл жауап бұрын сақталған." }, { status: 409 });
  }

  if (error || !attempt) {
    return NextResponse.json(
      { error: "Жауапты сақтау мүмкін болмады. 016–020 миграцияларын іске қосыңыз." },
      { status: 500 },
    );
  }

  const adaptive =
    isCorrect === null
      ? null
      : await recordSkillMasteryForCodes({
          supabase,
          studentId: profile.id,
          skillCodes: item.skill_codes ?? [],
          isCorrect,
          difficulty: "intermediate",
          entityId: item.id,
          entityType: "task_pack_item",
        });

  return NextResponse.json({ attempt, feedback, adaptive });
}
