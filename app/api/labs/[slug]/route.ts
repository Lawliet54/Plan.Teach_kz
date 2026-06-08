import { NextResponse } from "next/server";

import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Context = { params: Promise<{ slug: string }> };
type Payload = { measurements?: unknown[]; conclusion?: string; score?: number; graphData?: unknown[] };

export async function POST(request: Request, context: Context) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  if (profile.role !== "student") {
    return NextResponse.json({ error: "Бұл әрекет тек оқушыға қолжетімді." }, { status: 403 });
  }

  const { slug } = await context.params;
  const body = (await request.json().catch(() => null)) as Payload | null;

  if (!body || !Array.isArray(body.measurements) || body.measurements.length < 3 || String(body.conclusion ?? "").trim().length < 20) {
    return NextResponse.json({ error: "Кемінде 3 өлшеу және толық қорытынды қажет." }, { status: 400 });
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

  const safeScore = Math.min(100, Math.max(0, Number(body.score ?? 0)));
  const { error } = await supabase.from("lab_submissions").insert({
    student_id: profile.id,
    lab_slug: slug,
    measurements: body.measurements,
    conclusion: String(body.conclusion).trim(),
    score: safeScore,
    graph_data: body.graphData ?? [],
  });

  if (error) {
    return NextResponse.json({ error: "Нәтижені базаға сақтау мүмкін болмады. 016–020 миграцияларын іске қосыңыз." }, { status: 500 });
  }

  await supabase.from("learning_events").insert({
    student_id: profile.id,
    event_type: "lab_completed",
    entity_type: "lab",
    metadata: { labSlug: slug, score: safeScore },
  });

  return NextResponse.json({ ok: true });
}
