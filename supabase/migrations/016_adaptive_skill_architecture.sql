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
