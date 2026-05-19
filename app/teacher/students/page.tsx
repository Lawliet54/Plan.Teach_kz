import Link from "next/link";
import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";
import { getMyStudents } from "@/lib/db";

export default async function TeacherStudentsPage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "teacher" && profile.role !== "admin") redirect("/dashboard");

  const students = await getMyStudents(profile.id);

  return (
    <AppShell profile={profile} active="/teacher/students">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5b4ce6]">
          Оқушылар
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">
          Менің оқушыларым
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {students.map((student) => (
          <Link key={student.id} href={`/teacher/students/${student.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#f1efff]">
                <UsersRound className="h-5 w-5 text-[#5b4ce6]" />
              </div>
              <CardTitle>{student.full_name}</CardTitle>
              <CardText>{student.email || "Email жоқ"}</CardText>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-600">
                  {student.level || "level жоқ"}
                </span>
                <span className="rounded-full bg-[#f1efff] px-2.5 py-1 text-[#5b4ce6]">
                  {student.diagnostic_completed ? "Диагностика өтті" : "Күтілуде"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {students.length === 0 ? (
        <Card>
          <CardTitle>Оқушы әзірге жоқ</CardTitle>
          <CardText>
            Оқушы тіркеліп, сізді мұғалім ретінде таңдағаннан кейін осы жерде
            көрінеді.
          </CardText>
          <Link className="mt-3 inline-flex text-sm font-bold text-[#5b4ce6]" href="/teacher/dashboard">
            Dashboard-қа қайту
          </Link>
        </Card>
      ) : null}
    </AppShell>
  );
}
