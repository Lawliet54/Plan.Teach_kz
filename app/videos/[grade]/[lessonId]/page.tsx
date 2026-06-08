import { ChevronLeft, Clock3, Tags, User2 } from "lucide-react";
import { notFound } from "next/navigation";

import {
  getVideoLessonById,
  isVideoLessonGrade,
  type VideoLessonGrade,
} from "@/data/videoLessons";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CustomVideoPlayer } from "@/components/videos/CustomVideoPlayer";

type VideoLessonDetailPageProps = {
  params: Promise<{ grade: string; lessonId: string }>;
};

export default async function VideoLessonDetailPage(
  props: VideoLessonDetailPageProps,
) {
  const params = await props.params;

  if (!isVideoLessonGrade(params.grade)) {
    notFound();
  }

  const grade = Number(params.grade) as VideoLessonGrade;

  if (grade !== 7) {
    notFound();
  }

  const lesson = getVideoLessonById(grade, params.lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button href={`/videos/${grade}`} variant="ghost">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Артқа
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-2">
          <CardTitle>{lesson.title}</CardTitle>
          <CardText>{lesson.description}</CardText>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2">
            <User2 className="h-4 w-4 text-[#5b3ee4]" />
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-500">Мұғалім</p>
              <p className="text-xs font-bold text-slate-900">
                {lesson.teacherName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2">
            <Clock3 className="h-4 w-4 text-[#5b3ee4]" />
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-500">Ұзақтығы</p>
              <p className="text-xs font-bold text-slate-900">
                {lesson.duration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2">
            <Tags className="h-4 w-4 text-[#5b3ee4]" />
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-500">Тегтер</p>
              <p className="text-xs font-bold text-slate-900">
                {lesson.tags.length} тег
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-0">
        <CustomVideoPlayer
          src={lesson.videoSrc}
          posterSrc={lesson.posterSrc}
          title={`${lesson.title} — ${grade}-сынып`}
        />
      </Card>
    </div>
  );
}

