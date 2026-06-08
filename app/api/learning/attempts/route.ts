import { NextResponse } from "next/server";

import {
  buildAdaptiveDecision,
  type AdaptiveDecision,
  type AdaptiveProgressRecord,
} from "@/lib/adaptiveEngine";
import {
  getTopicBySlug,
  type Grade,
  type TopicLevel,
} from "@/data/physicsTopics";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AttemptPayload = {
  grade?: unknown;
  topicSlug?: unknown;
  level?: unknown;
  correct?: unknown;
  total?: unknown;
};

type LearningProgressRow = {
  grade: number;
  topic_slug: string;
  current_level: AdaptiveProgressRecord["currentLevel"];
  next_recommended_level: AdaptiveProgressRecord["nextRecommendedLevel"];
  is_completed: boolean;
  attempts: number;
  best_percent: number;
  last_percent: number | null;
  last_completed_at: string | null;
  decision: AdaptiveDecision | null;
};

function mapProgressRow(
  row: LearningProgressRow
): AdaptiveProgressRecord {
  return {
    grade: row.grade,
    topicSlug: row.topic_slug,
    currentLevel: row.current_level,
    nextRecommendedLevel: row.next_recommended_level,
    isCompleted: row.is_completed,
    attempts: row.attempts,
    bestPercent: row.best_percent,
    lastPercent: row.last_percent ?? undefined,
    lastCompletedAt: row.last_completed_at ?? undefined,
    decision: row.decision ?? undefined,
    history: [],
  };
}

function isValidLevel(value: unknown): value is TopicLevel {
  return (
    value === "basic" ||
    value === "medium" ||
    value === "advanced"
  );
}

function parseInteger(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  return value;
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json(
      { error: "Авторизация қажет." },
      { status: 401 }
    );
  }

  if (profile.role !== "student") {
    return NextResponse.json(
      { error: "Бұл әрекет тек оқушыға қолжетімді." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as AttemptPayload;

  const grade = parseInteger(body.grade);
  const correct = parseInteger(body.correct);
  const total = parseInteger(body.total);

  const topicSlug =
    typeof body.topicSlug === "string"
      ? body.topicSlug.trim()
      : "";

  if (grade === null || grade < 7 || grade > 11) {
    return NextResponse.json(
      { error: "Сынып мәні қате." },
      { status: 400 }
    );
  }

  if (!topicSlug) {
    return NextResponse.json(
      { error: "Тақырып көрсетілмеген." },
      { status: 400 }
    );
  }

  if (!isValidLevel(body.level)) {
    return NextResponse.json(
      { error: "Деңгей мәні қате." },
      { status: 400 }
    );
  }

  if (
    correct === null ||
    total === null ||
    total <= 0 ||
    correct < 0 ||
    correct > total
  ) {
    return NextResponse.json(
      { error: "Нәтиже мәндері қате." },
      { status: 400 }
    );
  }

  const topic = getTopicBySlug(grade as Grade, topicSlug);

  if (!topic) {
    return NextResponse.json(
      { error: "Тақырып табылмады." },
      { status: 404 }
    );
  }

  const percent = Math.round((correct / total) * 100);
  const supabase = await createSupabaseServerClient();

  const { data: existingProgress, error: existingProgressError } =
    await supabase
      .from("learning_topic_progress")
      .select("attempts")
      .eq("student_id", profile.id)
      .eq("grade", grade)
      .eq("topic_slug", topicSlug)
      .maybeSingle();

  if (existingProgressError) {
    return NextResponse.json(
      { error: existingProgressError.message },
      { status: 500 }
    );
  }

  const decision = buildAdaptiveDecision({
    level: body.level,
    percent,
    attemptNumber: (existingProgress?.attempts ?? 0) + 1,
  });

  const { data: savedProgress, error: saveError } = await supabase.rpc(
    "record_learning_attempt",
    {
      p_grade: grade,
      p_topic_slug: topicSlug,
      p_level: body.level,
      p_percent: percent,
      p_correct_count: correct,
      p_total_count: total,
      p_decision_type: decision.type,
      p_next_recommended_level: decision.nextTopicLevel,
      p_is_completed: decision.isCompleted,
      p_decision: decision,
    }
  );

  if (saveError || !savedProgress) {
    return NextResponse.json(
      {
        error:
          saveError?.message ||
          "Нәтижені сақтау мүмкін болмады.",
      },
      { status: 500 }
    );
  }

  const { data: gradeRows, error: gradeProgressError } = await supabase
    .from("learning_topic_progress")
    .select(
      `
      grade,
      topic_slug,
      current_level,
      next_recommended_level,
      is_completed,
      attempts,
      best_percent,
      last_percent,
      last_completed_at,
      decision
    `
    )
    .eq("student_id", profile.id)
    .eq("grade", grade)
    .order("created_at", { ascending: true });

  if (gradeProgressError) {
    return NextResponse.json(
      { error: gradeProgressError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    progress: mapProgressRow(savedProgress as LearningProgressRow),
    gradeProgress: ((gradeRows ?? []) as LearningProgressRow[]).map(
      mapProgressRow
    ),
    decision,
  });
}