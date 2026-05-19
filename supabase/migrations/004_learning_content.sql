-- =========================================================
-- Plan.Teach_kz
-- 004_learning_content.sql
-- KTZ based learning content schema
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. learning_sections
-- КТЖ ішіндегі ұзақ мерзімді жоспар бөлімдері:
-- Механикалық қозғалыс, Тығыздық, Қысым, Жылу құбылыстары, т.б.
-- =========================================================

create table if not exists public.learning_sections (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  title text not null,
  slug text not null,
  description text,

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, slug)
);

create index if not exists learning_sections_grade_idx
on public.learning_sections(grade);

create index if not exists learning_sections_active_idx
on public.learning_sections(is_active);

drop trigger if exists learning_sections_set_updated_at on public.learning_sections;

create trigger learning_sections_set_updated_at
before update on public.learning_sections
for each row
execute function public.set_updated_at();

-- =========================================================
-- 2. topics
-- Кәдімгі сабақ тақырыптары.
-- Қайталау және ТЖБ topic ретінде кірмейді.
-- БЖБ болса assessment_tag ретінде сақталады.
-- =========================================================

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  section_id uuid references public.learning_sections(id) on delete set null,

  title text not null,
  normalized_title text not null,
  slug text not null,

  description text,
  ktz_order int,
  hours int not null default 1,

  content_type text not null default 'lesson'
    check (content_type in ('lesson', 'placeholder')),

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  level text not null default 'beginner'
    check (level in ('beginner', 'intermediate', 'advanced')),

  has_bjb boolean not null default false,
  source_note text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, normalized_title)
);

create index if not exists topics_grade_idx
on public.topics(grade);

create index if not exists topics_section_id_idx
on public.topics(section_id);

create index if not exists topics_status_idx
on public.topics(content_status);

create index if not exists topics_level_idx
on public.topics(level);

create index if not exists topics_active_idx
on public.topics(is_active);

drop trigger if exists topics_set_updated_at on public.topics;

create trigger topics_set_updated_at
before update on public.topics
for each row
execute function public.set_updated_at();

-- =========================================================
-- 3. topic_objectives
-- Оқу мақсаттары: 7.1.1.1, 7.2.1.4 сияқты кодтар.
-- Қайталанған topic болса, objectives біріктіріледі.
-- =========================================================

create table if not exists public.topic_objectives (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid not null references public.topics(id) on delete cascade,

  objective_code text,
  objective_text text not null,

  created_at timestamptz not null default now(),

  unique (topic_id, objective_text)
);

create index if not exists topic_objectives_topic_id_idx
on public.topic_objectives(topic_id);

-- =========================================================
-- 4. topic_contents
-- Теория, формула, мысал, видео, AI prompt сияқты ішкі контент.
-- Алғашқы MVP-де әр деңгейге 5 ready topic, қалғаны placeholder.
-- =========================================================

create table if not exists public.topic_contents (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid not null references public.topics(id) on delete cascade,

  block_type text not null
    check (block_type in ('theory', 'formula', 'example', 'video', 'ai_prompt', 'note')),

  title text,
  body text,
  media_url text,

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists topic_contents_topic_id_idx
on public.topic_contents(topic_id);

create index if not exists topic_contents_block_type_idx
on public.topic_contents(block_type);

drop trigger if exists topic_contents_set_updated_at on public.topic_contents;

create trigger topic_contents_set_updated_at
before update on public.topic_contents
for each row
execute function public.set_updated_at();

-- =========================================================
-- 5. labs
-- КТЖ ішіндегі зертханалық жұмыстар.
-- Бұлар жеке индивидуалды lab/task ретінде беріледі.
-- =========================================================

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic_id uuid references public.topics(id) on delete set null,

  title text not null,
  normalized_title text not null,
  slug text not null,

  description text,
  instruction text,

  requires_table boolean not null default true,
  requires_graph boolean not null default true,
  requires_conclusion boolean not null default true,

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, normalized_title)
);

create index if not exists labs_grade_idx
on public.labs(grade);

create index if not exists labs_topic_id_idx
on public.labs(topic_id);

create index if not exists labs_status_idx
on public.labs(content_status);

drop trigger if exists labs_set_updated_at on public.labs;

create trigger labs_set_updated_at
before update on public.labs
for each row
execute function public.set_updated_at();

-- =========================================================
-- 6. project_tasks
-- КТЖ ішіндегі практикалық жұмыстар.
-- Бұлар жеке жобалық/шығармашылық тапсырма ретінде беріледі.
-- =========================================================

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic_id uuid references public.topics(id) on delete set null,

  title text not null,
  normalized_title text not null,
  slug text not null,

  description text,
  instruction text,

  submission_type text not null default 'mixed'
    check (submission_type in ('text', 'file', 'image', 'mixed')),

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  max_score int not null default 20,

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, normalized_title)
);

create index if not exists project_tasks_grade_idx
on public.project_tasks(grade);

create index if not exists project_tasks_topic_id_idx
on public.project_tasks(topic_id);

create index if not exists project_tasks_status_idx
on public.project_tasks(content_status);

drop trigger if exists project_tasks_set_updated_at on public.project_tasks;

create trigger project_tasks_set_updated_at
before update on public.project_tasks
for each row
execute function public.set_updated_at();

-- =========================================================
-- 7. assessments
-- БЖБ және ТЖБ.
-- ТЖБ topic ретінде кірмейді.
-- БЖБ topic ішінде has_bjb=true болып белгіленеді және мұнда бөлек assessment ретінде тұрады.
-- =========================================================

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic_id uuid references public.topics(id) on delete set null,

  assessment_type text not null
    check (assessment_type in ('bjb', 'tjb')),

  title text not null,
  term int check (term between 1 and 4),

  description text,
  max_score int not null default 20,

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_grade_idx
on public.assessments(grade);

create index if not exists assessments_topic_id_idx
on public.assessments(topic_id);

create index if not exists assessments_type_idx
on public.assessments(assessment_type);

drop trigger if exists assessments_set_updated_at on public.assessments;

create trigger assessments_set_updated_at
before update on public.assessments
for each row
execute function public.set_updated_at();

-- =========================================================
-- 8. RLS
-- =========================================================

alter table public.learning_sections enable row level security;
alter table public.topics enable row level security;
alter table public.topic_objectives enable row level security;
alter table public.topic_contents enable row level security;
alter table public.labs enable row level security;
alter table public.project_tasks enable row level security;
alter table public.assessments enable row level security;

-- learning_sections
drop policy if exists "learning_sections_select_authenticated" on public.learning_sections;
drop policy if exists "learning_sections_admin_all" on public.learning_sections;

create policy "learning_sections_select_authenticated"
on public.learning_sections
for select
to authenticated
using (is_active = true);

create policy "learning_sections_admin_all"
on public.learning_sections
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- topics
drop policy if exists "topics_select_authenticated" on public.topics;
drop policy if exists "topics_admin_all" on public.topics;

create policy "topics_select_authenticated"
on public.topics
for select
to authenticated
using (is_active = true);

create policy "topics_admin_all"
on public.topics
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- topic_objectives
drop policy if exists "topic_objectives_select_authenticated" on public.topic_objectives;
drop policy if exists "topic_objectives_admin_all" on public.topic_objectives;

create policy "topic_objectives_select_authenticated"
on public.topic_objectives
for select
to authenticated
using (
  exists (
    select 1
    from public.topics t
    where t.id = topic_objectives.topic_id
      and t.is_active = true
  )
);

create policy "topic_objectives_admin_all"
on public.topic_objectives
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- topic_contents
drop policy if exists "topic_contents_select_authenticated" on public.topic_contents;
drop policy if exists "topic_contents_admin_all" on public.topic_contents;

create policy "topic_contents_select_authenticated"
on public.topic_contents
for select
to authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.topics t
    where t.id = topic_contents.topic_id
      and t.is_active = true
  )
);

create policy "topic_contents_admin_all"
on public.topic_contents
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- labs
drop policy if exists "labs_select_authenticated" on public.labs;
drop policy if exists "labs_admin_all" on public.labs;

create policy "labs_select_authenticated"
on public.labs
for select
to authenticated
using (is_active = true);

create policy "labs_admin_all"
on public.labs
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- project_tasks
drop policy if exists "project_tasks_select_authenticated" on public.project_tasks;
drop policy if exists "project_tasks_admin_all" on public.project_tasks;

create policy "project_tasks_select_authenticated"
on public.project_tasks
for select
to authenticated
using (is_active = true);

create policy "project_tasks_admin_all"
on public.project_tasks
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- assessments
drop policy if exists "assessments_select_authenticated" on public.assessments;
drop policy if exists "assessments_admin_all" on public.assessments;

create policy "assessments_select_authenticated"
on public.assessments
for select
to authenticated
using (is_active = true);

create policy "assessments_admin_all"
on public.assessments
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- =========================================================
-- 9. Small seed for 7 grade
-- Бұл толық КТЖ import емес. Тек schema тексеруге арналған бастапқы seed.
-- =========================================================

insert into public.learning_sections (grade, title, slug, description, order_index)
values
(7, 'Физика – табиғат туралы ғылым', 'grade-7-physics-nature', 'Физика пәніне кіріспе және ғылыми әдістер.', 1),
(7, 'Физикалық шамалар мен өлшеулер', 'grade-7-measurements', 'Физикалық шамалар, SI жүйесі және өлшеу дәлдігі.', 2),
(7, 'Механикалық қозғалыс', 'grade-7-mechanical-motion', 'Қозғалыс, санақ жүйесі, жылдамдық және графиктер.', 3),
(7, 'Тығыздық', 'grade-7-density', 'Масса, көлем және тығыздық ұғымдары.', 4),
(7, 'Қысым', 'grade-7-pressure', 'Қатты дене, сұйық және газ қысымы.', 5)
on conflict (grade, slug) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  updated_at = now();

-- 5 ready topic
insert into public.topics (
  grade,
  section_id,
  title,
  normalized_title,
  slug,
  description,
  ktz_order,
  content_type,
  content_status,
  level,
  has_bjb,
  source_note
)
values
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-physics-nature'),
  'Физика – табиғат туралы ғылым',
  lower('Физика – табиғат туралы ғылым'),
  'grade-7-physics-nature',
  'Физика нені зерттейтінін және физикалық құбылыстардың мағынасын түсіндіретін бастапқы тақырып.',
  1,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-physics-nature'),
  'Табиғатты зерттеудің ғылыми әдістері',
  lower('Табиғатты зерттеудің ғылыми әдістері'),
  'grade-7-scientific-methods',
  'Бақылау, болжам, тәжірибе және қорытынды жасау кезеңдерін үйрететін тақырып.',
  2,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-measurements'),
  'Халықаралық бірліктер жүйесі (SI)',
  lower('Халықаралық бірліктер жүйесі (SI)'),
  'grade-7-si-units',
  'Физикалық шамаларды SI жүйесіндегі өлшем бірліктерімен сәйкестендіру.',
  3,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-measurements'),
  'Скаляр және векторлық физикалық шама',
  lower('Скаляр және векторлық физикалық шама'),
  'grade-7-scalar-vector',
  'Скаляр және векторлық шамаларды ажырату және мысалдар келтіру.',
  4,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-mechanical-motion'),
  'Жылдамдық және орташа жылдамдықты есептеу',
  lower('Жылдамдық және орташа жылдамдықты есептеу'),
  'grade-7-speed-average-speed',
  'Қозғалыстағы дененің жылдамдығы мен орташа жылдамдығын есептеу.',
  11,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade; duplicate merged'
)
on conflict (grade, normalized_title) do update set
  section_id = excluded.section_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  ktz_order = excluded.ktz_order,
  content_status = excluded.content_status,
  level = excluded.level,
  has_bjb = excluded.has_bjb,
  source_note = excluded.source_note,
  updated_at = now();

-- 7 grade placeholder examples
insert into public.topics (
  grade,
  section_id,
  title,
  normalized_title,
  slug,
  description,
  ktz_order,
  content_type,
  content_status,
  level,
  has_bjb,
  source_note
)
values
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-density'),
  'Масса және денелердің массасын өлшеу',
  lower('Масса және денелердің массасын өлшеу'),
  'grade-7-mass-measurement',
  null,
  17,
  'placeholder',
  'placeholder',
  'beginner',
  false,
  'KTZ 7 grade placeholder'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-density'),
  'Заттың тығыздығы және тығыздықтың өлшем бірлігі',
  lower('Заттың тығыздығы және тығыздықтың өлшем бірлігі'),
  'grade-7-density-unit',
  null,
  19,
  'placeholder',
  'placeholder',
  'beginner',
  false,
  'KTZ 7 grade placeholder'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-pressure'),
  'Қатты денелердегі қысым',
  lower('Қатты денелердегі қысым'),
  'grade-7-solid-pressure',
  null,
  34,
  'placeholder',
  'placeholder',
  'beginner',
  false,
  'KTZ 7 grade placeholder'
)
on conflict (grade, normalized_title) do update set
  section_id = excluded.section_id,
  title = excluded.title,
  slug = excluded.slug,
  ktz_order = excluded.ktz_order,
  content_type = excluded.content_type,
  content_status = excluded.content_status,
  updated_at = now();

-- Objectives for ready topics
insert into public.topic_objectives (topic_id, objective_code, objective_text)
values
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Физика – табиғат туралы ғылым')),
  '7.1.1.1',
  'Физикалық құбылыстарға мысалдар келтіру'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Табиғатты зерттеудің ғылыми әдістері')),
  '7.1.1.2',
  'Табиғатты зерттеудің ғылыми әдістерін ажырату'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  '7.1.2.1',
  'Физикалық шамаларды олардың SI жүйесіндегі өлшем бірліктерімен сәйкестендіру'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Скаляр және векторлық физикалық шама')),
  '7.1.2.2',
  'Скаляр және векторлық физикалық шамаларды ажырату және мысалдар келтіру'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Жылдамдық және орташа жылдамдықты есептеу')),
  '7.2.1.4',
  'Қозғалыстағы дененің жылдамдығы мен орташа жылдамдығын есептеу'
)
on conflict (topic_id, objective_text) do nothing;

-- Theory contents for 5 ready topics
insert into public.topic_contents (topic_id, block_type, title, body, order_index)
values
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Физика – табиғат туралы ғылым')),
  'theory',
  'Қысқаша теория',
  'Физика — табиғат құбылыстарын зерттейтін ғылым. Ол денелердің қозғалысын, күшті, энергияны, жарықты, жылуды, электр және магнит құбылыстарын түсіндіреді. Физика күнделікті өмірде кездесетін көптеген жағдайдың себебін анықтауға көмектеседі.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Табиғатты зерттеудің ғылыми әдістері')),
  'theory',
  'Ғылыми әдіс',
  'Ғылыми әдіс — табиғатты түсіну үшін қолданылатын жүйелі жол. Ол бақылау, сұрақ қою, болжам жасау, тәжірибе жүргізу, нәтижені талдау және қорытынды жасаудан тұрады.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'theory',
  'SI жүйесі',
  'SI — физикалық шамаларды бірдей өлшеуге арналған халықаралық бірліктер жүйесі. Мысалы, ұзындық метрмен, масса килограмммен, уақыт секундпен өлшенеді.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Скаляр және векторлық физикалық шама')),
  'theory',
  'Скаляр және вектор',
  'Скаляр шама тек сан мәнімен сипатталады. Мысалы: масса, уақыт, температура. Векторлық шама сан мәнімен қатар бағытқа да ие. Мысалы: күш, жылдамдық, орын ауыстыру.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Жылдамдық және орташа жылдамдықты есептеу')),
  'formula',
  'Жылдамдық формуласы',
  'Жылдамдық жолдың уақытқа қатынасымен анықталады: v = s / t. Мұнда v — жылдамдық, s — жол, t — уақыт.',
  1
);

-- Labs seed
insert into public.labs (
  grade,
  topic_id,
  title,
  normalized_title,
  slug,
  description,
  instruction,
  content_status,
  order_index
)
values
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'Физикалық шамаларды өлшеу',
  lower('Физикалық шамаларды өлшеу'),
  'grade-7-lab-measuring-physical-quantities',
  'Оқушы ұзындық, көлем, температура және уақытты өлшейді.',
  'Өлшеу құралын таңдаңыз, шкала бөлік құнын анықтаңыз, өлшеу нәтижесін кестеге енгізіңіз және қорытынды жазыңыз.',
  'ready',
  1
),
(
  7,
  null,
  'Кішкентай денелердің өлшемін анықтау',
  lower('Кішкентай денелердің өлшемін анықтау'),
  'grade-7-lab-small-body-size',
  'Қатарлау әдісі арқылы кішкентай дененің өлшемін анықтау.',
  null,
  'placeholder',
  2
),
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Заттың тығыздығы және тығыздықтың өлшем бірлігі')),
  'Сұйықтар мен қатты денелердің тығыздығын анықтау',
  lower('Сұйықтар мен қатты денелердің тығыздығын анықтау'),
  'grade-7-lab-density-liquid-solid',
  'Масса мен көлем арқылы тығыздықты тәжірибе жүзінде анықтау.',
  null,
  'placeholder',
  3
)
on conflict (grade, normalized_title) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  instruction = excluded.instruction,
  content_status = excluded.content_status,
  updated_at = now();

-- Project task seed
insert into public.project_tasks (
  grade,
  topic_id,
  title,
  normalized_title,
  slug,
  description,
  instruction,
  submission_type,
  content_status,
  order_index
)
values
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'Аспап шкаласындағы бөліктің құнын анықтау',
  lower('Аспап шкаласындағы бөліктің құнын анықтау'),
  'grade-7-project-scale-division',
  'Оқушы өлшеу аспабының шкаласын қарап, бір бөлік құнын анықтайды.',
  'Берілген аспап шкаласын талдаңыз. Екі көрші сандық белгі арасындағы аралықты және ұсақ бөліктер санын анықтап, бір бөлік құнын есептеңіз.',
  'mixed',
  'ready',
  1
),
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Жылдамдық және орташа жылдамдықты есептеу')),
  'Координатаның уақытқа тәуелділік графигін зерттеу',
  lower('Координатаның уақытқа тәуелділік графигін зерттеу'),
  'grade-7-project-coordinate-time-graph',
  'Қозғалыс графигін оқып, дененің қозғалыс түрін сипаттау.',
  null,
  'mixed',
  'placeholder',
  2
)
on conflict (grade, normalized_title) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  instruction = excluded.instruction,
  content_status = excluded.content_status,
  updated_at = now();

-- Assessment seed
insert into public.assessments (
  grade,
  topic_id,
  assessment_type,
  title,
  term,
  description,
  content_status,
  order_index
)
values
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'bjb',
  'БЖБ №1: Физикалық шамалар мен өлшеулер',
  1,
  'Физикалық шамалар, SI жүйесі, өлшеу дәлдігі және зертханалық қауіпсіздік бойынша бөлімдік бағалау.',
  'placeholder',
  1
),
(
  7,
  null,
  'tjb',
  'ТЖБ №1',
  1,
  '1-тоқсан бойынша жиынтық бағалау.',
  'placeholder',
  2
)
on conflict do nothing;-- =========================================================
-- Plan.Teach_kz
-- 004_learning_content.sql
-- KTZ based learning content schema
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. learning_sections
-- КТЖ ішіндегі ұзақ мерзімді жоспар бөлімдері:
-- Механикалық қозғалыс, Тығыздық, Қысым, Жылу құбылыстары, т.б.
-- =========================================================

create table if not exists public.learning_sections (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  title text not null,
  slug text not null,
  description text,

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, slug)
);

create index if not exists learning_sections_grade_idx
on public.learning_sections(grade);

create index if not exists learning_sections_active_idx
on public.learning_sections(is_active);

drop trigger if exists learning_sections_set_updated_at on public.learning_sections;

create trigger learning_sections_set_updated_at
before update on public.learning_sections
for each row
execute function public.set_updated_at();

-- =========================================================
-- 2. topics
-- Кәдімгі сабақ тақырыптары.
-- Қайталау және ТЖБ topic ретінде кірмейді.
-- БЖБ болса assessment_tag ретінде сақталады.
-- =========================================================

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  section_id uuid references public.learning_sections(id) on delete set null,

  title text not null,
  normalized_title text not null,
  slug text not null,

  description text,
  ktz_order int,
  hours int not null default 1,

  content_type text not null default 'lesson'
    check (content_type in ('lesson', 'placeholder')),

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  level text not null default 'beginner'
    check (level in ('beginner', 'intermediate', 'advanced')),

  has_bjb boolean not null default false,
  source_note text,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, normalized_title)
);

create index if not exists topics_grade_idx
on public.topics(grade);

create index if not exists topics_section_id_idx
on public.topics(section_id);

create index if not exists topics_status_idx
on public.topics(content_status);

create index if not exists topics_level_idx
on public.topics(level);

create index if not exists topics_active_idx
on public.topics(is_active);

drop trigger if exists topics_set_updated_at on public.topics;

create trigger topics_set_updated_at
before update on public.topics
for each row
execute function public.set_updated_at();

-- =========================================================
-- 3. topic_objectives
-- Оқу мақсаттары: 7.1.1.1, 7.2.1.4 сияқты кодтар.
-- Қайталанған topic болса, objectives біріктіріледі.
-- =========================================================

create table if not exists public.topic_objectives (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid not null references public.topics(id) on delete cascade,

  objective_code text,
  objective_text text not null,

  created_at timestamptz not null default now(),

  unique (topic_id, objective_text)
);

create index if not exists topic_objectives_topic_id_idx
on public.topic_objectives(topic_id);

-- =========================================================
-- 4. topic_contents
-- Теория, формула, мысал, видео, AI prompt сияқты ішкі контент.
-- Алғашқы MVP-де әр деңгейге 5 ready topic, қалғаны placeholder.
-- =========================================================

create table if not exists public.topic_contents (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid not null references public.topics(id) on delete cascade,

  block_type text not null
    check (block_type in ('theory', 'formula', 'example', 'video', 'ai_prompt', 'note')),

  title text,
  body text,
  media_url text,

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists topic_contents_topic_id_idx
on public.topic_contents(topic_id);

create index if not exists topic_contents_block_type_idx
on public.topic_contents(block_type);

drop trigger if exists topic_contents_set_updated_at on public.topic_contents;

create trigger topic_contents_set_updated_at
before update on public.topic_contents
for each row
execute function public.set_updated_at();

-- =========================================================
-- 5. labs
-- КТЖ ішіндегі зертханалық жұмыстар.
-- Бұлар жеке индивидуалды lab/task ретінде беріледі.
-- =========================================================

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic_id uuid references public.topics(id) on delete set null,

  title text not null,
  normalized_title text not null,
  slug text not null,

  description text,
  instruction text,

  requires_table boolean not null default true,
  requires_graph boolean not null default true,
  requires_conclusion boolean not null default true,

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, normalized_title)
);

create index if not exists labs_grade_idx
on public.labs(grade);

create index if not exists labs_topic_id_idx
on public.labs(topic_id);

create index if not exists labs_status_idx
on public.labs(content_status);

drop trigger if exists labs_set_updated_at on public.labs;

create trigger labs_set_updated_at
before update on public.labs
for each row
execute function public.set_updated_at();

-- =========================================================
-- 6. project_tasks
-- КТЖ ішіндегі практикалық жұмыстар.
-- Бұлар жеке жобалық/шығармашылық тапсырма ретінде беріледі.
-- =========================================================

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic_id uuid references public.topics(id) on delete set null,

  title text not null,
  normalized_title text not null,
  slug text not null,

  description text,
  instruction text,

  submission_type text not null default 'mixed'
    check (submission_type in ('text', 'file', 'image', 'mixed')),

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  max_score int not null default 20,

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, normalized_title)
);

create index if not exists project_tasks_grade_idx
on public.project_tasks(grade);

create index if not exists project_tasks_topic_id_idx
on public.project_tasks(topic_id);

create index if not exists project_tasks_status_idx
on public.project_tasks(content_status);

drop trigger if exists project_tasks_set_updated_at on public.project_tasks;

create trigger project_tasks_set_updated_at
before update on public.project_tasks
for each row
execute function public.set_updated_at();

-- =========================================================
-- 7. assessments
-- БЖБ және ТЖБ.
-- ТЖБ topic ретінде кірмейді.
-- БЖБ topic ішінде has_bjb=true болып белгіленеді және мұнда бөлек assessment ретінде тұрады.
-- =========================================================

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),

  grade int not null check (grade between 7 and 11),
  topic_id uuid references public.topics(id) on delete set null,

  assessment_type text not null
    check (assessment_type in ('bjb', 'tjb')),

  title text not null,
  term int check (term between 1 and 4),

  description text,
  max_score int not null default 20,

  content_status text not null default 'placeholder'
    check (content_status in ('ready', 'partial', 'placeholder')),

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assessments_grade_idx
on public.assessments(grade);

create index if not exists assessments_topic_id_idx
on public.assessments(topic_id);

create index if not exists assessments_type_idx
on public.assessments(assessment_type);

drop trigger if exists assessments_set_updated_at on public.assessments;

create trigger assessments_set_updated_at
before update on public.assessments
for each row
execute function public.set_updated_at();

-- =========================================================
-- 8. RLS
-- =========================================================

alter table public.learning_sections enable row level security;
alter table public.topics enable row level security;
alter table public.topic_objectives enable row level security;
alter table public.topic_contents enable row level security;
alter table public.labs enable row level security;
alter table public.project_tasks enable row level security;
alter table public.assessments enable row level security;

-- learning_sections
drop policy if exists "learning_sections_select_authenticated" on public.learning_sections;
drop policy if exists "learning_sections_admin_all" on public.learning_sections;

create policy "learning_sections_select_authenticated"
on public.learning_sections
for select
to authenticated
using (is_active = true);

create policy "learning_sections_admin_all"
on public.learning_sections
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- topics
drop policy if exists "topics_select_authenticated" on public.topics;
drop policy if exists "topics_admin_all" on public.topics;

create policy "topics_select_authenticated"
on public.topics
for select
to authenticated
using (is_active = true);

create policy "topics_admin_all"
on public.topics
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- topic_objectives
drop policy if exists "topic_objectives_select_authenticated" on public.topic_objectives;
drop policy if exists "topic_objectives_admin_all" on public.topic_objectives;

create policy "topic_objectives_select_authenticated"
on public.topic_objectives
for select
to authenticated
using (
  exists (
    select 1
    from public.topics t
    where t.id = topic_objectives.topic_id
      and t.is_active = true
  )
);

create policy "topic_objectives_admin_all"
on public.topic_objectives
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- topic_contents
drop policy if exists "topic_contents_select_authenticated" on public.topic_contents;
drop policy if exists "topic_contents_admin_all" on public.topic_contents;

create policy "topic_contents_select_authenticated"
on public.topic_contents
for select
to authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.topics t
    where t.id = topic_contents.topic_id
      and t.is_active = true
  )
);

create policy "topic_contents_admin_all"
on public.topic_contents
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- labs
drop policy if exists "labs_select_authenticated" on public.labs;
drop policy if exists "labs_admin_all" on public.labs;

create policy "labs_select_authenticated"
on public.labs
for select
to authenticated
using (is_active = true);

create policy "labs_admin_all"
on public.labs
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- project_tasks
drop policy if exists "project_tasks_select_authenticated" on public.project_tasks;
drop policy if exists "project_tasks_admin_all" on public.project_tasks;

create policy "project_tasks_select_authenticated"
on public.project_tasks
for select
to authenticated
using (is_active = true);

create policy "project_tasks_admin_all"
on public.project_tasks
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- assessments
drop policy if exists "assessments_select_authenticated" on public.assessments;
drop policy if exists "assessments_admin_all" on public.assessments;

create policy "assessments_select_authenticated"
on public.assessments
for select
to authenticated
using (is_active = true);

create policy "assessments_admin_all"
on public.assessments
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- =========================================================
-- 9. Small seed for 7 grade
-- Бұл толық КТЖ import емес. Тек schema тексеруге арналған бастапқы seed.
-- =========================================================

insert into public.learning_sections (grade, title, slug, description, order_index)
values
(7, 'Физика – табиғат туралы ғылым', 'grade-7-physics-nature', 'Физика пәніне кіріспе және ғылыми әдістер.', 1),
(7, 'Физикалық шамалар мен өлшеулер', 'grade-7-measurements', 'Физикалық шамалар, SI жүйесі және өлшеу дәлдігі.', 2),
(7, 'Механикалық қозғалыс', 'grade-7-mechanical-motion', 'Қозғалыс, санақ жүйесі, жылдамдық және графиктер.', 3),
(7, 'Тығыздық', 'grade-7-density', 'Масса, көлем және тығыздық ұғымдары.', 4),
(7, 'Қысым', 'grade-7-pressure', 'Қатты дене, сұйық және газ қысымы.', 5)
on conflict (grade, slug) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  updated_at = now();

-- 5 ready topic
insert into public.topics (
  grade,
  section_id,
  title,
  normalized_title,
  slug,
  description,
  ktz_order,
  content_type,
  content_status,
  level,
  has_bjb,
  source_note
)
values
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-physics-nature'),
  'Физика – табиғат туралы ғылым',
  lower('Физика – табиғат туралы ғылым'),
  'grade-7-physics-nature',
  'Физика нені зерттейтінін және физикалық құбылыстардың мағынасын түсіндіретін бастапқы тақырып.',
  1,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-physics-nature'),
  'Табиғатты зерттеудің ғылыми әдістері',
  lower('Табиғатты зерттеудің ғылыми әдістері'),
  'grade-7-scientific-methods',
  'Бақылау, болжам, тәжірибе және қорытынды жасау кезеңдерін үйрететін тақырып.',
  2,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-measurements'),
  'Халықаралық бірліктер жүйесі (SI)',
  lower('Халықаралық бірліктер жүйесі (SI)'),
  'grade-7-si-units',
  'Физикалық шамаларды SI жүйесіндегі өлшем бірліктерімен сәйкестендіру.',
  3,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-measurements'),
  'Скаляр және векторлық физикалық шама',
  lower('Скаляр және векторлық физикалық шама'),
  'grade-7-scalar-vector',
  'Скаляр және векторлық шамаларды ажырату және мысалдар келтіру.',
  4,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-mechanical-motion'),
  'Жылдамдық және орташа жылдамдықты есептеу',
  lower('Жылдамдық және орташа жылдамдықты есептеу'),
  'grade-7-speed-average-speed',
  'Қозғалыстағы дененің жылдамдығы мен орташа жылдамдығын есептеу.',
  11,
  'lesson',
  'ready',
  'beginner',
  false,
  'KTZ 7 grade; duplicate merged'
)
on conflict (grade, normalized_title) do update set
  section_id = excluded.section_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  ktz_order = excluded.ktz_order,
  content_status = excluded.content_status,
  level = excluded.level,
  has_bjb = excluded.has_bjb,
  source_note = excluded.source_note,
  updated_at = now();

-- 7 grade placeholder examples
insert into public.topics (
  grade,
  section_id,
  title,
  normalized_title,
  slug,
  description,
  ktz_order,
  content_type,
  content_status,
  level,
  has_bjb,
  source_note
)
values
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-density'),
  'Масса және денелердің массасын өлшеу',
  lower('Масса және денелердің массасын өлшеу'),
  'grade-7-mass-measurement',
  null,
  17,
  'placeholder',
  'placeholder',
  'beginner',
  false,
  'KTZ 7 grade placeholder'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-density'),
  'Заттың тығыздығы және тығыздықтың өлшем бірлігі',
  lower('Заттың тығыздығы және тығыздықтың өлшем бірлігі'),
  'grade-7-density-unit',
  null,
  19,
  'placeholder',
  'placeholder',
  'beginner',
  false,
  'KTZ 7 grade placeholder'
),
(
  7,
  (select id from public.learning_sections where grade = 7 and slug = 'grade-7-pressure'),
  'Қатты денелердегі қысым',
  lower('Қатты денелердегі қысым'),
  'grade-7-solid-pressure',
  null,
  34,
  'placeholder',
  'placeholder',
  'beginner',
  false,
  'KTZ 7 grade placeholder'
)
on conflict (grade, normalized_title) do update set
  section_id = excluded.section_id,
  title = excluded.title,
  slug = excluded.slug,
  ktz_order = excluded.ktz_order,
  content_type = excluded.content_type,
  content_status = excluded.content_status,
  updated_at = now();

-- Objectives for ready topics
insert into public.topic_objectives (topic_id, objective_code, objective_text)
values
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Физика – табиғат туралы ғылым')),
  '7.1.1.1',
  'Физикалық құбылыстарға мысалдар келтіру'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Табиғатты зерттеудің ғылыми әдістері')),
  '7.1.1.2',
  'Табиғатты зерттеудің ғылыми әдістерін ажырату'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  '7.1.2.1',
  'Физикалық шамаларды олардың SI жүйесіндегі өлшем бірліктерімен сәйкестендіру'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Скаляр және векторлық физикалық шама')),
  '7.1.2.2',
  'Скаляр және векторлық физикалық шамаларды ажырату және мысалдар келтіру'
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Жылдамдық және орташа жылдамдықты есептеу')),
  '7.2.1.4',
  'Қозғалыстағы дененің жылдамдығы мен орташа жылдамдығын есептеу'
)
on conflict (topic_id, objective_text) do nothing;

-- Theory contents for 5 ready topics
insert into public.topic_contents (topic_id, block_type, title, body, order_index)
values
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Физика – табиғат туралы ғылым')),
  'theory',
  'Қысқаша теория',
  'Физика — табиғат құбылыстарын зерттейтін ғылым. Ол денелердің қозғалысын, күшті, энергияны, жарықты, жылуды, электр және магнит құбылыстарын түсіндіреді. Физика күнделікті өмірде кездесетін көптеген жағдайдың себебін анықтауға көмектеседі.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Табиғатты зерттеудің ғылыми әдістері')),
  'theory',
  'Ғылыми әдіс',
  'Ғылыми әдіс — табиғатты түсіну үшін қолданылатын жүйелі жол. Ол бақылау, сұрақ қою, болжам жасау, тәжірибе жүргізу, нәтижені талдау және қорытынды жасаудан тұрады.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'theory',
  'SI жүйесі',
  'SI — физикалық шамаларды бірдей өлшеуге арналған халықаралық бірліктер жүйесі. Мысалы, ұзындық метрмен, масса килограмммен, уақыт секундпен өлшенеді.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Скаляр және векторлық физикалық шама')),
  'theory',
  'Скаляр және вектор',
  'Скаляр шама тек сан мәнімен сипатталады. Мысалы: масса, уақыт, температура. Векторлық шама сан мәнімен қатар бағытқа да ие. Мысалы: күш, жылдамдық, орын ауыстыру.',
  1
),
(
  (select id from public.topics where grade = 7 and normalized_title = lower('Жылдамдық және орташа жылдамдықты есептеу')),
  'formula',
  'Жылдамдық формуласы',
  'Жылдамдық жолдың уақытқа қатынасымен анықталады: v = s / t. Мұнда v — жылдамдық, s — жол, t — уақыт.',
  1
);

-- Labs seed
insert into public.labs (
  grade,
  topic_id,
  title,
  normalized_title,
  slug,
  description,
  instruction,
  content_status,
  order_index
)
values
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'Физикалық шамаларды өлшеу',
  lower('Физикалық шамаларды өлшеу'),
  'grade-7-lab-measuring-physical-quantities',
  'Оқушы ұзындық, көлем, температура және уақытты өлшейді.',
  'Өлшеу құралын таңдаңыз, шкала бөлік құнын анықтаңыз, өлшеу нәтижесін кестеге енгізіңіз және қорытынды жазыңыз.',
  'ready',
  1
),
(
  7,
  null,
  'Кішкентай денелердің өлшемін анықтау',
  lower('Кішкентай денелердің өлшемін анықтау'),
  'grade-7-lab-small-body-size',
  'Қатарлау әдісі арқылы кішкентай дененің өлшемін анықтау.',
  null,
  'placeholder',
  2
),
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Заттың тығыздығы және тығыздықтың өлшем бірлігі')),
  'Сұйықтар мен қатты денелердің тығыздығын анықтау',
  lower('Сұйықтар мен қатты денелердің тығыздығын анықтау'),
  'grade-7-lab-density-liquid-solid',
  'Масса мен көлем арқылы тығыздықты тәжірибе жүзінде анықтау.',
  null,
  'placeholder',
  3
)
on conflict (grade, normalized_title) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  instruction = excluded.instruction,
  content_status = excluded.content_status,
  updated_at = now();

-- Project task seed
insert into public.project_tasks (
  grade,
  topic_id,
  title,
  normalized_title,
  slug,
  description,
  instruction,
  submission_type,
  content_status,
  order_index
)
values
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'Аспап шкаласындағы бөліктің құнын анықтау',
  lower('Аспап шкаласындағы бөліктің құнын анықтау'),
  'grade-7-project-scale-division',
  'Оқушы өлшеу аспабының шкаласын қарап, бір бөлік құнын анықтайды.',
  'Берілген аспап шкаласын талдаңыз. Екі көрші сандық белгі арасындағы аралықты және ұсақ бөліктер санын анықтап, бір бөлік құнын есептеңіз.',
  'mixed',
  'ready',
  1
),
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Жылдамдық және орташа жылдамдықты есептеу')),
  'Координатаның уақытқа тәуелділік графигін зерттеу',
  lower('Координатаның уақытқа тәуелділік графигін зерттеу'),
  'grade-7-project-coordinate-time-graph',
  'Қозғалыс графигін оқып, дененің қозғалыс түрін сипаттау.',
  null,
  'mixed',
  'placeholder',
  2
)
on conflict (grade, normalized_title) do update set
  topic_id = excluded.topic_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  instruction = excluded.instruction,
  content_status = excluded.content_status,
  updated_at = now();

-- Assessment seed
insert into public.assessments (
  grade,
  topic_id,
  assessment_type,
  title,
  term,
  description,
  content_status,
  order_index
)
values
(
  7,
  (select id from public.topics where grade = 7 and normalized_title = lower('Халықаралық бірліктер жүйесі (SI)')),
  'bjb',
  'БЖБ №1: Физикалық шамалар мен өлшеулер',
  1,
  'Физикалық шамалар, SI жүйесі, өлшеу дәлдігі және зертханалық қауіпсіздік бойынша бөлімдік бағалау.',
  'placeholder',
  1
),
(
  7,
  null,
  'tjb',
  'ТЖБ №1',
  1,
  '1-тоқсан бойынша жиынтық бағалау.',
  'placeholder',
  2
)
on conflict do nothing;