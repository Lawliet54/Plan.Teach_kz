import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CinematicAnalytics } from "@/components/analytics/CinematicAnalytics";
import { getCurrentProfile,getRoleHomePath } from "@/lib/auth";
import { getStudentAdaptiveSnapshot } from "@/lib/adaptive-engine/queries";
export default async function AnalyticsPage(){const profile=await getCurrentProfile();if(!profile)redirect("/login");if(profile.role!=="student")redirect(profile.role==="teacher"?"/teacher/analytics":getRoleHomePath(profile.role));const snapshot=await getStudentAdaptiveSnapshot(profile.id);return <AppShell profile={profile} active="/analytics"><CinematicAnalytics snapshot={snapshot}/></AppShell>}
