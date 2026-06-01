import Link from "next/link";
import { ChevronRight, GraduationCap, Lock } from "lucide-react";

import {
  getVideoLessonsByGrade,
  videoLessonGrades,
  type VideoLessonGrade,
} from "@/data/videoLessons";
import { cn } from "@/lib/utils";

const enabledGrade: VideoLessonGrade = 7;

export default function VideosIndexPage() {
  const grade7Count = getVideoLessonsByGrade(7).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="rounded-[10px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Видео сабақтар
            </p>
            <h1 className="mt-2 text-[18px] font-black leading-tight text-slate-950 sm:text-xl">
              Сыныпты таңдаңыз
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
              Әзірге тек 7-сынып видео сабақтары қолжетімді. Қалған сыныптар жақында
              қосылады.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {videoLessonGrades.map((grade) => {
          const enabled = grade === enabledGrade;
          const count =
            grade === 7 ? `${grade7Count} видео сабақ` : "Жақында қосылады";

          const content = (
            <div
              className={cn(
                "group relative overflow-hidden rounded-[10px] border bg-white p-3 shadow-sm transition sm:p-4",
                enabled
                  ? "border-slate-200 hover:border-[#ddd6ff] hover:shadow-[0_12px_30px_rgba(91,76,230,0.08)]"
                  : "border-slate-200/70 bg-slate-50 text-slate-400",
              )}
              aria-disabled={!enabled}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                  <GraduationCap className="h-5 w-5" />
                </div>

                {enabled ? (
                  <ChevronRight className="mt-2 h-4 w-4 text-slate-300 transition group-hover:text-[#5b3ee4]" />
                ) : (
                  <Lock className="mt-2 h-4 w-4 text-slate-300" />
                )}
              </div>

              <p className="mt-3 text-sm font-black text-slate-950">
                {grade}-сынып
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">{count}</p>

              {enabled ? (
                <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#5b3ee4]/10 blur-2xl" />
                </div>
              ) : null}
            </div>
          );

          if (!enabled) {
            return (
              <div key={grade} className="cursor-not-allowed">
                {content}
              </div>
            );
          }

          return (
            <Link key={grade} href={`/videos/${grade}`} className="block">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

