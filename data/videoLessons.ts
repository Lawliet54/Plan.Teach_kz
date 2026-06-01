export type VideoLessonLevel = "basic" | "medium" | "advanced";

export type VideoLesson = {
  id: string;
  title: string;
  description: string;
  grade: 7 | 8 | 9 | 10 | 11;
  level: VideoLessonLevel;
  topicSlug: string;
  duration: string;
  teacherName: string;
  tags: string[];
  // `videoSrc` must be a direct media URL/path to a `.mp4` or `.webm` file (local `/...`, remote `https://...`, or Supabase Storage public URL).
  videoSrc: string;
  posterSrc?: string;
};

export const videoLessons: VideoLesson[] = [
  {
    id: "video-lesson-1",
    title: "Кулон заңы",
    description:
      "Электр зарядтарының өзара әсерлесуі және Кулон заңының негізгі мағынасы түсіндіріледі.",
    grade: 7,
    level: "basic",
    topicSlug: "coulomb-law",
    duration: "Видео",
    teacherName: "Plan.Teach",
    tags: ["Кулон заңы", "Электр заряды", "Күш"],
    // TODO: Replace with real Supabase Storage public URL (direct `.mp4`/`.webm`) when available.
    videoSrc: "/videos/grade-7/lesson-01.mp4",
  },
  {
    id: "video-lesson-2",
    title: "Электр өрісі",
    description:
      "Электр өрісінің мағынасы, бағыты және зарядқа әсері қарастырылады.",
    grade: 7,
    level: "basic",
    topicSlug: "electric-field",
    duration: "Видео",
    teacherName: "Plan.Teach",
    tags: ["Электр өрісі", "Заряд", "Өріс"],
    // TODO: Replace with real Supabase Storage public URL (direct `.mp4`/`.webm`) when available.
    videoSrc: "/videos/grade-7/lesson-02.mp4",
  },
  {
    id: "video-lesson-3",
    title: "Ом заңы",
    description:
      "Ток күші, кернеу және кедергі арасындағы байланыс түсіндіріледі.",
    grade: 7,
    level: "medium",
    topicSlug: "ohm-law",
    duration: "Видео",
    teacherName: "Plan.Teach",
    tags: ["Ом заңы", "Ток", "Кернеу"],
    // TODO: Replace with real Supabase Storage public URL (direct `.mp4`/`.webm`) when available.
    videoSrc: "/videos/grade-7/lesson-03.mp4",
  },
  {
    id: "video-lesson-4",
    title: "Магнит өрісі",
    description:
      "Магнит өрісі, магнит күш сызықтары және тогы бар өткізгішке әсері түсіндіріледі.",
    grade: 7,
    level: "medium",
    topicSlug: "magnetic-field",
    duration: "Видео",
    teacherName: "Plan.Teach",
    tags: ["Магнит өрісі", "Ампер күші", "Өріс"],
    // TODO: Replace with real Supabase Storage public URL (direct `.mp4`/`.webm`) when available.
    videoSrc: "/videos/grade-7/lesson-04.mp4",
  },
  {
    id: "video-lesson-5",
    title: "Электромагниттік индукция",
    description:
      "Индукциялық токтың пайда болуы, магнит ағыны және Ленц ережесі түсіндіріледі.",
    grade: 7,
    level: "advanced",
    topicSlug: "electromagnetic-induction",
    duration: "Видео",
    teacherName: "Plan.Teach",
    tags: ["Индукция", "Ленц ережесі", "Магнит ағыны"],
    // TODO: Replace with real Supabase Storage public URL (direct `.mp4`/`.webm`) when available.
    videoSrc: "/videos/grade-7/lesson-05.mp4",
  },
];

export const videoLessonGrades = [7, 8, 9, 10, 11] as const;
export type VideoLessonGrade = (typeof videoLessonGrades)[number];

export function isVideoLessonGrade(value: string): value is `${VideoLessonGrade}` {
  return (videoLessonGrades as readonly number[]).some((grade) => String(grade) === value);
}

export function getVideoLessonsByGrade(grade: VideoLessonGrade) {
  return videoLessons.filter((lesson) => lesson.grade === grade);
}

export function getVideoLessonById(grade: VideoLessonGrade, lessonId: string) {
  return videoLessons.find((lesson) => lesson.grade === grade && lesson.id === lessonId) ?? null;
}
