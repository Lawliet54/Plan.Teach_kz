import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getTeachersForSelect(): Promise<Pick<
  Profile,
  "id" | "full_name" | "email" | "avatar_url"
>[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url")
    .eq("role", "teacher")
    .order("full_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as Pick<Profile, "id" | "full_name" | "email" | "avatar_url">[];
}

export async function getProfileById(profileId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

export async function getMyStudents(teacherId: string): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("teacher_student_links")
    .select(
      `
      student:profiles!teacher_student_links_student_id_fkey (
        id,
        full_name,
        email,
        role,
        teacher_id,
        level,
        current_grade,
        diagnostic_completed,
        onboarding_completed,
        avatar_url,
        last_seen_at,
        created_at,
        updated_at
      )
    `
    )
    .eq("teacher_id", teacherId)
    .eq("status", "active");

  if (error || !data) {
    return [];
  }

  return data
    .map((item) => item.student)
    .filter(Boolean) as unknown as Profile[];
}

export async function updateStudentTeacher(studentId: string, teacherId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      teacher_id: teacherId,
    })
    .eq("id", studentId)
    .select("*")
    .single();

  if (error) {
    return {
      profile: null,
      error: error.message,
    };
  }

  return {
    profile: data as Profile,
    error: null,
  };
}

export async function getStudentDashboardSummary(studentId: string) {
  const profile = await getProfileById(studentId);

  return {
    profile,
  };
}