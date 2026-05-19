import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data && !error) {
    return data as Profile;
  }

  const metadataRole = user.user_metadata?.role;
  const role = metadataRole === "teacher" ? "teacher" : "student";
  const fullName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim().length > 0
      ? user.user_metadata.full_name.trim()
      : user.email || "Атаусыз қолданушы";

  const { data: rpcProfile, error: rpcError } = await supabase
    .rpc("ensure_profile_for_current_user", {
      p_full_name: fullName,
      p_role: role,
    })
    .single();

  if (rpcError || !rpcProfile) {
    return null;
  }

  return rpcProfile as Profile;
}

export function getRoleHomePath(role?: UserRole | null) {
  if (role === "teacher") {
    return "/teacher/dashboard";
  }

  if (role === "admin") {
    return "/admin/dashboard";
  }

  return "/dashboard";
}

export function getStudentEntryPath(profile: Profile | null) {
  if (!profile) {
    return "/login";
  }

  if (profile.role !== "student") {
    return getRoleHomePath(profile.role);
  }

  if (!profile.teacher_id) {
    return "/onboarding/teacher-select";
  }

  if (!profile.diagnostic_completed) {
    return "/onboarding/diagnostic";
  }

  if (!profile.onboarding_completed) {
    return "/onboarding/interests";
  }

  return "/dashboard";
}

export function isStudentOnboardingComplete(profile: Profile | null) {
  return Boolean(
    profile &&
      profile.role === "student" &&
      profile.teacher_id &&
      profile.diagnostic_completed &&
      profile.onboarding_completed
  );
}
