import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth";
import { physicsInterests } from "@/data/physics-interests";

function redirectWithError(message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`/onboarding/interests?${params.toString()}`);
}

export async function POST(request: Request) {
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

  if (!profile.diagnostic_completed) {
    redirect("/onboarding/diagnostic");
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  const formData = await request.formData();
  const selectedKeys = formData
    .getAll("interests")
    .map((value) => (typeof value === "string" ? value : ""))
    .filter(Boolean);

  if (selectedKeys.length === 0) {
    redirectWithError("Кемінде бір қызығушылық бағытын таңдаңыз.");
  }

  const selectedInterests = physicsInterests.filter((interest) =>
    selectedKeys.includes(interest.key)
  );

  if (selectedInterests.length === 0) {
    redirectWithError("Таңдалған бағыттар табылмады.");
  }

  const supabase = await createSupabaseServerClient();

  const { error: deleteError } = await supabase
    .from("student_interests")
    .delete()
    .eq("student_id", profile.id);

  if (deleteError) {
    redirectWithError("Бұрынғы қызығушылықтарды тазалау кезінде қате шықты.");
  }

  const rows = selectedInterests.map((interest, index) => ({
    student_id: profile.id,
    interest_key: interest.key,
    title: interest.title,
    category: interest.category,
    description: interest.description,
    priority: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("student_interests")
    .insert(rows);

  if (insertError) {
    redirectWithError("Қызығушылықтарды сақтау кезінде қате шықты.");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (profileError) {
    redirectWithError("Профильді жаңарту кезінде қате шықты.");
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/onboarding/interests");

  redirect("/dashboard");
}
