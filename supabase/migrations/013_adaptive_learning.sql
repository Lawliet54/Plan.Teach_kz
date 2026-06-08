-- =========================================================
-- Plan.Teach_kz
-- 013_adaptive_learning.sql
-- Adaptive learning progress and attempt history
-- =========================================================

-- =========================================================
-- 1. Topic progress
-- Әр оқушының әр тақырып бойынша ағымдағы күйі.
-- =========================================================

create table if not exists public.learning_topic_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,

  grade int not null
    check (grade between 7 and 11),

  topic_slug text not null
    check (length(trim(topic_slug)) > 0),

  current_level text not null
    check (current_level in ('basic', 'medium', 'advanced')),

  next_recommended_level text not null
    check (next_recommended_level in ('basic', 'medium', 'advanced')),

  is_completed boolean not null default false,

  attempts int not null default 0
    check (attempts >= 0),

  best_percent int not null default 0
    check (best_percent between 0 and 100),

  last_percent int
    check (last_percent is null or last_percent between 0 and 100),

  last_completed_at timestamptz,

  decision_type text
    check (
      decision_type is null
      or decision_type in (
        'completed_next_higher',
        'completed_keep_level',
        'retry_required',
        'mastered'
      )
    ),

  decision jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (student_id, grade, topic_slug)
);

create index if not exists learning_topic_progress_student_id_idx
on public.learning_topic_progress(student_id);

create index if not exists learning_topic_progress_grade_idx
on public.learning_topic_progress(grade);

create index if not exists learning_topic_progress_completed_idx
on public.learning_topic_progress(student_id, is_completed);

drop trigger if exists learning_topic_progress_set_updated_at
on public.learning_topic_progress;

create trigger learning_topic_progress_set_updated_at
before update on public.learning_topic_progress
for each row
execute function public.set_updated_at();

-- =========================================================
-- 2. Attempt history
-- Әр тапсыру нәтижесі бөлек сақталады.
-- =========================================================

create table if not exists public.learning_attempts (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,

  grade int not null
    check (grade between 7 and 11),

  topic_slug text not null
    check (length(trim(topic_slug)) > 0),

  level text not null
    check (level in ('basic', 'medium', 'advanced')),

  percent int not null
    check (percent between 0 and 100),

  correct_count int not null
    check (correct_count >= 0),

  total_count int not null
    check (total_count > 0),

  decision_type text not null
    check (
      decision_type in (
        'completed_next_higher',
        'completed_keep_level',
        'retry_required',
        'mastered'
      )
    ),

  decision jsonb not null,

  created_at timestamptz not null default now(),

  constraint learning_attempts_correct_total_check
    check (correct_count <= total_count)
);

create index if not exists learning_attempts_student_id_idx
on public.learning_attempts(student_id);

create index if not exists learning_attempts_topic_idx
on public.learning_attempts(student_id, grade, topic_slug);

create index if not exists learning_attempts_created_at_idx
on public.learning_attempts(created_at desc);

-- =========================================================
-- 3. Atomic save RPC
-- Attempt және progress бір транзакция ішінде сақталады.
-- =========================================================

create or replace function public.record_learning_attempt(
  p_grade int,
  p_topic_slug text,
  p_level text,
  p_percent int,
  p_correct_count int,
  p_total_count int,
  p_decision_type text,
  p_next_recommended_level text,
  p_is_completed boolean,
  p_decision jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_progress public.learning_topic_progress;
begin
  v_student_id := auth.uid();

  if v_student_id is null then
    raise exception 'Қолданушы авторизациядан өтпеген';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = v_student_id
      and p.role = 'student'
  ) then
    raise exception 'Бұл әрекет тек оқушыға қолжетімді';
  end if;

  if p_grade < 7 or p_grade > 11 then
    raise exception 'Сынып мәні қате';
  end if;

  if p_level not in ('basic', 'medium', 'advanced') then
    raise exception 'Деңгей мәні қате';
  end if;

  if p_next_recommended_level not in ('basic', 'medium', 'advanced') then
    raise exception 'Келесі деңгей мәні қате';
  end if;

  if p_percent < 0 or p_percent > 100 then
    raise exception 'Пайыз мәні қате';
  end if;

  if p_total_count <= 0 then
    raise exception 'Тапсырма саны қате';
  end if;

  if p_correct_count < 0 or p_correct_count > p_total_count then
    raise exception 'Дұрыс жауап саны қате';
  end if;

  insert into public.learning_attempts (
    student_id,
    grade,
    topic_slug,
    level,
    percent,
    correct_count,
    total_count,
    decision_type,
    decision
  )
  values (
    v_student_id,
    p_grade,
    trim(p_topic_slug),
    p_level,
    p_percent,
    p_correct_count,
    p_total_count,
    p_decision_type,
    p_decision
  );

  insert into public.learning_topic_progress (
    student_id,
    grade,
    topic_slug,
    current_level,
    next_recommended_level,
    is_completed,
    attempts,
    best_percent,
    last_percent,
    last_completed_at,
    decision_type,
    decision
  )
  values (
    v_student_id,
    p_grade,
    trim(p_topic_slug),
    p_level,
    p_next_recommended_level,
    p_is_completed,
    1,
    p_percent,
    p_percent,
    now(),
    p_decision_type,
    p_decision
  )
  on conflict (student_id, grade, topic_slug)
  do update set
    current_level = excluded.current_level,

    next_recommended_level =
      case
        when excluded.is_completed
          then excluded.next_recommended_level
        else public.learning_topic_progress.next_recommended_level
      end,

    is_completed =
      public.learning_topic_progress.is_completed
      or excluded.is_completed,

    attempts =
      public.learning_topic_progress.attempts + 1,

    best_percent =
      greatest(
        public.learning_topic_progress.best_percent,
        excluded.best_percent
      ),

    last_percent = excluded.last_percent,
    last_completed_at = excluded.last_completed_at,
    decision_type = excluded.decision_type,
    decision = excluded.decision,
    updated_at = now()

  returning *
  into v_progress;

  return to_jsonb(v_progress);
end;
$$;

-- =========================================================
-- 4. RLS
-- =========================================================

alter table public.learning_topic_progress enable row level security;
alter table public.learning_attempts enable row level security;

drop policy if exists "learning_topic_progress_select_access"
on public.learning_topic_progress;

drop policy if exists "learning_topic_progress_insert_own"
on public.learning_topic_progress;

drop policy if exists "learning_topic_progress_update_own"
on public.learning_topic_progress;

drop policy if exists "learning_topic_progress_delete_own_or_admin"
on public.learning_topic_progress;

create policy "learning_topic_progress_select_access"
on public.learning_topic_progress
for select
to authenticated
using (
  public.can_view_student(auth.uid(), student_id)
);

create policy "learning_topic_progress_insert_own"
on public.learning_topic_progress
for insert
to authenticated
with check (
  student_id = auth.uid()
);

create policy "learning_topic_progress_update_own"
on public.learning_topic_progress
for update
to authenticated
using (
  student_id = auth.uid()
)
with check (
  student_id = auth.uid()
);

create policy "learning_topic_progress_delete_own_or_admin"
on public.learning_topic_progress
for delete
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin(auth.uid())
);

drop policy if exists "learning_attempts_select_access"
on public.learning_attempts;

drop policy if exists "learning_attempts_insert_own"
on public.learning_attempts;

drop policy if exists "learning_attempts_delete_admin"
on public.learning_attempts;

create policy "learning_attempts_select_access"
on public.learning_attempts
for select
to authenticated
using (
  public.can_view_student(auth.uid(), student_id)
);

create policy "learning_attempts_insert_own"
on public.learning_attempts
for insert
to authenticated
with check (
  student_id = auth.uid()
);

create policy "learning_attempts_delete_admin"
on public.learning_attempts
for delete
to authenticated
using (
  public.is_admin(auth.uid())
);

-- =========================================================
-- 5. Privileges
-- =========================================================

grant select, insert, update, delete
on public.learning_topic_progress
to authenticated;

grant select, insert
on public.learning_attempts
to authenticated;

grant execute
on function public.record_learning_attempt(
  int,
  text,
  text,
  int,
  int,
  int,
  text,
  text,
  boolean,
  jsonb
)
to authenticated;

comment on table public.learning_topic_progress is
'Оқушының әр тақырып бойынша адаптивті оқу прогресі.';

comment on table public.learning_attempts is
'Оқушының тақырыптық тапсырманы тапсыру тарихы.';
