import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TaskOption = {
  key: "A" | "B" | "C" | "D";
  text: string;
};

export type Task = {
  id: string;
  topic_id: string | null;
  grade: number;
  title: string;
  body: string;
  task_type: "practice" | "test" | "pisa" | "project" | "lab_prepare";
  answer_type: "multiple_choice" | "text" | "numeric" | "formula" | "image" | "mixed";
  difficulty: "easy" | "medium" | "hard";
  options: TaskOption[];
  correct_answer: string | null;
  solution: string | null;
  explanation: string | null;
  points: number;
  content_status: "ready" | "partial" | "placeholder";
  order_index: number;
  is_active: boolean;
  topic?: {
    id: string;
    title: string;
    slug: string;
  } | null;
};

export type TaskAttempt = {
  id: string;
  task_id: string;
  student_id: string;
  answer_text: string | null;
  answer_image_url: string | null;
  is_correct: boolean | null;
  auto_score: number | null;
  teacher_score: number | null;
  status: "draft" | "submitted" | "auto_checked" | "teacher_reviewed";
  auto_feedback: string | null;
  teacher_feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export async function getTasks(grade?: number) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("tasks")
    .select(
      `
      *,
      topic:topics (
        id,
        title,
        slug
      )
    `
    )
    .eq("is_active", true)
    .order("grade", { ascending: true })
    .order("order_index", { ascending: true });

  if (grade) {
    query = query.eq("grade", grade);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as Task[];
}

export async function getTaskById(taskId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      topic:topics (
        id,
        title,
        slug
      )
    `
    )
    .eq("id", taskId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Task;
}

export async function getMyTaskAttempts(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("task_attempts")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as TaskAttempt[];
}

export async function getLatestTaskAttempt(taskId: string, studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("task_attempts")
    .select("*")
    .eq("task_id", taskId)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as TaskAttempt;
}

export function getDifficultyLabel(difficulty: string) {
  if (difficulty === "hard") return "Күрделі";
  if (difficulty === "medium") return "Орташа";
  return "Жеңіл";
}

export function getDifficultyClass(difficulty: string) {
  if (difficulty === "hard") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }

  if (difficulty === "medium") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}