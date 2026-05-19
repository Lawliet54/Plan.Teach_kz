"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getTaskById } from "@/lib/tasks";

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

function redirectWithError(taskId: string, message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`/tasks/${taskId}?${params.toString()}`);
}

export async function submitTaskAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  const taskId = String(formData.get("task_id") || "");
  const answerText = String(formData.get("answer_text") || "").trim();

  if (!taskId) {
    redirect("/tasks");
  }

  if (!answerText) {
    redirectWithError(taskId, "Жауап енгізіңіз.");
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

  if (task.answer_type === "text" || task.answer_type === "formula") {
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
    redirectWithError(taskId, "Жауапты сақтау кезінде қате шықты.");
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);

  redirect(`/tasks/${taskId}?success=Жауап сақталды`);
}