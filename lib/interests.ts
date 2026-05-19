import { createSupabaseServerClient } from "@/lib/supabase/server";

export type StudentInterest = {
  id: string;
  student_id: string;
  interest_key: string;
  title: string;
  category: string;
  description: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
};

export async function getStudentInterests(studentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("student_interests")
    .select("*")
    .eq("student_id", studentId)
    .order("priority", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as StudentInterest[];
}