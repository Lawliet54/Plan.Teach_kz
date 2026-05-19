"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { getLevelFromScore } from "@/lib/diagnostic";

function redirectWithError(message: string): never {
  const params = new URLSearchParams({
    error: message,
  });

  redirect(`/onboarding/diagnostic?${params.toString()}`);
}

export async function submitDiagnosticAction(formData: FormData) {
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

  const supabase = await createSupabaseServerClient();

  const { data: questions, error: questionsError } = await supabase
    .from("diagnostic_questions")
    .select("id, grade, topic, correct_option")
    .eq("is_active", true);

  if (questionsError || !questions || questions.length === 0) {
    redirectWithError("Диагностика сұрақтары табылмады.");
  }

  const answers = questions.map((question) => {
    const selected = formData.get(`question_${question.id}`);

    return {
      question,
      selected: typeof selected === "string" ? selected : "",
    };
  });

  const unanswered = answers.filter((item) => !item.selected);

  if (unanswered.length > 0) {
    redirectWithError(
      `Барлық сұраққа жауап беріңіз. Жауап берілмеген сұрақ саны: ${unanswered.length}`
    );
  }

  const { data: attempt, error: attemptError } = await supabase
    .from("diagnostic_attempts")
    .insert({
      student_id: profile.id,
      status: "in_progress",
      max_score: questions.length,
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    redirectWithError("Диагностика attempt жасау кезінде қате шықты.");
  }

  const answerRows = answers.map((item) => ({
    attempt_id: attempt.id,
    student_id: profile.id,
    question_id: item.question.id,
    selected_option: item.selected,
    is_correct: item.selected === item.question.correct_option,
  }));

  const { error: answersError } = await supabase
    .from("diagnostic_answers")
    .insert(answerRows);

  if (answersError) {
    redirectWithError("Жауаптарды сақтау кезінде қате шықты.");
  }

  const totalScore = answerRows.filter((row) => row.is_correct).length;
  const maxScore = questions.length;
  const level = getLevelFromScore(totalScore, maxScore);

  const gradeScores = questions.reduce<Record<string, { correct: number; total: number }>>(
    (acc, question) => {
      const key = String(question.grade);

      if (!acc[key]) {
        acc[key] = {
          correct: 0,
          total: 0,
        };
      }

      const answer = answerRows.find((row) => row.question_id === question.id);

      acc[key].total += 1;

      if (answer?.is_correct) {
        acc[key].correct += 1;
      }

      return acc;
    },
    {}
  );

  const topicStats = questions.reduce<
    Record<string, { correct: number; total: number }>
  >((acc, question) => {
    if (!acc[question.topic]) {
      acc[question.topic] = {
        correct: 0,
        total: 0,
      };
    }

    const answer = answerRows.find((row) => row.question_id === question.id);

    acc[question.topic].total += 1;

    if (answer?.is_correct) {
      acc[question.topic].correct += 1;
    }

    return acc;
  }, {});

  const strongTopics = Object.entries(topicStats)
    .filter(([, stat]) => stat.total > 0 && stat.correct / stat.total >= 0.8)
    .map(([topic]) => topic)
    .slice(0, 6);

  const weakTopics = Object.entries(topicStats)
    .filter(([, stat]) => stat.total > 0 && stat.correct / stat.total <= 0.4)
    .map(([topic]) => topic)
    .slice(0, 6);

  const { error: completeAttemptError } = await supabase
    .from("diagnostic_attempts")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      total_score: totalScore,
      max_score: maxScore,
    })
    .eq("id", attempt.id)
    .eq("student_id", profile.id);

  if (completeAttemptError) {
    redirectWithError("Диагностика нәтижесін аяқтау кезінде қате шықты.");
  }

  const { error: resultError } = await supabase
    .from("diagnostic_results")
    .insert({
      attempt_id: attempt.id,
      student_id: profile.id,
      total_score: totalScore,
      max_score: maxScore,
      level,
      grade_scores: gradeScores,
      strong_topics: strongTopics,
      weak_topics: weakTopics,
      ai_summary: null,
      recommended_route: [],
    });

  if (resultError) {
    redirectWithError("Диагностика нәтижесін сақтау кезінде қате шықты.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      level,
      diagnostic_completed: true,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (profileError) {
    redirectWithError("Оқушы профилін жаңарту кезінде қате шықты.");
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding/diagnostic");

  redirect(`/onboarding/diagnostic/result?attempt=${attempt.id}`);
}