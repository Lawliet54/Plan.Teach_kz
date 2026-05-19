"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function redirectWithError(path: string, message: string): never {
  const params = new URLSearchParams({
    error: message,
  });

  redirect(`${path}?${params.toString()}`);
}

export async function selectTeacherAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  const teacherId = getFormString(formData, "teacher_id");

  if (!teacherId) {
    redirectWithError("/onboarding/teacher-select", "Мұғалімді таңдаңыз.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: teacher, error: teacherError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", teacherId)
    .eq("role", "teacher")
    .single();

  if (teacherError || !teacher) {
    redirectWithError(
      "/onboarding/teacher-select",
      "Таңдалған мұғалім табылмады."
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      teacher_id: teacherId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    redirectWithError(
      "/onboarding/teacher-select",
      "Мұғалімді сақтау кезінде қате шықты."
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/onboarding/teacher-select");
  revalidatePath("/dashboard");

  redirect("/onboarding/diagnostic");
}