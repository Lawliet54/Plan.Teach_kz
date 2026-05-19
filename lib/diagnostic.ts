import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DiagnosticQuestion = {
  id: string;
  grade: number;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  difficulty: "easy" | "medium" | "hard";
  skill_tag: string;
  explanation: string | null;
};

export type PublicDiagnosticQuestion = Omit<
  DiagnosticQuestion,
  "correct_option" | "explanation"
>;

export async function getDiagnosticQuestionsByGrade() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("diagnostic_questions")
    .select(
      `
      id,
      grade,
      topic,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      difficulty,
      skill_tag
    `
    )
    .eq("is_active", true)
    .order("grade", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return {
      questions: [],
      error: error?.message ?? "Диагностика сұрақтары табылмады.",
    };
  }

  return {
    questions: data as PublicDiagnosticQuestion[],
    error: null,
  };
}

export function groupQuestionsByGrade(questions: PublicDiagnosticQuestion[]) {
  return questions.reduce<Record<number, PublicDiagnosticQuestion[]>>(
    (acc, question) => {
      if (!acc[question.grade]) {
        acc[question.grade] = [];
      }

      acc[question.grade].push(question);
      return acc;
    },
    {}
  );
}

export function getLevelFromScore(totalScore: number, maxScore: number) {
  const percent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  if (percent >= 75) {
    return "advanced";
  }

  if (percent >= 45) {
    return "intermediate";
  }

  return "beginner";
}

export function getLevelLabel(level: string) {
  if (level === "advanced") {
    return "Жоғары деңгей";
  }

  if (level === "intermediate") {
    return "Орта деңгей";
  }

  return "Бастапқы деңгей";
}