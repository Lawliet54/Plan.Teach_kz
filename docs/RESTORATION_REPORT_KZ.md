# Plan.Teach_kz реставрациясы: техникалық есеп

## Негізгі архитектура

Жаңа негізгі оқу архитектурасы:

```text
Topic → Skill → Task → Attempt → Mastery → Recommendation → Review
```

## Қосылған миграциялар

- `016_adaptive_skill_architecture.sql` — skill mastery, prerequisite, remediation, review queue, learning events, lab submissions;
- `017_task_packs_and_cinematic_analytics.sql` — 50 кешенді жұмыс, secure task item view және task-pack attempts;
- `018_lab_catalog_seed.sql` — 5 виртуалды зертхана каталогы;
- `019_enriched_task_pack_content.sql` — күрделі тест, есеп, график, қате талдау және зертханалық сценарийлер;
- `020_server_write_only_rls.sql` — браузерден score/mastery өзгертуге тыйым салатын RLS hardening.

## Қосылған серверлік қабаттар

- `lib/adaptive-engine/*` — mastery есептеу, recommendation, review schedule және DB snapshot;
- `lib/supabase/admin.ts` — тек серверде қолданылатын service-role client;
- `app/api/learning/task-packs/[packId]/submit/route.ts` — secure submit және server-side answer checking;
- `app/api/teacher/task-pack-attempts/[attemptId]/review/route.ts` — мұғалім бағасы және teacher-student permission тексерісі;
- `app/api/labs/[slug]/route.ts` — зертхана нәтижесін сақтау.

## Қауіпсіздік

- `correct_answer` safe view ішіне кірмейді;
- frontend дұрыс жауаптарды алмайды;
- browser session жаңа score, mastery, recommendations және lab results кестелеріне тікелей жаза алмайды;
- trusted mutation тек server-only API арқылы өтеді;
- teacher бағалау кезінде оқушының сол мұғалімге байланысы серверде қайта тексеріледі;
- service-role кілті тек `.env.local` ішінде сақталады.

## Тексеру нәтижесі

Реставрацияланған source үшін:

```text
TypeScript: passed
ESLint: 0 errors, 0 warnings
Next.js production route generation: passed
Generated static pages: 41
```

Sandbox ортасында Next.js ішкі worker саны шектеліп route-generation тексерілді. Бұл source қатесі емес; локал Windows ортада қалыпты `npm run build` командасын қолданыңыз.
