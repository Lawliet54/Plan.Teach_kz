import { redirect } from "next/navigation";

import {
  getCurrentProfile,
  getRoleHomePath,
  getStudentEntryPath,
} from "@/lib/auth";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "student") {
    redirect(getRoleHomePath(profile.role));
  }

  redirect(getStudentEntryPath(profile));
}