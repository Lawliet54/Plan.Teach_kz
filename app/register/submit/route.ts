import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleHomePath, getStudentEntryPath } from "@/lib/auth";
import type { Profile, UserRole } from "@/lib/types";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeRole(value: string): UserRole {
  if (value === "teacher") {
    return "teacher";
  }

  return "student";
}

function redirectWithMessage(
  path: string,
  type: "error" | "success",
  message: string
): never {
  const params = new URLSearchParams({ [type]: message });
  redirect(`${path}?${params.toString()}`);
}

async function getProfileForUser(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string
) {
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
  user: User,
  fullName: string,
  role: UserRole
): Promise<{ profile: Profile | null; error: string | null }> {
  const existingProfile = await getProfileForUser(supabase, user.id);

  if (existingProfile) {
    return { profile: existingProfile, error: null };
  }

  const { data: rpcProfile, error: rpcError } = await supabase
    .rpc("ensure_profile_for_current_user", {
      p_full_name: fullName,
      p_role: role,
    })
    .single();

  if (rpcProfile && !rpcError) {
    return { profile: rpcProfile as Profile, error: null };
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

  return { profile: data as Profile, error: null };
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = getFormString(formData, "full_name");
  const email = getFormString(formData, "email").toLowerCase();
  const password = getFormString(formData, "password");
  const role = normalizeRole(getFormString(formData, "role"));

  if (!fullName || !email || !password) {
    redirectWithMessage("/register", "error", "Барлық өрісті толық толтырыңыз.");
  }

  if (password.length < 6) {
    redirectWithMessage(
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
        role,
      },
    },
  });

  if (error) {
    redirectWithMessage("/register", "error", error.message);
  }

  if (!data.user) {
    redirectWithMessage(
      "/register",
      "error",
      "Аккаунт жасау кезінде қолданушы дерегі қайтпады."
    );
  }

  if (!data.session) {
    redirectWithMessage(
      "/login",
      "success",
      "Аккаунт жасалды. Email растау қосулы болса, поштаңызды тексеріңіз."
    );
  }

  await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  const { profile, error: profileError } = await ensureProfileForUser(
    supabase,
    data.user,
    fullName,
    role
  );

  revalidatePath("/", "layout");

  if (!profile) {
    redirectWithMessage(
      "/login",
      "error",
      `Аккаунт жасалды, бірақ profile жазбасын жасау мүмкін болмады: ${profileError}. Supabase-та 006 migration орындаңыз.`
    );
  }

  if (profile.role === "student") {
    redirect(getStudentEntryPath(profile));
  }

  redirect(getRoleHomePath(profile.role));
}
