"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { getRoleHomePath, getStudentEntryPath } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function safeRedirect(
  path: string,
  type: "error" | "success",
  message: string
): never {
  const params = new URLSearchParams({
    [type]: message,
  });

  redirect(`${path}?${params.toString()}`);
}

async function getProfileForUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

async function ensureProfileForUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  user: User
): Promise<{ profile: Profile | null; error: string | null }> {
  const existingProfile = await getProfileForUser(supabase, user.id);

  if (existingProfile) {
    return {
      profile: existingProfile,
      error: null,
    };
  }

  const metadataRole = user.user_metadata?.role;

  const role: UserRole =
    metadataRole === "teacher" || metadataRole === "admin"
      ? metadataRole
      : "student";

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

  if (rpcProfile && !rpcError) {
    return {
      profile: rpcProfile as Profile,
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      role,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      profile: null,
      error:
        rpcError?.message ||
        error?.message ||
        "Profile жазбасын жасау мүмкін болмады.",
    };
  }

  return {
    profile: data as Profile,
    error: null,
  };
}

export async function signInAction(formData: FormData) {
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");

  if (!email || !password) {
    safeRedirect("/login", "error", "Email және құпиясөзді толық енгізіңіз.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    safeRedirect("/login", "error", "Email немесе құпиясөз қате.");
  }

  const user = signInData.user;

  if (!user) {
    safeRedirect("/login", "error", "Қолданушы табылмады. Қайта кіріп көріңіз.");
  }

  const { profile, error: profileError } = await ensureProfileForUser(
    supabase,
    user
  );

  revalidatePath("/", "layout");

  if (!profile) {
    safeRedirect(
      "/login",
      "error",
      `Аккаунт кірді, бірақ profile жазбасын жасау мүмкін болмады: ${profileError}.`
    );
  }

  if (profile.role === "student") {
    redirect(getStudentEntryPath(profile));
  }

  redirect(getRoleHomePath(profile.role));
}

export async function signUpAction(formData: FormData) {
  const fullName = getFormString(formData, "full_name");
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");

  if (!fullName || !email || !password) {
    safeRedirect("/register", "error", "Барлық өрісті толық толтырыңыз.");
  }

  if (password.length < 6) {
    safeRedirect(
      "/register",
      "error",
      "Құпиясөз кемінде 6 таңбадан тұруы керек."
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "student",
      },
    },
  });

  if (error) {
    safeRedirect("/register", "error", error.message);
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    safeRedirect(
      "/login",
      "success",
      "Аккаунт жасалды. Email растау қосулы болса, поштаңызды тексеріңіз."
    );
  }

  redirect("/onboarding/teacher-select");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  safeRedirect("/login", "success", "Аккаунттан шықтыңыз.");
}