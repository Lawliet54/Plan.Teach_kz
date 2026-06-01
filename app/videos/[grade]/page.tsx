import Link from "next/link";
import { ChevronLeft, Clock3, Video } from "lucide-react";
import { notFound } from "next/navigation";

import {
  getVideoLessonsByGrade,
  isVideoLessonGrade,
  type VideoLessonGrade,
} from "@/data/videoLessons";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function VideoLessonsByGradePage(
  props: PageProps<"/videos/[grade]">,
) {
  const params = await props.params;

  if (!isVideoLessonGrade(params.grade)) {
    notFound();
  }

  const grade = Number(params.grade) as VideoLessonGrade;

  if (grade !== 7) {
    notFound();
  }

  const lessons = getVideoLessonsByGrade(grade);

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Видео сабақтар
          </p>
          <CardTitle className="mt-2">{grade}-сынып</CardTitle>
          <CardText className="mt-2">
            Сізге қолжетімді видео сабақтар тізімі. Сабақты ашу үшін карточканы
            басыңыз.
          </CardText>
        </div>

        <Button href="/videos" variant="ghost" className="shrink-0">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Артқа
        </Button>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/videos/${grade}/${lesson.id}`}
            className="group block"
          >
            <Card className="h-full transition group-hover:border-[#ddd6ff] group-hover:shadow-[0_12px_30px_rgba(91,76,230,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-[#5b3ee4]">
                    <Video className="h-5 w-5" />
                  </div>

                  <div>
                    <CardTitle className="text-[14px] sm:text-[15px]">
                      {lesson.title}
                    </CardTitle>
                    <CardText className="mt-1 line-clamp-2 text-[13px] leading-5">
                      {lesson.description}
                    </CardText>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  <Clock3 className="h-3.5 w-3.5" />
                  {lesson.duration}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {lesson.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                  >
                    {tag}
                  </span>
                ))}

                {lesson.tags.length > 4 ? (
                  <span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                    +{lesson.tags.length - 4}
                  </span>
                ) : null}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

