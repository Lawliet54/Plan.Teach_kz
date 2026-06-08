begin;

create extension if not exists pgcrypto;

create table if not exists public.lesson_mini_task_progress (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references public.profiles(id)
    on delete cascade,

  grade smallint not null,
  topic_slug text not null,
  task_id text not null,
  task_type text not null,

  attempts integer not null default 0,
  is_completed boolean not null default false,
  last_is_correct boolean,
  last_answer jsonb not null default '{}'::jsonb,

  completed_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lesson_mini_task_progress_grade_check
    check (grade between 7 and 11),

  constraint lesson_mini_task_progress_topic_slug_check
    check (char_length(trim(topic_slug)) > 0),

  constraint lesson_mini_task_progress_task_id_check
    check (char_length(trim(task_id)) > 0),

  constraint lesson_mini_task_progress_task_type_check
    check (
      task_type in (
        'single-choice',
        'multiple-choice',
        'matching'
      )
    ),

  constraint lesson_mini_task_progress_attempts_check
    check (attempts >= 0),

  constraint lesson_mini_task_progress_student_topic_unique
    unique (student_id, grade, topic_slug)
);

create index if not exists lesson_mini_task_progress_student_id_idx
  on public.lesson_mini_task_progress(student_id);

create index if not exists lesson_mini_task_progress_student_grade_idx
  on public.lesson_mini_task_progress(student_id, grade);

create index if not exists lesson_mini_task_progress_completed_idx
  on public.lesson_mini_task_progress(student_id, is_completed);

create or replace function public.update_lesson_mini_task_progress_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lesson_mini_task_progress_updated_at
  on public.lesson_mini_task_progress;

create trigger lesson_mini_task_progress_updated_at
before update on public.lesson_mini_task_progress
for each row
execute function public.update_lesson_mini_task_progress_timestamp();

alter table public.lesson_mini_task_progress enable row level security;

drop policy if exists lesson_mini_task_progress_select_own
  on public.lesson_mini_task_progress;

create policy lesson_mini_task_progress_select_own
on public.lesson_mini_task_progress
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists lesson_mini_task_progress_insert_own
  on public.lesson_mini_task_progress;

create policy lesson_mini_task_progress_insert_own
on public.lesson_mini_task_progress
for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists lesson_mini_task_progress_update_own
  on public.lesson_mini_task_progress;

create policy lesson_mini_task_progress_update_own
on public.lesson_mini_task_progress
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

commit;