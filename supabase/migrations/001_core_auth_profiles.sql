-- =========================================================
-- Plan.Teach_kz
-- 001_core_auth_profiles.sql
-- Core auth profile, roles, teacher-student relation, RLS
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. updated_at helper
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- 2. profiles
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text not null default 'Атаусыз қолданушы',
  email text,

  role text not null default 'student'
    check (role in ('student', 'teacher', 'admin')),

  teacher_id uuid references public.profiles(id) on delete set null,

  level text
    check (level is null or level in ('beginner', 'intermediate', 'advanced')),

  current_grade int
    check (current_grade is null or current_grade between 7 and 11),

  diagnostic_completed boolean not null default false,
  onboarding_completed boolean not null default false,

  avatar_url text,
  last_seen_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint teacher_only_for_students
    check (
      role = 'student'
      or teacher_id is null
    )
);

create index if not exists profiles_role_idx
on public.profiles(role);

create index if not exists profiles_teacher_id_idx
on public.profiles(teacher_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================================================
-- 3. teacher_student_links
-- Мұғалім мен оқушы байланысын бөлек сақтаймыз.
-- profiles.teacher_id өзгерсе, бұл кесте автоматты sync болады.
-- =========================================================

create table if not exists public.teacher_student_links (
  id uuid primary key default gen_random_uuid(),

  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,

  status text not null default 'active'
    check (status in ('active', 'archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (teacher_id, student_id),
  constraint teacher_student_not_same check (teacher_id <> student_id)
);

create index if not exists teacher_student_links_teacher_id_idx
on public.teacher_student_links(teacher_id);

create index if not exists teacher_student_links_student_id_idx
on public.teacher_student_links(student_id);

create index if not exists teacher_student_links_status_idx
on public.teacher_student_links(status);

create trigger teacher_student_links_set_updated_at
before update on public.teacher_student_links
for each row
execute function public.set_updated_at();

-- =========================================================
-- 4. Role helper functions
-- RLS policy ішінде қайталанатын role тексерулерін функцияға шығарамыз.
-- =========================================================

create or replace function public.is_admin(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_uuid
      and p.role = 'admin'
  );
$$;

create or replace function public.is_teacher(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_uuid
      and p.role = 'teacher'
  );
$$;

create or replace function public.can_view_student(viewer_uuid uuid, student_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    viewer_uuid = student_uuid
    or public.is_admin(viewer_uuid)
    or exists (
      select 1
      from public.teacher_student_links l
      where l.teacher_id = viewer_uuid
        and l.student_id = student_uuid
        and l.status = 'active'
    );
$$;

-- =========================================================
-- 5. New auth user -> profile auto create
-- Тіркелген кезде public.profiles автоматты жасалады.
-- role және full_name кейін register form арқылы metadata-дан келеді.
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  incoming_role text;
  incoming_full_name text;
begin
  incoming_role := new.raw_user_meta_data ->> 'role';
  incoming_full_name := new.raw_user_meta_data ->> 'full_name';

  if incoming_role not in ('student', 'teacher', 'admin') then
    incoming_role := 'student';
  end if;

  if incoming_full_name is null or length(trim(incoming_full_name)) = 0 then
    incoming_full_name := coalesce(new.email, 'Атаусыз қолданушы');
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    new.email,
    incoming_full_name,
    incoming_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =========================================================
-- 6. Protect role changes
-- Қарапайым қолданушы өз role мәнін өзгерте алмауы керек.
-- SQL editor / backend admin migration үшін postgres role рұқсат етіледі.
-- =========================================================

create or replace function public.prevent_unsafe_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.id is distinct from new.id then
    raise exception 'Profile id өзгертуге болмайды';
  end if;

  if old.role is distinct from new.role then
    if current_user in ('postgres', 'supabase_admin') then
      return new;
    end if;

    if not public.is_admin(auth.uid()) then
      raise exception 'Role өзгертуге рұқсат жоқ';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unsafe_profile_changes_trigger on public.profiles;

create trigger prevent_unsafe_profile_changes_trigger
before update on public.profiles
for each row
execute function public.prevent_unsafe_profile_changes();

-- =========================================================
-- 7. Sync profiles.teacher_id -> teacher_student_links
-- Оқушы мұғалімді таңдағанда profiles.teacher_id жаңарады.
-- Сол кезде teacher_student_links автоматты жасалады.
-- =========================================================

create or replace function public.sync_teacher_student_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'student' and new.teacher_id is not null then
    insert into public.teacher_student_links (
      teacher_id,
      student_id,
      status
    )
    values (
      new.teacher_id,
      new.id,
      'active'
    )
    on conflict (teacher_id, student_id)
    do update set
      status = 'active',
      updated_at = now();
  end if;

  if old.teacher_id is not null
     and new.teacher_id is distinct from old.teacher_id then
    update public.teacher_student_links
    set status = 'archived',
        updated_at = now()
    where teacher_id = old.teacher_id
      and student_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_teacher_student_link_trigger on public.profiles;

create trigger sync_teacher_student_link_trigger
after insert or update of teacher_id on public.profiles
for each row
execute function public.sync_teacher_student_link();

-- =========================================================
-- 8. RLS enable
-- =========================================================

alter table public.profiles enable row level security;
alter table public.teacher_student_links enable row level security;

-- =========================================================
-- 9. profiles RLS policies
-- =========================================================

drop policy if exists "profiles_select_access" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_delete_admin" on public.profiles;

create policy "profiles_select_access"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or role = 'teacher'
  or public.can_view_student(auth.uid(), id)
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = id
);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or public.is_admin(auth.uid())
)
with check (
  auth.uid() = id
  or public.is_admin(auth.uid())
);

create policy "profiles_delete_admin"
on public.profiles
for delete
to authenticated
using (
  public.is_admin(auth.uid())
);

-- =========================================================
-- 10. teacher_student_links RLS policies
-- =========================================================

drop policy if exists "teacher_student_links_select_access" on public.teacher_student_links;
drop policy if exists "teacher_student_links_insert_student_or_admin" on public.teacher_student_links;
drop policy if exists "teacher_student_links_update_related_or_admin" on public.teacher_student_links;
drop policy if exists "teacher_student_links_delete_admin" on public.teacher_student_links;

create policy "teacher_student_links_select_access"
on public.teacher_student_links
for select
to authenticated
using (
  student_id = auth.uid()
  or teacher_id = auth.uid()
  or public.is_admin(auth.uid())
);

create policy "teacher_student_links_insert_student_or_admin"
on public.teacher_student_links
for insert
to authenticated
with check (
  student_id = auth.uid()
  or public.is_admin(auth.uid())
);

create policy "teacher_student_links_update_related_or_admin"
on public.teacher_student_links
for update
to authenticated
using (
  student_id = auth.uid()
  or teacher_id = auth.uid()
  or public.is_admin(auth.uid())
)
with check (
  student_id = auth.uid()
  or teacher_id = auth.uid()
  or public.is_admin(auth.uid())
);

create policy "teacher_student_links_delete_admin"
on public.teacher_student_links
for delete
to authenticated
using (
  public.is_admin(auth.uid())
);

-- =========================================================
-- 11. Helpful comments
-- =========================================================

comment on table public.profiles is
'Plan.Teach_kz қолданушы profile кестесі: student, teacher, admin role.';

comment on table public.teacher_student_links is
'Оқушы мен мұғалім байланысы. Оқушы teacher_id таңдағанда автоматты sync болады.';