import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Atom,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  Lightbulb,
  Play,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardText, CardTitle } from "@/components/ui/Card";
import { getStudentAdaptiveSnapshot } from "@/lib/adaptive-engine/queries";
import { getCurrentProfile, getStudentEntryPath } from "@/lib/auth";
import { getStudentPackAttempts, getTaskPacks } from "@/lib/taskPacks";

function average(values: number[]) {
  if (!values.length) return 0;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}

function getScoreClass(score: number) {
  if (score >= 75) return "bg-[var(--success)]";
  if (score >= 50) return "bg-[var(--warning)]";

  return "bg-[var(--danger)]";
}

function getResultBadge(
  reviewStatus: string | null | undefined,
  isCorrect: boolean | null | undefined
) {
  if (reviewStatus === "pending_review") {
    return {
      label: "Тексеруде",
      variant: "warning" as const,
    };
  }

  if (isCorrect === true) {
    return {
      label: "Дұрыс",
      variant: "success" as const,
    };
  }

  return {
    label: "Қайталау",
    variant: "danger" as const,
  };
}

function BrainHeroGraphic() {
  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="absolute inset-x-8 inset-y-10 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute right-8 top-10 h-28 w-28 rounded-full bg-indigo-300/18 blur-2xl" />

      <svg
        viewBox="0 0 460 340"
        className="relative h-auto w-full animate-float"
        role="img"
        aria-label="Жасанды интеллект миының детализацияланған иллюстрациясы"
      >
        <defs>
          <linearGradient
            id="brainHeroStroke"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#92efff" />
            <stop offset="45%" stopColor="#57d2ff" />
            <stop offset="100%" stopColor="#8d85ff" />
          </linearGradient>

          <linearGradient
            id="brainHeroFill"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#5cd6ff" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#5784ff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#9778ff" stopOpacity="0.24" />
          </linearGradient>

          <radialGradient id="brainHeroNode">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="42%" stopColor="#a5f3ff" />
            <stop offset="100%" stopColor="#55cfff" />
          </radialGradient>

          <filter id="brainHeroGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="brainHeroSoftGlow">
            <feGaussianBlur stdDeviation="10" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity="0.16">
          <circle cx="224" cy="170" r="132" fill="#62d8ff" />
          <circle cx="292" cy="138" r="98" fill="#7771ff" />
          <circle cx="154" cy="205" r="82" fill="#4fe0ff" />
        </g>

        <g
          opacity="0.3"
          stroke="#8deaff"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M20 48h74" />
          <path d="M20 70h42" />
          <path d="M28 286h62" />
          <path d="M370 48h70" />
          <path d="M398 70h42" />
          <path d="M380 284h58" />

          <path d="M54 112h42l20 20" />
          <path d="M36 218h48l26-22" />
          <path d="M350 104h46l22-18" />
          <path d="M356 230h42l22 20" />
        </g>

        <g
          fill="url(#brainHeroFill)"
          stroke="url(#brainHeroStroke)"
          strokeWidth="7"
          strokeLinejoin="round"
          filter="url(#brainHeroGlow)"
        >
          <path d="M221 60c-19-20-46-26-70-14-18 8-31 25-35 44-28 2-51 24-55 52-3 22 6 42 22 55-11 19-11 43 1 63 14 24 41 36 68 29 13 19 35 30 59 28 11-1 21-5 30-10V82c-5-8-12-16-20-22Z" />

          <path d="M239 60c19-20 46-26 70-14 18 8 31 25 35 44 28 2 51 24 55 52 3 22-6 42-22 55 11 19 11 43-1 63-14 24-41 36-68 29-13 19-35 30-59 28-11-1-21-5-30-10V82c5-8 12-16 20-22Z" />
        </g>

        <g
          fill="none"
          stroke="url(#brainHeroStroke)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.94"
        >
          <path d="M154 78c-17 9-25 24-22 40" />
          <path d="M110 115c20 1 35 9 45 24" />
          <path d="M89 158c23-7 47-2 63 13" />
          <path d="M98 205c18-9 41-6 56 8" />
          <path d="M132 251c15-13 35-17 53-10" />
          <path d="M176 64c9 10 14 23 13 36" />
          <path d="M176 115c17 10 24 25 21 42" />
          <path d="M159 166c20 6 32 18 37 36" />
          <path d="M178 221c15 8 23 20 24 34" />

          <path d="M306 78c17 9 25 24 22 40" />
          <path d="M350 115c-20 1-35 9-45 24" />
          <path d="M371 158c-23-7-47-2-63 13" />
          <path d="M362 205c-18-9-41-6-56 8" />
          <path d="M328 251c-15-13-35-17-53-10" />
          <path d="M284 64c-9 10-14 23-13 36" />
          <path d="M284 115c-17 10-24 25-21 42" />
          <path d="M301 166c-20 6-32 18-37 36" />
          <path d="M282 221c-15 8-23 20-24 34" />

          <path d="M230 80v221" />
          <path d="M207 107c11 7 18 17 23 29" />
          <path d="M253 107c-11 7-18 17-23 29" />
          <path d="M202 180c13 5 22 13 28 24" />
          <path d="M258 180c-13 5-22 13-28 24" />
          <path d="M204 262c11-5 19-13 26-24" />
          <path d="M256 262c-11-5-19-13-26-24" />
        </g>

        <g
          fill="none"
          stroke="#8deaff"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        >
          <path d="M73 126h44l18 14" />
          <path d="M63 184h47l24-16" />
          <path d="M76 245h44l24-18" />

          <path d="M387 126h-44l-18 14" />
          <path d="M397 184h-47l-24-16" />
          <path d="M384 245h-44l-24-18" />

          <path d="M183 42v24" />
          <path d="M230 28v34" />
          <path d="M277 42v24" />

          <path d="M183 294v22" />
          <path d="M230 302v26" />
          <path d="M277 294v22" />
        </g>

        <g fill="url(#brainHeroNode)" filter="url(#brainHeroSoftGlow)">
          <circle cx="70" cy="126" r="7" />
          <circle cx="60" cy="184" r="7" />
          <circle cx="73" cy="245" r="7" />

          <circle cx="390" cy="126" r="7" />
          <circle cx="400" cy="184" r="7" />
          <circle cx="387" cy="245" r="7" />

          <circle cx="183" cy="39" r="6" />
          <circle cx="230" cy="25" r="7" />
          <circle cx="277" cy="39" r="6" />

          <circle cx="183" cy="318" r="6" />
          <circle cx="230" cy="331" r="7" />
          <circle cx="277" cy="318" r="6" />
        </g>

        <g fill="url(#brainHeroNode)" filter="url(#brainHeroGlow)">
          <circle cx="135" cy="141" r="6" />
          <circle cx="154" cy="213" r="6" />
          <circle cx="196" cy="157" r="6" />
          <circle cx="202" cy="255" r="6" />

          <circle cx="325" cy="141" r="6" />
          <circle cx="306" cy="213" r="6" />
          <circle cx="264" cy="157" r="6" />
          <circle cx="258" cy="255" r="6" />

          <circle cx="230" cy="137" r="5" />
          <circle cx="230" cy="205" r="5" />
          <circle cx="230" cy="238" r="5" />
        </g>

        <g fill="#b7f5ff" opacity="0.9">
          <circle cx="45" cy="92" r="4" className="animate-node" />
          <circle cx="31" cy="156" r="5" className="animate-node" />
          <circle cx="46" cy="274" r="4" className="animate-node" />

          <circle cx="415" cy="94" r="4" className="animate-node" />
          <circle cx="430" cy="157" r="5" className="animate-node" />
          <circle cx="415" cy="274" r="4" className="animate-node" />
        </g>
      </svg>
    </div>
  );
}

const fallbackSkills = [
  "Механика",
  "Электродинамика",
  "Оптика",
  "Молекулалық физика",
  "Зерттеу дағдылары",
];

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const entryPath = getStudentEntryPath(profile);

  if (entryPath !== "/dashboard") {
    redirect(entryPath);
  }

  const grade = profile.current_grade ?? 7;

  const [snapshot, packs, packAttempts] = await Promise.all([
    getStudentAdaptiveSnapshot(profile.id),
    getTaskPacks(grade),
    getStudentPackAttempts(profile.id),
  ]);

  const displayName = profile.full_name?.split(" ")[0] || "Оқушы";

  const skillScores = snapshot.skills.map((skill) =>
    Number(skill.mastery_score)
  );

  const completedItemIds = new Set(
    packAttempts.map((attempt) => attempt.item_id)
  );

  const completedPackIds = new Set(
    packAttempts.map((attempt) => attempt.pack_id)
  );

  const totalExpectedItems = Math.max(packs.length * 16, 1);

  const overallProgress = Math.min(
    100,
    Math.round((completedItemIds.size / totalExpectedItems) * 100)
  );

  const correctAttempts = packAttempts.filter(
    (attempt) => attempt.is_correct === true
  ).length;

  const automaticallyChecked = packAttempts.filter(
    (attempt) => attempt.is_correct !== null
  ).length;

  const accuracy = automaticallyChecked
    ? Math.round((correctAttempts / automaticallyChecked) * 100)
    : 0;

  const continuePack =
    packs.find((pack) =>
      packAttempts.some((attempt) => attempt.pack_id === pack.id)
    ) ?? packs[0];

  const continueHref = continuePack
    ? `/tasks/packs/${continuePack.slug}`
    : "/tasks";

  const sortedSkills = [...snapshot.skills]
    .sort(
      (first, second) =>
        Number(second.mastery_score) - Number(first.mastery_score)
    )
    .slice(0, 5);

  const skillRows =
    sortedSkills.length > 0
      ? sortedSkills.map((skill) => ({
          title: skill.skill?.title ?? "Физикалық дағды",
          score: Math.round(Number(skill.mastery_score)),
        }))
      : fallbackSkills.map((title) => ({
          title,
          score: 0,
        }));

  const packMap = new Map(packs.map((pack) => [pack.id, pack]));

  const recentAttempts = [...packAttempts]
    .sort(
      (first, second) =>
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
    )
    .slice(0, 3);

  const personalTasks = [
    {
      title: "Жеңіл деңгей",
      description: "Негізгі формулаларды қайталау",
      count: packs.filter((pack) => pack.difficulty === "basic").length,
      icon: CheckCircle2,
      panelClass: "border-[#ccebdc] bg-[var(--green-soft)]",
      iconClass: "bg-[#d9f5e6] text-[var(--success)]",
      textClass: "text-[var(--success)]",
    },
    {
      title: "Орташа деңгей",
      description: "Есептер шығару дағдыларын бекіту",
      count: packs.filter((pack) => pack.difficulty === "intermediate").length,
      icon: Target,
      panelClass: "border-[#f2dfb8] bg-[var(--yellow-soft)]",
      iconClass: "bg-[#fff0c7] text-[var(--warning)]",
      textClass: "text-[var(--warning)]",
    },
    {
      title: "Күрделі деңгей",
      description: "Шығармашылық және зерттеу тапсырмалары",
      count: packs.filter((pack) => pack.difficulty === "advanced").length,
      icon: Sparkles,
      panelClass: "border-[#f1d2d7] bg-[var(--red-soft)]",
      iconClass: "bg-[#ffe1e5] text-[var(--danger)]",
      textClass: "text-[var(--danger)]",
    },
  ];

  return (
    <AppShell profile={profile} active="/dashboard">
      <div className="page-stack">
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,.82fr)]">
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[linear-gradient(118deg,#5142cf_0%,#4043c7_45%,#262665_100%)] p-5 text-white shadow-[0_18px_44px_rgba(45,38,131,.22)] sm:p-6">
            <div className="absolute inset-0 physics-grid opacity-15" />
            <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-cyan-300/12 blur-3xl" />
            <div className="absolute right-14 top-10 h-32 w-32 rounded-full bg-indigo-300/14 blur-3xl" />

            <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-center">
              <div className="max-w-xl">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/72">
                  <Atom className="h-3.5 w-3.5" />
                  Жеке оқу траекториясы
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
                  Сәлем, {displayName}! 👋
                </h1>

                <p className="mt-3 max-w-lg text-sm font-normal leading-7 text-white/82">
                  Plan.Teach_kz сіздің оқу әрекеттеріңізді талдап, жеке оқу
                  бағытыңызды қалыптастырады. Бүгін бір тақырыпты аяқтап,
                  әлсіз дағдыңызды бекітіңіз.
                </p>

                <Link
                  href={continueHref}
                  className="relative z-10 mt-6 inline-flex h-12 items-center gap-2 rounded-[14px] bg-white px-5 text-sm font-semibold text-[var(--primary)] shadow-[0_12px_28px_rgba(13,16,58,.18)] transition hover:-translate-y-0.5 hover:bg-[#f8f8ff]"
                >
                  Оқу траекториясын жалғастыру
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="hidden xl:block">
                <BrainHeroGraphic />
              </div>
            </div>
          </div>

          <Card className="flex flex-col justify-between p-4 sm:p-5">
            <div>
              <p className="text-base font-semibold text-[var(--text)]">
                Жалпы прогресс
              </p>

              <p className="mt-1 text-xs font-normal text-[var(--text-muted)]">
                Оқу бағдарламасының орындалу көрсеткіші
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
              <div className="mx-auto">
                <div
                  className="grid h-36 w-36 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${
                      overallProgress * 3.6
                    }deg, #ececfa 0deg)`,
                  }}
                >
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_var(--border-soft)]">
                    <div>
                      <p className="text-2xl font-semibold text-[var(--text)]">
                        {overallProgress}%
                      </p>

                      <p className="mt-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                        Аяқталды
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    label: "Ашылған тақырыптар",
                    value: completedPackIds.size,
                    color: "bg-[var(--primary)]",
                  },
                  {
                    label: "Орындалған тапсырмалар",
                    value: completedItemIds.size,
                    color: "bg-[var(--success)]",
                  },
                  {
                    label: "Дұрыс жауаптар",
                    value: `${accuracy}%`,
                    color: "bg-[var(--warning)]",
                  },
                  {
                    label: "Зертханалар",
                    value: snapshot.labs.length,
                    color: "bg-[var(--danger)]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="flex items-center gap-2 text-[var(--text-soft)]">
                      <span
                        className={`h-2 w-2 rounded-full ${item.color}`}
                      />
                      {item.label}
                    </span>

                    <b className="font-semibold text-[var(--text)]">
                      {item.value}
                    </b>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.42fr)_minmax(320px,.82fr)]">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Сыныпты таңдаңыз</CardTitle>

                <CardText className="mt-1 text-xs">
                  Қажетті сыныпты таңдаңыз. Әр сынып ішінде бөлімдер,
                  тақырыптар және деңгейге сәйкес тапсырмалар көрсетіледі.
                </CardText>
              </div>

              <Badge variant="primary">
                Қазіргі сынып: {grade}-сынып
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[7, 8, 9, 10, 11].map((gradeValue) => {
                const isCurrentGrade = gradeValue === grade;

                return (
                  <Link
                    key={gradeValue}
                    href={`/topics/${gradeValue}`}
                    className={`group rounded-[var(--radius-md)] border p-3 transition hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-sm)] ${
                      isCurrentGrade
                        ? "border-[var(--border-accent)] bg-[var(--purple-soft)]"
                        : "border-[var(--border)] bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] text-sm font-semibold ${
                          isCurrentGrade
                            ? "bg-[var(--primary)] text-white"
                            : "bg-[var(--surface-muted)] text-[var(--primary)]"
                        }`}
                      >
                        {gradeValue}
                      </span>

                      {isCurrentGrade ? (
                        <Badge variant="success">Белсенді</Badge>
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                      {gradeValue}-сынып
                    </p>

                    <p className="mt-1 text-xs font-normal leading-5 text-[var(--text-muted)]">
                      Физика тақырыптары мен тапсырмаларын ашу
                    </p>

                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                      Тақырыптарды көру
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>

          <div className="space-y-3">
            <Card>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--primary)]" />

                <CardTitle>Менің күшті және әлсіз жақтарым</CardTitle>
              </div>

              <div className="mt-4 space-y-3">
                {skillRows.map((skill) => (
                  <div key={skill.title}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-medium text-[var(--text-soft)]">
                        {skill.title}
                      </span>

                      <span className="font-semibold text-[var(--text)]">
                        {skill.score}%
                      </span>
                    </div>

                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className={`h-full rounded-full ${getScoreClass(
                          skill.score
                        )}`}
                        style={{
                          width: `${skill.score}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-[var(--primary)]" />

                  <CardTitle>Соңғы нәтижелерім</CardTitle>
                </div>

                <Link
                  href="/results"
                  className="text-[11px] font-semibold text-[var(--primary)]"
                >
                  Барлығын көру
                </Link>
              </div>

              <div className="mt-3 space-y-2">
                {recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt) => {
                    const pack = packMap.get(attempt.pack_id);

                    const result = getResultBadge(
                      attempt.review_status,
                      attempt.is_correct
                    );

                    return (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] pb-2 last:border-b-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-[var(--text)]">
                            {pack?.title ?? "Кешенді тапсырма"}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-[10px] font-normal text-[var(--text-muted)]">
                            <Clock3 className="h-3 w-3" />
                            {new Date(attempt.created_at).toLocaleString(
                              "kk-KZ"
                            )}
                          </p>
                        </div>

                        <Badge variant={result.variant}>
                          {result.label}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs font-normal leading-5 text-[var(--text-muted)]">
                    Тапсырма орындағаннан кейін соңғы нәтижелер осы жерде
                    көрінеді.
                  </p>
                )}
              </div>
            </Card>
          </div>
        </section>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] bg-[var(--purple-soft)] text-[var(--primary)]">
                <BrainCircuit className="h-5 w-5" />
              </span>

              <div>
                <CardTitle>AI ұсынған жеке тапсырмалар</CardTitle>

                <CardText className="mt-1 text-xs">
                  Жүйе оқушының деңгейіне сәйкес тапсырмалар санын және
                  күрделілігін бейімдейді.
                </CardText>
              </div>
            </div>

            <Button href="/ai" variant="secondary" size="sm">
              <Lightbulb className="h-3.5 w-3.5" />
              AI көмекшіге жазу
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {personalTasks.map((task) => {
              const Icon = task.icon;

              return (
                <div
                  key={task.title}
                  className={`rounded-[var(--radius-md)] border p-3 ${task.panelClass}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${task.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold ${task.textClass}`}
                      >
                        {task.title}
                      </p>

                      <p className="mt-1 text-xs font-normal leading-5 text-[var(--text-soft)]">
                        {task.description}
                      </p>

                      <p className="mt-2 text-[11px] font-medium text-[var(--text-muted)]">
                        {task.count} тапсырма кешені
                      </p>
                    </div>
                  </div>

                  <Button
                    href={`/tasks?grade=${grade}`}
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full bg-white/72"
                  >
                    Бастау
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: BookOpenCheck,
              title: "Оқу бағдарламасы",
              description: "Сыныптар мен тақырыптарды ашу",
              href: "/topics",
            },
            {
              icon: FlaskConical,
              title: "Виртуалды зертханалар",
              description: "Өлшеу, график және қорытынды",
              href: "/labs",
            },
            {
              icon: BarChart3,
              title: "Толық аналитика",
              description: "Прогресс пен әлсіз дағдыларды көру",
              href: "/analytics",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-accent)] group-hover:shadow-[var(--shadow-sm)]">
                  <Icon className="h-5 w-5 text-[var(--primary)]" />

                  <p className="mt-3 text-sm font-semibold text-[var(--text)]">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs font-normal leading-5 text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}

