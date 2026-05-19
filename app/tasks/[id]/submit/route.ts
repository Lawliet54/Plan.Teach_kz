import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getTaskById } from "@/lib/tasks";

type TaskSubmitRouteContext = {
  params: Promise<{ id: string }>;
};

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(",", ".")
    .replace(/\s+/g, "");
}

function isNumericCorrect(userAnswer: string, correctAnswer: string) {
  const userNumber = Number(normalizeAnswer(userAnswer));
  const correctNumber = Number(normalizeAnswer(correctAnswer));

  if (Number.isNaN(userNumber) || Number.isNaN(correctNumber)) {
    return false;
  }

  return Math.abs(userNumber - correctNumber) <= 0.01;
}

function taskPath(taskId: string, params: Record<string, string>) {
  const query = new URLSearchParams(params);
  return `/tasks/${taskId}?${query.toString()}`;
}

function redirectWithTaskError(taskId: string, message: string): never {
  redirect(taskPath(taskId, { error: message }));
}

export async function POST(request: Request, context: TaskSubmitRouteContext) {
  const { id: taskId } = await context.params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  if (!profile.teacher_id) {
    redirect("/onboarding/teacher-select");
  }

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding/interests");
  }

  const formData = await request.formData();
  const answerText = String(formData.get("answer_text") || "").trim();

  if (!answerText) {
    redirectWithTaskError(taskId, "Жауап енгізіңіз.");
  }

  const task = await getTaskById(taskId);

  if (!task) {
    redirect("/tasks");
  }

  const supabase = await createSupabaseServerClient();

  let isCorrect: boolean | null = null;
  let autoScore: number | null = null;
  let autoFeedback = "Жауабыңыз сақталды.";

  if (task.answer_type === "multiple_choice" && task.correct_answer) {
    isCorrect = normalizeAnswer(answerText) === normalizeAnswer(task.correct_answer);
    autoScore = isCorrect ? task.points : 0;
    autoFeedback = isCorrect
      ? "Дұрыс! Жауабыңыз нақты сәйкес келді."
      : `Қате. Дұрыс жауап: ${task.correct_answer}. ${task.explanation ?? ""}`;
  }

  if (task.answer_type === "numeric" && task.correct_answer) {
    isCorrect = isNumericCorrect(answerText, task.correct_answer);
    autoScore = isCorrect ? task.points : 0;
    autoFeedback = isCorrect
      ? "Дұрыс! Сандық жауап дұрыс."
      : `Қате. Дұрыс шешімі: ${task.solution ?? task.correct_answer}`;
  }

  if (
    task.answer_type === "text" ||
    task.answer_type === "formula" ||
    task.answer_type === "image" ||
    task.answer_type === "mixed"
  ) {
    isCorrect = null;
    autoScore = null;
    autoFeedback =
      "Жауап сақталды. Бұл формат кейін AI немесе мұғалім арқылы толық тексеріледі.";
  }

  const { error } = await supabase.from("task_attempts").insert({
    task_id: task.id,
    student_id: profile.id,
    answer_text: answerText,
    is_correct: isCorrect,
    auto_score: autoScore,
    status: isCorrect === null ? "submitted" : "auto_checked",
    auto_feedback: autoFeedback,
  });

  if (error) {
    redirectWithTaskError(
      taskId,
      "Жауапты сақтау кезінде қате шықты. Supabase tasks/task_attempts migration және RLS policy тексеріңіз."
    );
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);

  redirect(taskPath(taskId, { success: "Жауап сақталды" }));
}
