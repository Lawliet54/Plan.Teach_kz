import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  BookOpen,
  Lightbulb,
  Target,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";
import {
  getStudentProfileForTeacher,
  getStudentLatestDiagnostic,
  getStudentRecentTaskAttempts,
  getStudentAiSolutionReviews,
  getStudentAiRouteRecommendation,
  getStudentInterests,
  getStudentAiChatCount,
  getStudentTaskStats,
} from "@/lib/teacher";

type StudentPageProps = {
  params: Promise<{ studentId: string }>;
};

export default async function TeacherStudentPage({
  params,
}: StudentPageProps) {
  const { studentId } = await params;

  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "teacher" && profile.role !== "admin") {
    redirect("/dashboard");
  }

  const student = await getStudentProfileForTeacher(studentId);

  if (!student) {
    redirect("/teacher/students");
  }

  const [
    latestDiagnostic,
    recentAttempts,
    aiReviews,
    routeRecommendation,
    interests,
    aiChatCount,
    taskStats,
  ] = await Promise.all([
    getStudentLatestDiagnostic(studentId),
    getStudentRecentTaskAttempts(studentId, 3),
    getStudentAiSolutionReviews(studentId, 3),
    getStudentAiRouteRecommendation(studentId),
    getStudentInterests(studentId),
    getStudentAiChatCount(studentId),
    getStudentTaskStats(studentId),
  ]);

  return (
    <AppShell profile={profile} active="/teacher/students">
      <Link
        href="/teacher/students"
        className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#5b4ce6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Оқушыларға қайту
      </Link>

      <div className="mb-4">
        <h1 className="text-2xl font-black text-slate-950">{student.full_name}</h1>
        <p className="text-sm text-slate-500">{student.email}</p>
      </div>

      <div className="space-y-3">
        {/* Profile info */}
        <Card>
          <CardTitle>Профиль ақпараты</CardTitle>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Деңгей:</span>
              <span className="font-bold text-slate-900">
                {student.level || "белгісіз"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ағымдағы сынып:</span>
              <span className="font-bold text-slate-900">
                {student.current_grade || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Диагностика:</span>
              <span className="font-bold text-slate-900">
                {student.diagnostic_completed ? "✓ Өтті" : "⏳ Күтілуде"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ынамдастыру:</span>
              <span className="font-bold text-slate-900">
                {student.onboarding_completed ? "✓ Өтті" : "⏳ Күтілуде"}
              </span>
            </div>
          </div>
        </Card>

        {/* Diagnostic Results */}
        {latestDiagnostic ? (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Диагностика нәтижесі</CardTitle>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Балл:</span>
                <span className="font-bold text-slate-900">
                  {latestDiagnostic.total_score}/{latestDiagnostic.max_score}
                </span>
              </div>
              {latestDiagnostic.strong_topics?.length > 0 ? (
                <div>
                  <span className="text-slate-500">Күшті тақырыптар:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {latestDiagnostic.strong_topics.map((topic: string) => (
                      <span
                        key={topic}
                        className="rounded bg-[#f1efff] px-2 py-1 text-xs font-bold text-[#5b4ce6]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {latestDiagnostic.weak_topics?.length > 0 ? (
                <div>
                  <span className="text-slate-500">Кемсетулі тақырыптар:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {latestDiagnostic.weak_topics.map((topic: string) => (
                      <span
                        key={topic}
                        className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-bold text-red-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {latestDiagnostic.ai_summary ? (
                <div className="border-t border-slate-200 pt-2">
                  <p className="text-xs text-slate-500">AI қорытындысы:</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700">
                    {latestDiagnostic.ai_summary}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>
        ) : null}

        {/* Route Recommendation */}
        {routeRecommendation ? (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Ұсынылған маршрут</CardTitle>
            </div>
            {routeRecommendation.summary ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {routeRecommendation.summary}
              </p>
            ) : null}
          </Card>
        ) : null}

        {/* Task Statistics */}
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>Тапсырма статистикасы</CardTitle>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Толық орындалды:</span>
              <span className="font-bold text-slate-900">
                {taskStats.correct}/{taskStats.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Процент:</span>
              <span className="font-bold text-slate-900">
                {taskStats.percentage}%
              </span>
            </div>
          </div>
        </Card>

        {/* Interests */}
        {interests.length > 0 ? (
          <Card>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#5b4ce6]" />
              <CardTitle>Қызығушылықтар</CardTitle>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest.topic_title}
                  className="rounded bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600"
                >
                  {interest.topic_title}
                </span>
              ))}
            </div>
          </Card>
        ) : null}

        {/* AI Chat Activity */}
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#5b4ce6]" />
            <CardTitle>AI белсенділік</CardTitle>
          </div>
          <div className="mt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Белсең AI сұхбатар:</span>
              <span className="font-bold text-slate-900">{aiChatCount}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-slate-500">AI шешім талдау:</span>
              <span className="font-bold text-slate-900">
                {aiReviews.length}
              </span>
            </div>
          </div>
        </Card>

        {/* Recent AI Solution Reviews */}
        {aiReviews.length > 0 ? (
          <Card>
            <CardTitle>Соңғы AI талдаулары</CardTitle>
            <div className="mt-3 space-y-2">
              {aiReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded bg-slate-50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {(review.task as any)?.title || "Белгісіз тапсырма"}
                    </span>
                    {review.score ? (
                      <span className="rounded bg-[#5b4ce6] px-2 py-1 text-white">
                        {review.score}%
                      </span>
                    ) : null}
                  </div>
                  {review.overall_feedback ? (
                    <p className="mt-1 text-slate-600">
                      {review.overall_feedback.substring(0, 100)}...
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {/* Recent Task Attempts */}
        {recentAttempts.length > 0 ? (
          <Card>
            <CardTitle>Соңғы тапсырмалар</CardTitle>
            <div className="mt-3 space-y-2">
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded bg-slate-50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">
                      {(attempt.task as any)?.title || "Белгісіз тапсырма"}
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-white ${
                        attempt.is_correct
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {attempt.is_correct ? "✓" : "✗"}
                    </span>
                  </div>
                  {attempt.auto_feedback ? (
                    <p className="mt-1 text-slate-600">
                      {attempt.auto_feedback}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
