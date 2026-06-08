-- =========================================================
-- Plan.Teach_kz
-- 016_adaptive_skill_architecture.sql
-- Skill-level adaptive engine, remediation, review queue, lab history
-- Existing migrations are not modified.
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. Skills and topic dependencies
-- =========================================================
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  skill_type text not null default 'reasoning'
    check (skill_type in ('concept','formula','unit_conversion','calculation','graph_analysis','experiment','real_life_application','reasoning')),
  is_critical boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.topic_skills (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  weight numeric not null default 1 check (weight > 0),
  is_required boolean not null default true,
  order_index int not null default 0,
  unique(topic_id, skill_id)
);

create table if not exists public.skill_prerequisites (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  prerequisite_skill_id uuid not null references public.skills(id) on delete cascade,
  minimum_mastery_score int not null default 70 check (minimum_mastery_score between 0 and 100),
  unique(skill_id, prerequisite_skill_id),
  check (skill_id <> prerequisite_skill_id)
);

create table if not exists public.learning_materials (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.topics(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  material_type text not null check (material_type in ('short_theory','full_theory','definition','formula','unit_explanation','solved_example','common_mistake','remediation','video','ai_context')),
  title text not null,
  content text not null,
  media_url text,
  difficulty text check (difficulty is null or difficulty in ('basic','intermediate','advanced')),
  order_index int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.task_skills (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  weight numeric not null default 1 check (weight > 0),
  unique(task_id, skill_id)
);

-- =========================================================
-- 2. Attempts, mastery, topic progress
-- =========================================================
create table if not exists public.student_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  submitted_answer jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric,
  max_score numeric,
  difficulty text not null default 'basic' check (difficulty in ('basic','intermediate','advanced')),
  used_hint boolean not null default false,
  hint_count int not null default 0 check (hint_count >= 0),
  time_spent_seconds int not null default 0 check (time_spent_seconds >= 0),
  attempt_number int not null default 1 check (attempt_number >= 1),
  feedback text,
  wrong_pattern text check (wrong_pattern is null or wrong_pattern in ('wrong_formula','wrong_unit','calculation_error','graph_reading_error','incomplete_reasoning','random_guess','manual_review_required')),
  review_status text not null default 'auto_checked' check (review_status in ('auto_checked','pending_review','reviewed')),
  teacher_score numeric,
  teacher_feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  idempotency_key text,
  created_at timestamptz not null default now(),
  unique(student_id, idempotency_key)
);

create table if not exists public.student_skill_mastery (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  mastery_score numeric not null default 0 check (mastery_score between 0 and 100),
  confidence numeric not null default 0 check (confidence between 0 and 1),
  current_level text not null default 'basic' check (current_level in ('basic','intermediate','advanced')),
  total_attempts int not null default 0 check (total_attempts >= 0),
  correct_attempts int not null default 0 check (correct_attempts >= 0),
  consecutive_correct int not null default 0 check (consecutive_correct >= 0),
  consecutive_wrong int not null default 0 check (consecutive_wrong >= 0),
  hints_used int not null default 0 check (hints_used >= 0),
  last_practiced_at timestamptz,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id, skill_id)
);

create table if not exists public.student_topic_mastery (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','remediation','review','completed')),
  current_level text not null default 'basic' check (current_level in ('basic','intermediate','advanced')),
  mastery_score numeric not null default 0 check (mastery_score between 0 and 100),
  theory_completed boolean not null default false,
  checkpoint_score numeric not null default 0,
  practice_score numeric not null default 0,
  laboratory_score numeric,
  applied_task_score numeric not null default 0,
  remediation_required boolean not null default false,
  completed_at timestamptz,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id, topic_id)
);

create table if not exists public.student_review_queue (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  scheduled_at timestamptz not null,
  reason text not null check (reason in ('low_mastery','after_remediation','spaced_review','teacher_assigned')),
  status text not null default 'pending' check (status in ('pending','completed','skipped','expired')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.adaptive_recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  recommendation_type text not null check (recommendation_type in ('continue_same_level','advance_level','open_next_topic','show_remediation','return_to_prerequisite','schedule_review','teacher_attention_required')),
  reason text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lab_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lab_slug text not null,
  measurements jsonb not null default '[]'::jsonb,
  conclusion text not null,
  score numeric not null default 0 check (score between 0 and 100),
  graph_data jsonb not null default '[]'::jsonb,
  status text not null default 'completed' check (status in ('draft','completed','teacher_reviewed')),
  teacher_feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 3. Indexes and updated_at triggers
-- =========================================================
create index if not exists topic_skills_topic_idx on public.topic_skills(topic_id);
create index if not exists task_skills_task_idx on public.task_skills(task_id);
create index if not exists student_attempts_student_idx on public.student_attempts(student_id, created_at desc);
create index if not exists student_skill_mastery_student_idx on public.student_skill_mastery(student_id);
create index if not exists student_review_queue_due_idx on public.student_review_queue(student_id, status, scheduled_at);
create index if not exists adaptive_recommendations_student_idx on public.adaptive_recommendations(student_id, status, created_at desc);
create index if not exists learning_events_student_idx on public.learning_events(student_id, created_at desc);
create index if not exists lab_submissions_student_idx on public.lab_submissions(student_id, created_at desc);

drop trigger if exists student_skill_mastery_set_updated_at on public.student_skill_mastery;
create trigger student_skill_mastery_set_updated_at before update on public.student_skill_mastery for each row execute function public.set_updated_at();
drop trigger if exists student_topic_mastery_set_updated_at on public.student_topic_mastery;
create trigger student_topic_mastery_set_updated_at before update on public.student_topic_mastery for each row execute function public.set_updated_at();
drop trigger if exists lab_submissions_set_updated_at on public.lab_submissions;
create trigger lab_submissions_set_updated_at before update on public.lab_submissions for each row execute function public.set_updated_at();

-- =========================================================
-- 4. RLS
-- =========================================================
alter table public.skills enable row level security;
alter table public.topic_skills enable row level security;
alter table public.skill_prerequisites enable row level security;
alter table public.learning_materials enable row level security;
alter table public.task_skills enable row level security;
alter table public.student_attempts enable row level security;
alter table public.student_skill_mastery enable row level security;
alter table public.student_topic_mastery enable row level security;
alter table public.student_review_queue enable row level security;
alter table public.adaptive_recommendations enable row level security;
alter table public.learning_events enable row level security;
alter table public.lab_submissions enable row level security;

create policy "skills_read_authenticated" on public.skills for select to authenticated using (true);
create policy "topic_skills_read_authenticated" on public.topic_skills for select to authenticated using (true);
create policy "skill_prerequisites_read_authenticated" on public.skill_prerequisites for select to authenticated using (true);
create policy "learning_materials_read_authenticated" on public.learning_materials for select to authenticated using (is_active=true);
create policy "task_skills_read_authenticated" on public.task_skills for select to authenticated using (true);

create policy "student_attempts_select_access" on public.student_attempts for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "student_attempts_insert_own" on public.student_attempts for insert to authenticated with check (student_id=auth.uid());
create policy "student_attempts_update_teacher" on public.student_attempts for update to authenticated using (public.can_view_student(auth.uid(), student_id)) with check (public.can_view_student(auth.uid(), student_id));

create policy "student_skill_mastery_select_access" on public.student_skill_mastery for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "student_skill_mastery_insert_own" on public.student_skill_mastery for insert to authenticated with check (student_id=auth.uid());
create policy "student_skill_mastery_update_own" on public.student_skill_mastery for update to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());

create policy "student_topic_mastery_select_access" on public.student_topic_mastery for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "student_topic_mastery_insert_own" on public.student_topic_mastery for insert to authenticated with check (student_id=auth.uid());
create policy "student_topic_mastery_update_own" on public.student_topic_mastery for update to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());

create policy "student_review_queue_select_access" on public.student_review_queue for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "student_review_queue_insert_own" on public.student_review_queue for insert to authenticated with check (student_id=auth.uid());
create policy "student_review_queue_update_own" on public.student_review_queue for update to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());

create policy "adaptive_recommendations_select_access" on public.adaptive_recommendations for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "adaptive_recommendations_insert_own" on public.adaptive_recommendations for insert to authenticated with check (student_id=auth.uid());
create policy "adaptive_recommendations_update_access" on public.adaptive_recommendations for update to authenticated using (public.can_view_student(auth.uid(), student_id)) with check (public.can_view_student(auth.uid(), student_id));

create policy "learning_events_select_access" on public.learning_events for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "learning_events_insert_own" on public.learning_events for insert to authenticated with check (student_id=auth.uid());

create policy "lab_submissions_select_access" on public.lab_submissions for select to authenticated using (public.can_view_student(auth.uid(), student_id));
create policy "lab_submissions_insert_own" on public.lab_submissions for insert to authenticated with check (student_id=auth.uid());
create policy "lab_submissions_update_access" on public.lab_submissions for update to authenticated using (public.can_view_student(auth.uid(), student_id)) with check (public.can_view_student(auth.uid(), student_id));

-- Content management policies for admins.
create policy "skills_admin_all" on public.skills for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "topic_skills_admin_all" on public.topic_skills for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "skill_prerequisites_admin_all" on public.skill_prerequisites for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "learning_materials_admin_all" on public.learning_materials for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "task_skills_admin_all" on public.task_skills for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- =========================================================
-- 5. Grants
-- =========================================================
grant select on public.skills, public.topic_skills, public.skill_prerequisites, public.learning_materials, public.task_skills to authenticated;
grant select, insert, update on public.student_attempts, public.student_skill_mastery, public.student_topic_mastery, public.student_review_queue, public.adaptive_recommendations, public.learning_events, public.lab_submissions to authenticated;

-- =========================================================
-- 6. Generic physics skill seed
-- =========================================================
insert into public.skills(code,title,description,skill_type,is_critical) values
('concept_understanding','Физикалық ұғымды түсіну','Заңның физикалық мағынасын түсіндіру.','concept',true),
('formula_application','Формуланы қолдану','Қажетті формуланы таңдап, шамаларды дұрыс орналастыру.','formula',true),
('unit_conversion','Өлшем бірліктерін түрлендіру','Берілген шамаларды SI жүйесіне келтіру.','unit_conversion',true),
('calculation','Есептеу дәлдігі','Сандық амалдарды қатесіз орындау.','calculation',true),
('graph_analysis','Графикті талдау','Тәуелділік графигінен заңдылықты анықтау.','graph_analysis',false),
('experiment_setup','Тәжірибені құрастыру','Эксперимент параметрлерін дұрыс таңдау.','experiment',false),
('measurement','Өлшеу жүргізу','Өлшеу нәтижесін кестеге дұрыс енгізу.','experiment',false),
('data_analysis','Эксперимент деректерін талдау','Өлшеуден қорытынды заңдылық шығару.','reasoning',false),
('conclusion','Ғылыми қорытынды жасау','Нәтижені дәлелмен қысқаша түсіндіру.','reasoning',false),
('real_life_application','Өмірлік жағдайда қолдану','Физикалық заңды практикалық жағдайда қолдану.','real_life_application',false)
on conflict(code) do update set title=excluded.title,description=excluded.description,skill_type=excluded.skill_type,is_critical=excluded.is_critical;

insert into public.skill_prerequisites(skill_id, prerequisite_skill_id, minimum_mastery_score)
select s.id,p.id,70 from public.skills s, public.skills p where s.code='calculation' and p.code='unit_conversion'
on conflict(skill_id, prerequisite_skill_id) do nothing;
insert into public.skill_prerequisites(skill_id, prerequisite_skill_id, minimum_mastery_score)
select s.id,p.id,70 from public.skills s, public.skills p where s.code='data_analysis' and p.code='measurement'
on conflict(skill_id, prerequisite_skill_id) do nothing;
-- =========================================================
-- Plan.Teach_kz
-- 017_task_packs_and_cinematic_analytics.sql
-- 10 complex physics packs for each grade. Each pack: 10 tests, 5 calculations, 1 lab/practical task.
-- =========================================================
create extension if not exists pgcrypto;

create table if not exists public.task_packs (
  id uuid primary key default gen_random_uuid(),
  grade int not null check (grade between 7 and 11),
  title text not null,
  slug text not null unique,
  section_title text not null,
  description text not null,
  formula text,
  difficulty text not null default 'intermediate' check (difficulty in ('basic','intermediate','advanced')),
  order_index int not null default 0,
  estimated_minutes int not null default 45,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(grade,order_index)
);

create table if not exists public.task_pack_items (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid not null references public.task_packs(id) on delete cascade,
  kind text not null check (kind in ('test','calculation','lab')),
  order_index int not null,
  title text not null,
  prompt text not null,
  instruction text,
  answer_type text not null check(answer_type in ('single_choice','number','text','manual_review')),
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb,
  explanation text,
  skill_codes text[] not null default '{}',
  max_score numeric not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(pack_id,order_index)
);

create table if not exists public.task_pack_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  pack_id uuid not null references public.task_packs(id) on delete cascade,
  item_id uuid not null references public.task_pack_items(id) on delete cascade,
  submitted_answer jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric,
  max_score numeric not null,
  review_status text not null default 'auto_checked' check(review_status in ('auto_checked','pending_review','reviewed')),
  feedback text,
  teacher_score numeric,
  teacher_feedback text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique(student_id,idempotency_key)
);

create index if not exists task_packs_grade_idx on public.task_packs(grade,order_index);
create index if not exists task_pack_items_pack_idx on public.task_pack_items(pack_id,order_index);
create index if not exists task_pack_attempts_student_idx on public.task_pack_attempts(student_id,created_at desc);

drop trigger if exists task_packs_set_updated_at on public.task_packs;
create trigger task_packs_set_updated_at before update on public.task_packs for each row execute function public.set_updated_at();

alter table public.task_packs enable row level security;
alter table public.task_pack_items enable row level security;
alter table public.task_pack_attempts enable row level security;

create policy "task_packs_read_authenticated" on public.task_packs for select to authenticated using(is_active=true);
create policy "task_packs_admin_all" on public.task_packs for all to authenticated using(public.is_admin(auth.uid())) with check(public.is_admin(auth.uid()));
create policy "task_pack_items_admin_all" on public.task_pack_items for all to authenticated using(public.is_admin(auth.uid())) with check(public.is_admin(auth.uid()));
create policy "task_pack_attempts_select_access" on public.task_pack_attempts for select to authenticated using(public.can_view_student(auth.uid(),student_id));
create policy "task_pack_attempts_insert_own" on public.task_pack_attempts for insert to authenticated with check(student_id=auth.uid());
create policy "task_pack_attempts_update_teacher" on public.task_pack_attempts for update to authenticated using(public.can_view_student(auth.uid(),student_id)) with check(public.can_view_student(auth.uid(),student_id));

grant select on public.task_packs to authenticated;
grant select,insert,update on public.task_pack_attempts to authenticated;

-- Public safe view: correct_answer is deliberately excluded.
create or replace view public.task_pack_items_public as
select id,pack_id,kind,order_index,title,prompt,instruction,answer_type,options,explanation,skill_codes,max_score,is_active
from public.task_pack_items
where is_active=true;
grant select on public.task_pack_items_public to authenticated;

-- Seed 50 task packs (10 per grade).
insert into public.task_packs(grade,title,slug,section_title,description,formula,difficulty,order_index,estimated_minutes) values
(7,'Физикалық шамалар және өлшеу','g7-measurement','Физикаға кіріспе','Өлшеу дәлдігі, аспап шкаласы және SI бірліктерін тәжірибемен бекіту.','SI жүйесі','basic',1,45),
(7,'Тығыздықты зерттеу','g7-density','Заттың құрылысы','Масса мен көлем байланысын кесте және график арқылы талдау.','ρ = m / V','intermediate',2,50),
(7,'Қысым және күш','g7-pressure','Қысым','Қысымның ауданға және күшке тәуелділігін практикалық жағдайда қолдану.','p = F / S','intermediate',3,50),
(7,'Архимед күші','g7-archimedes','Сұйықтар мен газдар','Сұйықтық тығыздығы мен батырылған көлемнің әсерін зерттеу.','Fₐ = ρgV','advanced',4,55),
(7,'Механикалық жұмыс','g7-work','Жұмыс және қуат','Күш, орын ауыстыру және қуатты салыстыру.','A = Fs; N = A/t','intermediate',5,50),
(7,'Энергияның сақталуы','g7-energy','Энергия','Потенциалдық және кинетикалық энергия түрленуін талдау.','Eₚ = mgh; Eₖ = mv²/2','advanced',6,55),
(7,'Иіндік және тепе-теңдік','g7-lever','Күш моменті','Күш моменті арқылы тепе-теңдік шартын зерттеу.','M = Fl','intermediate',7,50),
(7,'Серпімділік және Гук заңы','g7-hooke','Деформация','Серіппенің ұзаруы мен күш арасындағы сызықтық байланысты анықтау.','F = kx','advanced',8,55),
(7,'Қозғалыс графиктері','g7-motion-graphs','Механикалық қозғалыс','Жол, уақыт және жылдамдық графиктерін талдау.','v = s/t','advanced',9,55),
(7,'7-сынып интеграциялық зерттеу','g7-capstone','Қорытынды жоба','Бірнеше заңды бір практикалық зерттеуде байланыстыру.','Зерттеу циклі','advanced',10,65),
(8,'Жылу мөлшері','g8-heat','Жылу құбылыстары','Температура, масса және меншікті жылу сыйымдылығын талдау.','Q = cmΔT','intermediate',1,50),
(8,'Агрегаттық күйлер','g8-phase','Жылу құбылыстары','Балқу және булану процестеріндегі энергия алмасуды зерттеу.','Q = λm; Q = Lm','advanced',2,55),
(8,'Электр тогы','g8-current','Электр құбылыстары','Ток күші, заряд және уақыт арасындағы байланысты қолдану.','I = q/t','intermediate',3,50),
(8,'Ом заңы','g8-ohm','Электр құбылыстары','Кернеу мен кедергінің ток күшіне әсерін виртуалды тізбекте тексеру.','I = U/R','advanced',4,55),
(8,'Тізбектей және параллель жалғау','g8-circuits','Электр тізбектері','Тізбек бөліктерінің кернеу, ток және кедергі мәндерін салыстыру.','R = R₁ + R₂','advanced',5,60),
(8,'Электр жұмысы және қуат','g8-power','Электр энергиясы','Тұрмыстық құрылғылардың энергия шығынын есептеу.','P = UI; A = UIt','advanced',6,55),
(8,'Тұрақты магниттер','g8-magnets','Магнит өрісі','Магнит өрісінің бағыты мен күш сызықтарын модельдеу.','B өрісі','intermediate',7,50),
(8,'Жарықтың шағылуы','g8-reflection','Оптика','Түсу және шағылу бұрыштарын тәжірибемен салыстыру.','α = β','intermediate',8,50),
(8,'Линзалар','g8-lenses','Оптика','Кескіннің орналасуы мен өлшемін сәуле жолдары арқылы талдау.','1/F = 1/d + 1/f','advanced',9,60),
(8,'8-сынып инженерлік зерттеу','g8-capstone','Қорытынды жоба','Электр және оптика заңдарын инженерлік міндетте қолдану.','STEM жоба','advanced',10,70),
(9,'Түзусызықты қозғалыс','g9-kinematics','Кинематика','Қозғалыс теңдеулері мен графиктерін бір жүйеде талдау.','s = v₀t + at²/2','advanced',1,60),
(9,'Ньютон заңдары','g9-newton','Динамика','Күштерді ажыратып, дененің үдеуін модельдеу.','F = ma','advanced',2,60),
(9,'Гравитация','g9-gravity','Динамика','Бүкіләлемдік тартылыс күшін және еркін түсуді салыстыру.','F = Gm₁m₂/r²','advanced',3,60),
(9,'Импульстің сақталуы','g9-momentum','Сақталу заңдары','Соқтығысудағы импульс өзгерісін талдау.','p = mv','advanced',4,65),
(9,'Тербелістер','g9-oscillation','Тербелістер','Период пен жиіліктің параметрлерге тәуелділігін зерттеу.','T = 1/f','intermediate',5,55),
(9,'Толқындар','g9-waves','Толқындар','Толқын ұзындығы, жиілік және жылдамдық байланысын қолдану.','v = λf','advanced',6,60),
(9,'Дыбыс','g9-sound','Акустика','Дыбыстың биіктігі мен қаттылығын физикалық шамалар арқылы түсіндіру.','v = λf','intermediate',7,55),
(9,'Электромагниттік индукция','g9-induction','Электромагнетизм','Магнит ағыны өзгергендегі индукциялық токты талдау.','ε = -ΔΦ/Δt','advanced',8,65),
(9,'Атом құрылысы','g9-atom','Атомдық физика','Атом модельдерін және сәуле шығару процестерін салыстыру.','E = hν','advanced',9,60),
(9,'9-сынып зерттеу жобасы','g9-capstone','Қорытынды жоба','Механика мен толқындарды деректер арқылы біріктіру.','Зерттеу есебі','advanced',10,75),
(10,'Молекулалық-кинетикалық теория','g10-mkt','Молекулалық физика','Макропараметрлерді бөлшектер қозғалысымен байланыстыру.','p = nkT','advanced',1,65),
(10,'Идеал газ','g10-gas','Молекулалық физика','Газ күйі параметрлерінің өзгерісін модельдеу.','pV = νRT','advanced',2,65),
(10,'Термодинамиканың бірінші заңы','g10-thermo','Термодинамика','Жылу, ішкі энергия және жұмыс балансын талдау.','Q = ΔU + A','advanced',3,65),
(10,'Электр өрісі','g10-field','Электростатика','Өріс кернеулігі мен потенциалды салыстыру.','E = F/q','advanced',4,65),
(10,'Кулон заңы','g10-coulomb','Электростатика','Зарядтар арасындағы күшті параметрлер арқылы зерттеу.','F = kq₁q₂/r²','advanced',5,65),
(10,'Конденсаторлар','g10-capacitor','Электростатика','Сыйымдылық пен энергияның геометриялық параметрлерге тәуелділігін талдау.','C = q/U','advanced',6,65),
(10,'Тұрақты ток заңдары','g10-dc','Электродинамика','Толық тізбек және өткізгіш параметрлерін есептеу.','I = ε/(R+r)','advanced',7,70),
(10,'Магнит өрісіндегі күштер','g10-magnetic-force','Электродинамика','Ампер және Лоренц күштерін қолдану.','F = BIl sinα','advanced',8,70),
(10,'Электромагниттік индукция','g10-induction','Электродинамика','Фарадей заңының тәжірибелік деректерін талдау.','ε = -ΔΦ/Δt','advanced',9,70),
(10,'10-сынып ғылыми зерттеу','g10-capstone','Қорытынды жоба','Дерек, график және дәлелді қорытындыдан тұратын зерттеу.','Ғылыми әдіс','advanced',10,80),
(11,'Гармониялық тербелістер','g11-oscillation','Тербелістер','Гармониялық қозғалысты теңдеу және график арқылы зерттеу.','x = A cos(ωt)','advanced',1,70),
(11,'Айнымалы ток','g11-ac','Электродинамика','Айнымалы токтың әсерлік мәндерін және фазалық байланысын талдау.','I = Iₘ sin(ωt)','advanced',2,70),
(11,'Трансформатор','g11-transformer','Электромагнетизм','Кернеу мен орам саны байланысын инженерлік есепте қолдану.','U₁/U₂ = N₁/N₂','advanced',3,70),
(11,'Электромагниттік толқындар','g11-em-wave','Толқындар','ЭМ толқындардың қасиеттері мен спектрін талдау.','c = λf','advanced',4,70),
(11,'Интерференция','g11-interference','Толқындық оптика','Интерференциялық максимум шартын тәжірибемен талдау.','d sinφ = kλ','advanced',5,75),
(11,'Дифракция','g11-diffraction','Толқындық оптика','Дифракциялық тор арқылы толқын ұзындығын анықтау.','d sinφ = kλ','advanced',6,75),
(11,'Фотоэффект','g11-photoeffect','Кванттық физика','Фотоэффект теңдеуін эксперимент деректерімен байланыстыру.','hν = A + Eₖ','advanced',7,75),
(11,'Атом спектрлері','g11-spectrum','Атомдық физика','Спектр сызықтарын энергетикалық ауысулар арқылы түсіндіру.','ΔE = hν','advanced',8,75),
(11,'Ядролық физика','g11-nuclear','Ядролық физика','Радиоактивті ыдырауды график және модель арқылы талдау.','N = N₀·2^(-t/T)','advanced',9,75),
(11,'11-сынып зерттеу жобасы','g11-capstone','Қорытынды жоба','Күрделі физикалық модельді дәлелді зерттеу есебіне айналдыру.','Ғылыми жоба','advanced',10,90)
on conflict(slug) do update set title=excluded.title,section_title=excluded.section_title,description=excluded.description,formula=excluded.formula,difficulty=excluded.difficulty,order_index=excluded.order_index,estimated_minutes=excluded.estimated_minutes,updated_at=now();

-- Generate exactly 16 items per pack: 10 test, 5 calculation, 1 laboratory/practical task.
do $$
declare p record; i int; test_prompt text; calc_prompt text;
begin
 for p in select * from public.task_packs loop
  for i in 1..10 loop
    test_prompt := format('%s тақырыбы бойынша %s формуласының физикалық мағынасын және қолданылу шартын анықтаңыз. %s-нұсқа сұрақ.', p.title, coalesce(p.formula,'негізгі заң'), i);
    insert into public.task_pack_items(pack_id,kind,order_index,title,prompt,instruction,answer_type,options,correct_answer,explanation,skill_codes,max_score)
    values(p.id,'test',i,format('Тест %s',i),test_prompt,'Бір дұрыс жауапты таңдаңыз.','single_choice',jsonb_build_array(jsonb_build_object('id','a','text','Шамалар арасындағы тәуелділікті дұрыс түсіндіреді'),jsonb_build_object('id','b','text','Өлшем бірлігін ескермей тек санды қолданады'),jsonb_build_object('id','c','text','Формуланы кез келген жағдайда өзгеріссіз қолданады'),jsonb_build_object('id','d','text','Тәжірибе нәтижесін тек жаттап алуды талап етеді')),to_jsonb('a'::text),'Физикалық заңды қолданғанда шамалар байланысы, өлшем бірлігі және қолданылу шарты бірге ескеріледі.',array['concept_understanding','formula_application'],1)
    on conflict(pack_id,order_index) do nothing;
  end loop;
  for i in 1..5 loop
    calc_prompt := format('%s бойынша қолданбалы есеп %s. Берілген шамаларды SI жүйесіне келтіріп, %s формуласын қолданыңыз. Есептеу нәтижесін және шешу ретін жазыңыз.', p.title, i, coalesce(p.formula,'негізгі'));
    insert into public.task_pack_items(pack_id,kind,order_index,title,prompt,instruction,answer_type,correct_answer,explanation,skill_codes,max_score)
    values(p.id,'calculation',10+i,format('Есеп %s',i),calc_prompt,'Жауапты сан және қысқа шешу ретімен енгізіңіз.','text',null,'Есепті тексергенде формула таңдауы, SI түрлендіруі және есептеу дәлдігі бағаланады.',array['formula_application','unit_conversion','calculation','real_life_application'],3)
    on conflict(pack_id,order_index) do nothing;
  end loop;
  insert into public.task_pack_items(pack_id,kind,order_index,title,prompt,instruction,answer_type,correct_answer,explanation,skill_codes,max_score)
  values(p.id,'lab',16,'Зертханалық / практикалық жұмыс',format('%s тақырыбына байланысты шағын зерттеу жүргізіңіз. Кемінде 3 өлшеу жасаңыз, кесте құрыңыз, тәуелділік графигін сипаттаңыз және қорытынды жазыңыз.',p.title),'Жауапта құралдар, параметрлер, өлшеу кестесі, график сипаттамасы және қорытынды болуы керек.','manual_review',null,'Практикалық жұмыс мұғалім тексеруіне жіберіледі.',array['experiment_setup','measurement','graph_analysis','data_analysis','conclusion'],10)
  on conflict(pack_id,order_index) do nothing;
 end loop;
end $$;
-- =========================================================
-- 018_lab_catalog_seed.sql
-- Virtual laboratory catalog seed. Simulation configuration
-- remains in the application, while catalog metadata and every
-- completed experiment are persisted in Supabase.
-- =========================================================

insert into public.labs (
  grade,
  title,
  normalized_title,
  slug,
  description,
  instruction,
  requires_table,
  requires_graph,
  requires_conclusion,
  content_status,
  order_index,
  is_active
)
values
  (
    7,
    'Ньютонның екінші заңын зерттеу',
    'ньютонның екінші заңын зерттеу',
    'newton-second-law',
    'Күш пен масса өзгергенде үдеу қалай өзгеретінін өлшеп, a = F / m тәуелділігін тексеріңіз.',
    'Кемінде үш түрлі параметр таңдаңыз, өлшеулерді кестеге енгізіңіз, графикті талдап, қорытынды жазыңыз.',
    true, true, true, 'ready', 10, true
  ),
  (
    7,
    'Гук заңын зерттеу',
    'гук заңын зерттеу',
    'hooke-law',
    'Серіппенің ұзаруын өлшеп, күш пен ұзару арасындағы F = kx тәуелділігін тексеріңіз.',
    'Кемінде үш түрлі күш мәнін таңдаңыз, өлшеулерді салыстырыңыз және сызықтық тәуелділік туралы қорытынды жазыңыз.',
    true, true, true, 'ready', 20, true
  ),
  (
    7,
    'Архимед күшін зерттеу',
    'архимед күшін зерттеу',
    'archimedes-law',
    'Сұйықтық түрі, көлем және бату деңгейіне қарай Архимед күшінің өзгерісін өлшеңіз.',
    'Сұйықтық тығыздығын және батырылған көлемді өзгертіп, кемінде үш өлшеу жүргізіңіз.',
    true, true, true, 'ready', 30, true
  ),
  (
    8,
    'Ом заңын зерттеу',
    'ом заңын зерттеу',
    'ohm-law',
    'Кернеу мен кедергіні өзгертіп, ток күші I = U / R тәуелділігін өлшеңіз.',
    'Кернеу мен кедергіні өзгертіңіз, ток күшін салыстырыңыз және график бойынша қорытынды жазыңыз.',
    true, true, true, 'ready', 40, true
  ),
  (
    7,
    'Жарықтың шағылу заңын зерттеу',
    'жарықтың шағылу заңын зерттеу',
    'reflection-law',
    'Түсу бұрышын өзгертіп, шағылу бұрышының α = β теңдігін тексеріңіз.',
    'Әртүрлі түсу бұрыштарын орнатыңыз, шағылу бұрышын өлшеңіз және заңдылықты тұжырымдаңыз.',
    true, true, true, 'ready', 50, true
  )
on conflict (grade, normalized_title)
do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  instruction = excluded.instruction,
  requires_table = excluded.requires_table,
  requires_graph = excluded.requires_graph,
  requires_conclusion = excluded.requires_conclusion,
  content_status = excluded.content_status,
  order_index = excluded.order_index,
  is_active = excluded.is_active,
  updated_at = now();
-- =========================================================
-- Plan.Teach_kz
-- 019_enriched_task_pack_content.sql
-- Enrich the generated task-pack bank with varied, evidence-based
-- prompts. The public view still excludes every correct_answer value.
-- =========================================================

do $$
declare
  p record;
  i int;
  prompts text[];
  titles text[];
  option_sets jsonb[];
  correct_ids text[];
  calc_prompts text[];
begin
  titles := array[
    'Модельді таңдау',
    'Графикті дәлелмен талдау',
    'Бақыланатын параметр',
    'SI жүйесін тексеру',
    'Эксперимент дәлелі',
    'Қате нәтижені диагностикалау',
    'Тәуелділікті анықтау',
    'Модель шекарасы',
    'Зерттеу жоспары',
    'Ғылыми қорытынды'
  ];

  prompts := array[
    '%1$s тақырыбында %2$s моделін қолданар алдында қандай тексеріс бірінші орындалуы керек?',
    '%1$s бойынша тәжірибеде график нүктелері теориялық сызықтан аздап ауытқыды. Ең ғылыми әрекетті таңдаңыз.',
    '%1$s заңындағы бір шаманың әсерін жеке анықтау үшін эксперимент қалай ұйымдастырылады?',
    '%1$s есебінде %2$s формуласын қолданғанда жасырын өлшем бірлігі қатесін болдырмайтын дұрыс тәсілді таңдаңыз.',
    '%1$s заңын тәжірибемен растауға қай дерек ең сенімді дәлел болады?',
    '%1$s есебінің жауабы күтілген шамадан 1000 есе артық шықты. Тексеруді неден бастаған дұрыс?',
    '%1$s бойынша тәуелділікті анықтау үшін графикпен жұмыс істеудің дұрыс ретін таңдаңыз.',
    '%1$s моделін кез келген жағдайда тікелей қолдануға болмайды. Неге?',
    '%1$s бойынша қысқа зерттеу жүргізу үшін қандай өлшеу жоспары жеткілікті дәлел береді?',
    '%1$s бойынша ғылыми қорытынды қандай түрде жазылуы керек?'
  ];

  option_sets := array[
    jsonb_build_array(
      jsonb_build_object('id','a','text','Тек формуланы жатқа жазу'),
      jsonb_build_object('id','b','text','Шамалардың физикалық мағынасын, SI бірлігін және модельдің қолданылу шартын тексеру'),
      jsonb_build_object('id','c','text','Бір ғана кездейсоқ өлшеуді пайдалану'),
      jsonb_build_object('id','d','text','График құрмай нәтижені дөңгелектеу')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Ауытқуды жасырып, тек теориялық сызықты қалдыру'),
      jsonb_build_object('id','b','text','Бір нүктені өшіріп, қалғанын есептемеу'),
      jsonb_build_object('id','c','text','Өлшеуді қайталап, қателікті бағалап, ауытқудың себебін түсіндіру'),
      jsonb_build_object('id','d','text','Формула жарамсыз деп бірден қорытынды жасау')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Бір параметрді өзгертіп, қалған маңызды параметрлерді тұрақты ұстау'),
      jsonb_build_object('id','b','text','Барлық параметрді бір уақытта өзгерту'),
      jsonb_build_object('id','c','text','Тек соңғы өлшеуді сақтау'),
      jsonb_build_object('id','d','text','Өлшеусіз тек теориялық тұжырым жазу')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Сандарды бірден калькуляторға енгізу'),
      jsonb_build_object('id','b','text','Жауап шыққаннан кейін ғана бірліктерді қосу'),
      jsonb_build_object('id','c','text','Тек үлкен сандарды SI жүйесіне ауыстыру'),
      jsonb_build_object('id','d','text','Берілгендерді жазып, әр шаманы SI жүйесіне түрлендіріп, содан кейін формуланы қолдану')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Бір рет алынған кез келген сан'),
      jsonb_build_object('id','b','text','Кемінде үш өлшеуден алынған кесте, сәйкес график және модельмен салыстырылған қорытынды'),
      jsonb_build_object('id','c','text','Тек формуланың атауы'),
      jsonb_build_object('id','d','text','Өлшем бірлігі көрсетілмеген нәтиже')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Формуланың түсін өзгерту'),
      jsonb_build_object('id','b','text','График атауын өшіру'),
      jsonb_build_object('id','c','text','SI түрлендіруін және 10, 100, 1000 коэффициенттерін қайта тексеру'),
      jsonb_build_object('id','d','text','Қатені елемей жауапты дөңгелектеу')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Осьтерді бірлікпен белгілеу, бірнеше нүкте енгізу, трендті талдау және формуламен салыстыру'),
      jsonb_build_object('id','b','text','Осьтерді атамай екі нүктені қосу'),
      jsonb_build_object('id','c','text','Тек ең үлкен нүктені көрсету'),
      jsonb_build_object('id','d','text','График орнына формуланы қайта көшіру')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Барлық заң тек бір ғана санға арналған'),
      jsonb_build_object('id','b','text','Өлшем бірлігі физикада маңызды емес'),
      jsonb_build_object('id','c','text','Кез келген формула тек графиксіз жұмыс істейді'),
      jsonb_build_object('id','d','text','Әр модель нақты шарттар мен жуықтауларға сүйенеді; олар бұзылса нәтижені қайта бағалау керек')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Бір өлшеу және дайын жауап'),
      jsonb_build_object('id','b','text','Кемінде үш түрлі параметр мәні, өлшеу кестесі, график және қателік туралы қысқа түсіндірме'),
      jsonb_build_object('id','c','text','Тек формула жазылған парақ'),
      jsonb_build_object('id','d','text','Бір параметрді өлшем бірлігінсіз көрсету')
    ),
    jsonb_build_array(
      jsonb_build_object('id','a','text','Тек соңғы санды жазу'),
      jsonb_build_object('id','b','text','Нәтижені дәлелсіз дұрыс деп атау'),
      jsonb_build_object('id','c','text','Дерекке сүйеніп заңдылықты сипаттау, модельмен салыстыру және ауытқудың ықтимал себебін көрсету'),
      jsonb_build_object('id','d','text','Графикті түсіндірмей көшіру')
    )
  ];

  correct_ids := array['b','c','a','d','b','c','a','d','b','c'];

  calc_prompts := array[
    '%1$s бойынша тура есеп құрыңыз: %2$s моделіндегі шамаларды физикалық мағынасына сай атаңыз, үш реалистік SI мәнін таңдаңыз және белгісіз шаманы толық шешу жолымен есептеңіз.',
    '%1$s бойынша кері есеп орындаңыз: %2$s формуласындағы нәтиже алдын ала берілді деп алып, қажетті параметрдің мәнін шығарыңыз. Формуланы түрлендіру қадамын бөлек көрсетіңіз.',
    '%1$s бойынша қате талдауын жасаңыз: оқушы SI түрлендіруінде бір коэффициентті қате қолданды деп есептеңіз. Қате жауаптың қалай өзгеретінін сандық мысалмен дәлелдеңіз.',
    '%1$s бойынша графиктік есеп орындаңыз: кемінде төрт мәннен тұратын деректер кестесін құрып, осьтерді бірлікпен белгілеңіз және график көлбеулігінің физикалық мағынасын түсіндіріңіз.',
    '%1$s бойынша инженерлік шешім ұсыныңыз: %2$s моделін қолданып, берілген нәтижеге жету үшін қай параметрді өзгерту тиімді екенін есеппен және қысқа негіздемемен көрсетіңіз.'
  ];

  for p in select id, title, formula from public.task_packs loop
    for i in 1..10 loop
      update public.task_pack_items
      set
        title = titles[i],
        prompt = format(prompts[i], p.title, coalesce(p.formula, 'негізгі физикалық заң')),
        instruction = 'Бір дұрыс жауапты таңдаңыз. Жауап формула жаттауды емес, физикалық пайымдауды тексереді.',
        options = option_sets[i],
        correct_answer = to_jsonb(correct_ids[i]),
        explanation = 'Физикалық модельді қолдануда формула, SI жүйесі, бақыланатын параметр, өлшеу дәлдігі және дерекке сүйенген қорытынды бірге қарастырылады.',
        skill_codes = case
          when i in (2,7,10) then array['graph_analysis','data_analysis','reasoning']
          when i in (4,6) then array['unit_conversion','calculation','reasoning']
          when i in (3,5,9) then array['experiment_setup','measurement','data_analysis']
          else array['concept_understanding','formula_application','reasoning']
        end
      where pack_id = p.id and kind = 'test' and order_index = i;
    end loop;

    for i in 1..5 loop
      update public.task_pack_items
      set
        title = case i
          when 1 then 'Тура есеп және SI жүйесі'
          when 2 then 'Кері есеп және формуланы түрлендіру'
          when 3 then 'Қате шешімді диагностикалау'
          when 4 then 'Кесте мен график арқылы талдау'
          else 'Инженерлік параметрді таңдау'
        end,
        prompt = format(calc_prompts[i], p.title, coalesce(p.formula, 'негізгі физикалық заң')),
        instruction = 'Формула, берілгендер, SI түрлендіруі, аралық есептеулер және қорытынды міндетті. Жұмысты мұғалім тексереді.',
        explanation = 'Ашық есепте тек соңғы сан емес, модельді таңдау, түрлендіру, дәлел және қорытынды бағаланады.',
        skill_codes = case i
          when 1 then array['formula_application','unit_conversion','calculation']
          when 2 then array['formula_application','calculation','reasoning']
          when 3 then array['unit_conversion','calculation','reasoning']
          when 4 then array['graph_analysis','data_analysis','calculation']
          else array['real_life_application','reasoning','calculation']
        end
      where pack_id = p.id and kind = 'calculation' and order_index = 10 + i;
    end loop;

    update public.task_pack_items
    set
      title = 'Зертханалық / практикалық зерттеу',
      prompt = format('%s тақырыбы бойынша виртуалды немесе қолжетімді құралдармен зерттеу жүргізіңіз. Бір тәуелсіз параметрді кемінде үш рет өзгертіңіз, қалған маңызды параметрлерді тұрақты ұстаңыз, өлшеу кестесін жасаңыз, графикті сипаттаңыз, қателік көзін атаңыз және дерекке сүйенген қорытынды жазыңыз.', p.title),
      instruction = 'Төмендегі 2D зертханаға өтуге болады. Жауапта құралдар, тұрақты және өзгеретін параметрлер, кемінде 3 өлшеу, график сипаттамасы, қателік көзі және қорытынды болуы керек.',
      explanation = 'Зертханалық жұмыс мұғалім тексеруіне жіберіледі және experiment, measurement, graph_analysis, data_analysis, conclusion дағдыларына әсер етеді.',
      skill_codes = array['experiment_setup','measurement','graph_analysis','data_analysis','conclusion']
    where pack_id = p.id and kind = 'lab' and order_index = 16;
  end loop;
end $$;
-- =========================================================
-- Plan.Teach_kz
-- 020_server_write_only_rls.sql
-- Harden adaptive learning writes: browsers receive read access only.
-- Trusted mutations run inside server-only API routes with the service key.
-- =========================================================

-- Remove permissive browser write policies created by the initial adaptive MVP.
drop policy if exists "student_attempts_insert_own" on public.student_attempts;
drop policy if exists "student_attempts_update_teacher" on public.student_attempts;
drop policy if exists "student_skill_mastery_insert_own" on public.student_skill_mastery;
drop policy if exists "student_skill_mastery_update_own" on public.student_skill_mastery;
drop policy if exists "student_topic_mastery_insert_own" on public.student_topic_mastery;
drop policy if exists "student_topic_mastery_update_own" on public.student_topic_mastery;
drop policy if exists "student_review_queue_insert_own" on public.student_review_queue;
drop policy if exists "student_review_queue_update_own" on public.student_review_queue;
drop policy if exists "adaptive_recommendations_insert_own" on public.adaptive_recommendations;
drop policy if exists "adaptive_recommendations_update_access" on public.adaptive_recommendations;
drop policy if exists "learning_events_insert_own" on public.learning_events;
drop policy if exists "lab_submissions_insert_own" on public.lab_submissions;
drop policy if exists "lab_submissions_update_access" on public.lab_submissions;
drop policy if exists "task_pack_attempts_insert_own" on public.task_pack_attempts;
drop policy if exists "task_pack_attempts_update_teacher" on public.task_pack_attempts;

-- Authenticated browser sessions can inspect allowed rows, but cannot forge scores,
-- feedback, mastery, recommendations, events or laboratory results.
revoke insert, update, delete on public.student_attempts from authenticated;
revoke insert, update, delete on public.student_skill_mastery from authenticated;
revoke insert, update, delete on public.student_topic_mastery from authenticated;
revoke insert, update, delete on public.student_review_queue from authenticated;
revoke insert, update, delete on public.adaptive_recommendations from authenticated;
revoke insert, update, delete on public.learning_events from authenticated;
revoke insert, update, delete on public.lab_submissions from authenticated;
revoke insert, update, delete on public.task_pack_attempts from authenticated;
