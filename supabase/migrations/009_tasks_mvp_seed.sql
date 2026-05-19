-- =========================================================
-- Plan.Teach_kz
-- 009_tasks_mvp_seed.sql
-- MVP task system: 5 topics, 3 levels, 5 tasks per level.
-- Based on PhysAI task/topic structure.
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),

  topic_id uuid references public.topics(id) on delete set null,
  grade int not null default 8 check (grade between 7 and 11),

  title text not null,
  body text not null,

  task_type text not null default 'practice'
    check (task_type in ('practice', 'test', 'pisa', 'project', 'lab_prepare')),

  answer_type text not null default 'numeric'
    check (answer_type in ('multiple_choice', 'text', 'numeric', 'formula', 'image', 'mixed')),

  difficulty text not null
    check (difficulty in ('easy', 'medium', 'hard')),

  options jsonb not null default '[]',
  correct_answer text,
  solution text,
  explanation text,

  points int not null default 10,

  content_status text not null default 'ready'
    check (content_status in ('ready', 'partial', 'placeholder')),

  order_index int not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (grade, title)
);

create index if not exists tasks_topic_id_idx on public.tasks(topic_id);
create index if not exists tasks_grade_idx on public.tasks(grade);
create index if not exists tasks_difficulty_idx on public.tasks(difficulty);
create index if not exists tasks_active_idx on public.tasks(is_active);

drop trigger if exists tasks_set_updated_at on public.tasks;

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create table if not exists public.task_attempts (
  id uuid primary key default gen_random_uuid(),

  task_id uuid not null references public.tasks(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,

  answer_text text,
  answer_image_url text,

  is_correct boolean,
  auto_score int,
  teacher_score int,

  status text not null default 'submitted'
    check (status in ('draft', 'submitted', 'auto_checked', 'teacher_reviewed')),

  auto_feedback text,
  teacher_feedback text,

  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists task_attempts_task_id_idx on public.task_attempts(task_id);
create index if not exists task_attempts_student_id_idx on public.task_attempts(student_id);
create index if not exists task_attempts_status_idx on public.task_attempts(status);

alter table public.tasks enable row level security;
alter table public.task_attempts enable row level security;

drop policy if exists "tasks_select_authenticated" on public.tasks;
drop policy if exists "tasks_admin_all" on public.tasks;

create policy "tasks_select_authenticated"
on public.tasks
for select
to authenticated
using (is_active = true);

create policy "tasks_admin_all"
on public.tasks
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "task_attempts_select_access" on public.task_attempts;
drop policy if exists "task_attempts_insert_own" on public.task_attempts;
drop policy if exists "task_attempts_update_related_or_admin" on public.task_attempts;
drop policy if exists "task_attempts_delete_admin" on public.task_attempts;

create policy "task_attempts_select_access"
on public.task_attempts
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
);

create policy "task_attempts_insert_own"
on public.task_attempts
for insert
to authenticated
with check (student_id = auth.uid());

create policy "task_attempts_update_related_or_admin"
on public.task_attempts
for update
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
)
with check (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

create policy "task_attempts_delete_admin"
on public.task_attempts
for delete
to authenticated
using (public.is_admin(auth.uid()));

grant select on public.tasks to authenticated;
grant select, insert, update, delete on public.task_attempts to authenticated;

-- =========================================================
-- 5 MVP topics
-- =========================================================

insert into public.learning_sections (grade, title, slug, description, order_index)
values
(8, 'Электродинамика MVP', 'mvp-electrodynamics', 'MVP тапсырмаларға арналған 5 базалық тақырып.', 100)
on conflict (grade, slug) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  updated_at = now();

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
  source_note
)
values
(
  8,
  (select id from public.learning_sections where grade = 8 and slug = 'mvp-electrodynamics'),
  'Кулон заңы',
  lower('Кулон заңы'),
  'mvp-coulomb-law',
  'Екі нүктелік зарядтың өзара әсер күшін есептеу.',
  101,
  'lesson',
  'ready',
  'beginner',
  'PhysAI MVP seed'
),
(
  8,
  (select id from public.learning_sections where grade = 8 and slug = 'mvp-electrodynamics'),
  'Электр өрісі',
  lower('Электр өрісі'),
  'mvp-electric-field',
  'Электр өрісінің кернеулігін түсіну және есептеу.',
  102,
  'lesson',
  'ready',
  'beginner',
  'PhysAI MVP seed'
),
(
  8,
  (select id from public.learning_sections where grade = 8 and slug = 'mvp-electrodynamics'),
  'Ом заңы',
  lower('Ом заңы'),
  'mvp-ohm-law',
  'Ток күші, кернеу және кедергі арасындағы байланыс.',
  103,
  'lesson',
  'ready',
  'intermediate',
  'PhysAI MVP seed'
),
(
  8,
  (select id from public.learning_sections where grade = 8 and slug = 'mvp-electrodynamics'),
  'Магнит өрісі',
  lower('Магнит өрісі'),
  'mvp-magnetic-field',
  'Магнит өрісіндегі тогы бар өткізгішке әсер ететін күш.',
  104,
  'lesson',
  'ready',
  'intermediate',
  'PhysAI MVP seed'
),
(
  9,
  (select id from public.learning_sections where grade = 8 and slug = 'mvp-electrodynamics'),
  'Фотоэффект',
  lower('Фотоэффект'),
  'mvp-photoelectric-effect',
  'Жарық әсерінен электрондардың бөлініп шығуы.',
  105,
  'lesson',
  'ready',
  'advanced',
  'PhysAI MVP seed'
)
on conflict (grade, normalized_title) do update set
  section_id = excluded.section_id,
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  ktz_order = excluded.ktz_order,
  content_type = excluded.content_type,
  content_status = excluded.content_status,
  level = excluded.level,
  source_note = excluded.source_note,
  updated_at = now();

insert into public.topic_contents (topic_id, block_type, title, body, order_index)
values
((select id from public.topics where grade = 8 and normalized_title = lower('Кулон заңы')), 'formula', 'Кулон заңы', 'F = k · |q1 · q2| / r^2. Зарядтар үлкен болса күш артады, арақашықтық артса күш азаяды.', 1),
((select id from public.topics where grade = 8 and normalized_title = lower('Электр өрісі')), 'formula', 'Өріс кернеулігі', 'E = F / q. Кернеулік бірлік оң зарядқа әсер ететін күшті көрсетеді.', 1),
((select id from public.topics where grade = 8 and normalized_title = lower('Ом заңы')), 'formula', 'Ом заңы', 'I = U / R. Ток күші кернеуге тура, кедергіге кері пропорционал.', 1),
((select id from public.topics where grade = 8 and normalized_title = lower('Магнит өрісі')), 'formula', 'Ампер күші', 'F = B · I · l · sinα. Магнит өрісі тогы бар өткізгішке күшпен әсер етеді.', 1),
((select id from public.topics where grade = 9 and normalized_title = lower('Фотоэффект')), 'formula', 'Фотоэффект теңдеуі', 'hν = A + Ek. Фотон энергиясы электронды шығару жұмысына және кинетикалық энергияға жұмсалады.', 1)
on conflict do nothing;

-- =========================================================
-- 15 MVP tasks: easy 5, medium 5, hard 5
-- =========================================================

delete from public.tasks
where title like 'MVP:%';

insert into public.tasks (
  topic_id, grade, title, body, task_type, answer_type, difficulty,
  options, correct_answer, solution, explanation, points, order_index
)
values
-- Easy / базалық: 5 tasks
((select id from public.topics where grade = 8 and normalized_title = lower('Кулон заңы')), 8, 'MVP: Кулон күші - базалық есеп', 'q1 = 2 Кл, q2 = 3 Кл, r = 2 м. k = 9 · 10^9 болса, зарядтар арасындағы күшті тап. Жауапты Н түрінде жаз.', 'practice', 'numeric', 'easy', '[]', '13500000000', 'F = k · |q1q2| / r^2 = 9 · 10^9 · 6 / 4 = 13.5 · 10^9 Н.', 'Кулон заңында арақашықтық квадратпен алынады.', 10, 1),
((select id from public.topics where grade = 8 and normalized_title = lower('Электр өрісі')), 8, 'MVP: Электр өрісі кернеулігі', 'F = 20 Н, q = 4 Кл. Электр өрісінің кернеулігін тап.', 'practice', 'numeric', 'easy', '[]', '5', 'E = F / q = 20 / 4 = 5 Н/Кл.', 'Кернеулік күштің зарядқа қатынасына тең.', 10, 2),
((select id from public.topics where grade = 8 and normalized_title = lower('Ом заңы')), 8, 'MVP: Ток күшін табу', 'U = 12 В, R = 4 Ом. Ток күшін тап.', 'practice', 'numeric', 'easy', '[]', '3', 'I = U / R = 12 / 4 = 3 А.', 'Ом заңын тура қолданамыз.', 10, 3),
((select id from public.topics where grade = 8 and normalized_title = lower('Магнит өрісі')), 8, 'MVP: Ампер күшін табу', 'B = 2 Тл, I = 3 А, l = 4 м, sinα = 1. Өткізгішке әсер ететін күшті тап.', 'practice', 'numeric', 'easy', '[]', '24', 'F = B · I · l · sinα = 2 · 3 · 4 · 1 = 24 Н.', 'Ампер күші барлық көбейткіштерге тура пропорционал.', 10, 4),
((select id from public.topics where grade = 8 and normalized_title = lower('Ом заңы')), 8, 'MVP: Ом заңы бос орын', 'Бос орынды толтыр: Ом заңы бойынша ток күші кернеуге ___ пропорционал.', 'practice', 'text', 'easy', '["тура", "кері", "өзгермейді"]', 'тура', 'I = U / R болғандықтан, I кернеуге тура пропорционал.', 'Бұл PhysAI fill blanks түрінің жеңіл MVP нұсқасы.', 10, 5),

-- Medium / орташа: 5 tasks
((select id from public.topics where grade = 8 and normalized_title = lower('Кулон заңы')), 8, 'MVP: Қашықтық артса күш', 'Екі зарядтың арақашықтығы 2 есе артса, Кулон күші қалай өзгереді?', 'practice', 'multiple_choice', 'medium', '[{"key":"A","text":"2 есе артады"},{"key":"B","text":"2 есе азаяды"},{"key":"C","text":"4 есе азаяды"},{"key":"D","text":"Өзгермейді"}]', 'C', 'F арақашықтық квадратына кері пропорционал: 2^2 = 4.', 'Дұрыс жауап: 4 есе азаяды.', 15, 6),
((select id from public.topics where grade = 8 and normalized_title = lower('Электр өрісі')), 8, 'MVP: Күш артса өріс', 'Заряд өзгермейді. Егер күш 3 есе артса, электр өрісінің кернеулігі қалай өзгереді?', 'practice', 'multiple_choice', 'medium', '[{"key":"A","text":"3 есе артады"},{"key":"B","text":"3 есе азаяды"},{"key":"C","text":"9 есе артады"},{"key":"D","text":"Өзгермейді"}]', 'A', 'E = F / q. q тұрақты болса, E күшпен бірге 3 есе артады.', 'Кернеулік күшке тура пропорционал.', 15, 7),
((select id from public.topics where grade = 8 and normalized_title = lower('Ом заңы')), 8, 'MVP: Кедергіні табу', 'U = 18 В және I = 3 А болса, кедергіні тап.', 'practice', 'numeric', 'medium', '[]', '6', 'R = U / I = 18 / 3 = 6 Ом.', 'Ом заңын R = U / I түріне келтіреміз.', 15, 8),
((select id from public.topics where grade = 8 and normalized_title = lower('Магнит өрісі')), 8, 'MVP: Ток артса Ампер күші', 'Ток күші 2 есе артса, қалған шамалар өзгермесе, Ампер күші қалай өзгереді?', 'practice', 'multiple_choice', 'medium', '[{"key":"A","text":"2 есе азаяды"},{"key":"B","text":"2 есе артады"},{"key":"C","text":"4 есе артады"},{"key":"D","text":"Өзгермейді"}]', 'B', 'F = B · I · l · sinα. Ток 2 есе артса, күш те 2 есе артады.', 'Ампер күші ток күшіне тура пропорционал.', 15, 9),
((select id from public.topics where grade = 8 and normalized_title = lower('Ом заңы')), 8, 'MVP: Сәйкестендіру - электр шамалары', 'Сәйкестендір: U - кернеу, I - ток күші, R - кедергі, P - қуат. Жауапты U,I,R,P ретімен жаз.', 'practice', 'text', 'medium', '[{"left":"U","right":"Кернеу"},{"left":"I","right":"Ток күші"},{"left":"R","right":"Кедергі"},{"left":"P","right":"Қуат"}]', 'кернеу,ток күші,кедергі,қуат', 'U - кернеу, I - ток күші, R - кедергі, P - қуат.', 'Бұл PhysAI matching түрінің MVP мәтіндік нұсқасы.', 15, 10),

-- Hard / жоғары: 5 tasks
((select id from public.topics where grade = 8 and normalized_title = lower('Кулон заңы')), 8, 'MVP: Кулон заңындағы екі өзгеріс', 'q1 2 есе артты, q2 өзгермеді, ал r 3 есе артты. Кулон күші бастапқы мәнімен салыстырғанда қалай өзгереді?', 'practice', 'formula', 'hard', '[]', '2/9', 'Өзгеріс: 2 / 3^2 = 2/9. Демек күш 4.5 есе азаяды.', 'Заряд тура, арақашықтық квадрат бойынша кері әсер етеді.', 20, 11),
((select id from public.topics where grade = 8 and normalized_title = lower('Электр өрісі')), 8, 'MVP: Кернеуліктің қатынасы', 'Күш 2 есе артты, заряд 4 есе артты. Электр өрісінің кернеулігі қалай өзгереді?', 'practice', 'formula', 'hard', '[]', '1/2', 'E = F / q, өзгеріс 2 / 4 = 1/2. Кернеулік 2 есе азаяды.', 'Қатынас арқылы талдау керек.', 20, 12),
((select id from public.topics where grade = 8 and normalized_title = lower('Ом заңы')), 8, 'MVP: Кернеу мен кедергі бірге өзгерсе', 'Кернеу 3 есе артты, кедергі 2 есе артты. Ток күші қалай өзгереді?', 'practice', 'formula', 'hard', '[]', '1.5', 'I = U / R. Өзгеріс 3 / 2 = 1.5. Ток 1.5 есе артады.', 'Екі шаманың қатынасын бірге есептейміз.', 20, 13),
((select id from public.topics where grade = 8 and normalized_title = lower('Магнит өрісі')), 8, 'MVP: Ампер күшіндегі бірнеше өзгеріс', 'B 2 есе артты, I 3 есе артты, l 2 есе азайды. Ампер күші қалай өзгереді?', 'practice', 'formula', 'hard', '[]', '3', 'Өзгеріс: 2 · 3 · 1/2 = 3. Күш 3 есе артады.', 'Барлық көбейткіштерді бір қатынасқа жинаймыз.', 20, 14),
((select id from public.topics where grade = 9 and normalized_title = lower('Фотоэффект')), 9, 'MVP: Фотоэффект жобалық талдау', 'Фотоэффекттің неге тек жарық жиілігі жеткілікті болғанда байқалатынын түсіндір. Жауапта фотон энергиясы, шығу жұмысы және қызыл шекара сөздері болсын.', 'project', 'text', 'hard', '[]', null, 'Жауапта hν энергиясы шығу жұмысынан A үлкен не тең болса ғана электрон шығатыны айтылуы керек.', 'Бұл high level text/project тапсырма. Мұғалім немесе AI кейін толық бағалайды.', 20, 15);
