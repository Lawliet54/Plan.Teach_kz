-- =========================================================
-- Plan.Teach_kz
-- 003_student_interests.sql
-- Student interests after diagnostic
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists public.student_interests (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,

  interest_key text not null,
  title text not null,
  category text not null default 'physics',
  description text,

  priority int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (student_id, interest_key)
);

create index if not exists student_interests_student_id_idx
on public.student_interests(student_id);

create index if not exists student_interests_interest_key_idx
on public.student_interests(interest_key);

drop trigger if exists student_interests_set_updated_at on public.student_interests;

create trigger student_interests_set_updated_at
before update on public.student_interests
for each row
execute function public.set_updated_at();

alter table public.student_interests enable row level security;

drop policy if exists "student_interests_select_access" on public.student_interests;
drop policy if exists "student_interests_insert_own" on public.student_interests;
drop policy if exists "student_interests_update_own" on public.student_interests;
drop policy if exists "student_interests_delete_own_or_admin" on public.student_interests;

create policy "student_interests_select_access"
on public.student_interests
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
);

create policy "student_interests_insert_own"
on public.student_interests
for insert
to authenticated
with check (
  student_id = auth.uid()
);

create policy "student_interests_update_own"
on public.student_interests
for update
to authenticated
using (
  student_id = auth.uid()
)
with check (
  student_id = auth.uid()
);

create policy "student_interests_delete_own_or_admin"
on public.student_interests
for delete
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin(auth.uid())
);

comment on table public.student_interests is
'Диагностикадан кейін оқушы таңдаған физика қызығушылықтары. AI Tutor және жеке маршрут үшін қолданылады.';