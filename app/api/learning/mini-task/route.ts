import { NextResponse } from "next/server";

import {
  getLessonMiniTask,
  type LessonMiniTask,
} from "@/data/lessonMiniTasks";
import type { Grade } from "@/data/physicsTopics";
import {
  checkLessonMiniTask,
  type LessonMiniTaskAnswer,
} from "@/lib/lessonMiniTask";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RequestBody = {
  grade?: unknown;
  topicSlug?: unknown;
  answer?: unknown;
};

type ExistingProgress = {
  attempts: number;
  is_completed: boolean;
  completed_at: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidGrade(value: unknown): value is Grade {
  return (
    value === 7 ||
    value === 8 ||
    value === 9 ||
    value === 10 ||
    value === 11
  );
}

function parseAnswer(
  task: LessonMiniTask,
  value: unknown
): LessonMiniTaskAnswer | null {
  if (!isRecord(value) || value.type !== task.type) {
    return null;
  }

  if (task.type === "single-choice") {
    if (typeof value.selectedOptionId !== "string") {
      return null;
    }

    return {
      type: "single-choice",
      selectedOptionId: value.selectedOptionId,
    };
  }

  if (task.type === "multiple-choice") {
    if (
      !Array.isArray(value.selectedOptionIds) ||
      !value.selectedOptionIds.every((item) => typeof item === "string")
    ) {
      return null;
    }

    return {
      type: "multiple-choice",
      selectedOptionIds: value.selectedOptionIds,
    };
  }

  if (!isRecord(value.pairs)) {
    return null;
  }

  const pairs = Object.entries(value.pairs).reduce<Record<string, string>>(
    (accumulator, [leftId, rightId]) => {
      if (typeof rightId === "string") {
        accumulator[leftId] = rightId;
      }

      return accumulator;
    },
    {}
  );

  return {
    type: "matching",
    pairs,
  };
}

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type AuthenticatedStudentResult =
  | {
      supabase: SupabaseServerClient;
      userId: string;
      error: null;
    }
  | {
      supabase: SupabaseServerClient;
      userId: null;
      error: NextResponse;
    };

async function getAuthenticatedStudent(): Promise<AuthenticatedStudentResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      userId: null,
      error: NextResponse.json(
        {
          error: "Аккаунтқа қайта кіріңіз.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      supabase,
      userId: null,
      error: NextResponse.json(
        {
          error: "Оқушы профилі табылмады.",
        },
        {
          status: 404,
        }
      ),
    };
  }

  if (profile.role !== "student") {
    return {
      supabase,
      userId: null,
      error: NextResponse.json(
        {
          error: "Mini-task тек оқушы аккаунтына арналған.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    supabase,
    userId: user.id,
    error: null,
  };
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedStudent();

    if (auth.error) {
        return auth.error;
    }

  const { supabase, userId } = auth;

  const url = new URL(request.url);
  const gradeValue = Number(url.searchParams.get("grade"));
  const topicSlug = url.searchParams.get("topicSlug")?.trim() || "";

  if (!isValidGrade(gradeValue)) {
    return NextResponse.json(
      {
        error: "Сынып дұрыс көрсетілмеген.",
      },
      {
        status: 400,
      }
    );
  }

  let query = supabase
    .from("lesson_mini_task_progress")
    .select(
      "grade, topic_slug, task_id, task_type, attempts, is_completed, last_is_correct, completed_at, last_attempt_at"
    )
    .eq("student_id", userId)
    .eq("grade", gradeValue);

  if (topicSlug) {
    query = query.eq("topic_slug", topicSlug);
  }

  const { data, error: progressError } = await query.order("created_at", {
    ascending: true,
  });

  if (progressError) {
    return NextResponse.json(
      {
        error: "Mini-task прогресін оқу мүмкін болмады.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    progress: data ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedStudent();

    if (auth.error) {
        return auth.error;
    }

  const { supabase, userId } = auth;

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      {
        error: "Сұраныс форматы қате.",
      },
      {
        status: 400,
      }
    );
  }

  if (!isValidGrade(body.grade)) {
    return NextResponse.json(
      {
        error: "Сынып дұрыс көрсетілмеген.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    typeof body.topicSlug !== "string" ||
    body.topicSlug.trim().length === 0
  ) {
    return NextResponse.json(
      {
        error: "Тақырып дұрыс көрсетілмеген.",
      },
      {
        status: 400,
      }
    );
  }

  const grade = body.grade;
  const topicSlug = body.topicSlug.trim();
  const task = getLessonMiniTask(grade, topicSlug);

  if (!task) {
    return NextResponse.json(
      {
        error: "Бұл тақырыпқа mini-task табылмады.",
      },
      {
        status: 404,
      }
    );
  }

  const answer = parseAnswer(task, body.answer);

  if (!answer) {
    return NextResponse.json(
      {
        error: "Жауап форматы қате.",
      },
      {
        status: 400,
      }
    );
  }

  const checkResult = checkLessonMiniTask(task, answer);

  const { data: existingProgress, error: existingProgressError } =
    await supabase
      .from("lesson_mini_task_progress")
      .select("attempts, is_completed, completed_at")
      .eq("student_id", userId)
      .eq("grade", grade)
      .eq("topic_slug", topicSlug)
      .maybeSingle();

  if (existingProgressError) {
    return NextResponse.json(
      {
        error: "Алдыңғы mini-task нәтижесін оқу мүмкін болмады.",
      },
      {
        status: 500,
      }
    );
  }

  const previousProgress =
    (existingProgress as ExistingProgress | null) ?? null;

  const attempts = (previousProgress?.attempts ?? 0) + 1;

  const isCompleted =
    Boolean(previousProgress?.is_completed) || checkResult.isCorrect;

  const now = new Date().toISOString();

  const completedAt = isCompleted
    ? previousProgress?.completed_at || now
    : null;

  const { error: saveError } = await supabase
    .from("lesson_mini_task_progress")
    .upsert(
      {
        student_id: userId,
        grade,
        topic_slug: topicSlug,
        task_id: task.id,
        task_type: task.type,
        attempts,
        is_completed: isCompleted,
        last_is_correct: checkResult.isCorrect,
        last_answer: answer,
        completed_at: completedAt,
        last_attempt_at: now,
      },
      {
        onConflict: "student_id,grade,topic_slug",
      }
    );

  if (saveError) {
    return NextResponse.json(
      {
        error: "Mini-task нәтижесін сақтау мүмкін болмады.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    isCorrect: checkResult.isCorrect,
    message: checkResult.message,
    isCompleted,
    attempts,
  });
}