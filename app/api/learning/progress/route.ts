import { NextResponse } from "next/server";

import type {
  AdaptiveDecision,
  AdaptiveProgressRecord,
} from "@/lib/adaptiveEngine";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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

function parseGrade(value: string | null) {
  if (!value) {
    return null;
  }

  const grade = Number(value);

  if (!Number.isInteger(grade) || grade < 7 || grade > 11) {
    return null;
  }

  return grade;
}

export async function GET(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json(
      { error: "Авторизация қажет." },
      { status: 401 }
    );
  }

  if (profile.role !== "student") {
    return NextResponse.json(
      { error: "Бұл бөлім тек оқушыға қолжетімді." },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const gradeValue = url.searchParams.get("grade");
  const grade = parseGrade(gradeValue);

  if (gradeValue && grade === null) {
    return NextResponse.json(
      { error: "Сынып мәні қате." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  let query = supabase
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
    .order("grade", { ascending: true })
    .order("created_at", { ascending: true });

  if (grade !== null) {
    query = query.eq("grade", grade);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    progress: ((data ?? []) as LearningProgressRow[]).map(mapProgressRow),
  });
}