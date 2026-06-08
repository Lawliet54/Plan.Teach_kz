import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { TaskPackWorkspace } from "@/components/tasks/TaskPackWorkspace";
import { getCurrentProfile,getRoleHomePath } from "@/lib/auth";
import { getStudentPackAttempts,getTaskPackBySlug,getTaskPackItems } from "@/lib/taskPacks";
type TaskPackPageProps={params:Promise<{packSlug:string}>};
export default async function TaskPackPage(props:TaskPackPageProps){const profile=await getCurrentProfile();if(!profile)redirect("/login");if(profile.role!=="student")redirect(getRoleHomePath(profile.role));const {packSlug}=await props.params;const pack=await getTaskPackBySlug(packSlug);if(!pack)notFound();const [items,attempts]=await Promise.all([getTaskPackItems(pack),getStudentPackAttempts(profile.id,pack.id)]);return <AppShell profile={profile} active="/tasks"><div className="mb-3"><Link href={`/tasks?grade=${pack.grade}`} className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--text-muted)] hover:text-[var(--primary)]"><ArrowLeft className="h-3.5 w-3.5"/>Тапсырмаларға қайту</Link></div><TaskPackWorkspace pack={pack} items={items} initialAttempts={attempts} databaseReady={pack.source==="database"}/></AppShell>}
