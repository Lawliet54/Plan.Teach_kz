import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Get a student's full profile with AI data for a teacher
 */
export async function getStudentProfileForTeacher(studentId: string) {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  // Check if teacher can view this student
  if (profile.role === "teacher") {
    const { data: link } = await supabase
      .from("teacher_student_links")
      .select("*")
      .eq("teacher_id", profile.id)
      .eq("student_id", studentId)
      .eq("status", "active")
      .maybeSingle();

    if (!link) {
      return null;
    }
  }

  const { data: student } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", studentId)
    .maybeSingle();

  return student;
}

/**
 * Get latest diagnostic result for a student
 */
export async function getStudentLatestDiagnostic(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: result } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return result;
}

/**
 * Get recent task attempts for a student
 */
export async function getStudentRecentTaskAttempts(
  studentId: string,
  limit = 5
) {
  const supabase = await createSupabaseServerClient();

  const { data: attempts } = await supabase
    .from("task_attempts")
    .select("*, task:task_id(title, topic_id)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return attempts || [];
}

/**
 * Get AI solution reviews for a student
 */
export async function getStudentAiSolutionReviews(
  studentId: string,
  limit = 5
) {
  const supabase = await createSupabaseServerClient();

  const { data: reviews } = await supabase
    .from("ai_solution_reviews")
    .select("*, task:task_id(title)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return reviews || [];
}

/**
 * Get AI route recommendation for a student
 */
export async function getStudentAiRouteRecommendation(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: recommendation } = await supabase
    .from("ai_route_recommendations")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return recommendation;
}

/**
 * Get student interests
 */
export async function getStudentInterests(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: interests } = await supabase
    .from("student_interests")
    .select("topic_title")
    .eq("student_id", studentId);

  return interests || [];
}

/**
 * Get student's AI chat count
 */
export async function getStudentAiChatCount(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from("ai_chats")
    .select("*", { count: "exact" })
    .eq("student_id", studentId)
    .eq("status", "active");

  return count || 0;
}

/**
 * Get student task statistics
 */
export async function getStudentTaskStats(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: attempts } = await supabase
    .from("task_attempts")
    .select("is_correct")
    .eq("student_id", studentId)
    .eq("status", "auto_checked");

  const total = attempts?.length || 0;
  const correct = attempts?.filter((a) => a.is_correct).length || 0;

  return {
    total,
    correct,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
