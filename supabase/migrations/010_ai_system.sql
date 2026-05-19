-- =========================================================
-- Plan.Teach_kz
-- 010_ai_system.sql
-- AI tutor, chat history, solution review, route recommendation tables
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. ai_chats
-- Оқушы мен AI арасындағы сұхбат сессиялары
-- topic_id болсо білік табырудың контексі
-- =========================================================

create table if not exists public.ai_chats (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete set null,

  title text not null default 'Сұхбат',
  status text not null default 'active'
    check (status in ('active', 'archived')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chats_student_id_idx on public.ai_chats(student_id);
create index if not exists ai_chats_topic_id_idx on public.ai_chats(topic_id);
create index if not exists ai_chats_status_idx on public.ai_chats(status);

drop trigger if exists ai_chats_set_updated_at on public.ai_chats;

create trigger ai_chats_set_updated_at
before update on public.ai_chats
for each row
execute function public.set_updated_at();

-- =========================================================
-- 2. ai_chat_messages
-- Сұхбат ішіндегі жеке хабарлар
-- role: user | assistant | system
-- intent: optional BI бағыт белгісі
-- =========================================================

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),

  chat_id uuid not null references public.ai_chats(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,

  role text not null
    check (role in ('user', 'assistant', 'system')),
  content text not null,

  intent text,

  created_at timestamptz not null default now()
);

create index if not exists ai_chat_messages_chat_id_idx on public.ai_chat_messages(chat_id);
create index if not exists ai_chat_messages_student_id_idx on public.ai_chat_messages(student_id);
create index if not exists ai_chat_messages_role_idx on public.ai_chat_messages(role);

-- =========================================================
-- 3. ai_task_hints
-- Тапсырма орындау кезінде AI кеңесі
-- hint_level: 1=simple, 2=formula, 3=stepwise, 4=similar_example
-- =========================================================

create table if not exists public.ai_task_hints (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,

  hint_level int not null default 1 check (hint_level between 1 and 4),
  hint_text text not null,

  created_at timestamptz not null default now()
);

create index if not exists ai_task_hints_student_id_idx on public.ai_task_hints(student_id);
create index if not exists ai_task_hints_task_id_idx on public.ai_task_hints(task_id);

-- =========================================================
-- 4. ai_solution_reviews
-- Оқушы жауап төнеген соң AI талдау
-- score: 0-100 баллы (опционалды)
-- =========================================================

create table if not exists public.ai_solution_reviews (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  attempt_id uuid references public.task_attempts(id) on delete set null,

  input_text text not null,

  formula_feedback text,
  unit_feedback text,
  logic_feedback text,
  final_answer_feedback text,
  overall_feedback text,

  score numeric(5, 2),

  created_at timestamptz not null default now()
);

create index if not exists ai_solution_reviews_student_id_idx on public.ai_solution_reviews(student_id);
create index if not exists ai_solution_reviews_task_id_idx on public.ai_solution_reviews(task_id);
create index if not exists ai_solution_reviews_attempt_id_idx on public.ai_solution_reviews(attempt_id);

-- =========================================================
-- 5. ai_route_recommendations
-- Диагностика нәтижесі негіздесінде персоналды маршрут
-- weak_topics, strong_topics, interests, recommended_topics: JSONB arrays
-- =========================================================

create table if not exists public.ai_route_recommendations (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,
  diagnostic_result_id uuid references public.diagnostic_results(id) on delete set null,

  level text,
  weak_topics jsonb not null default '[]',
  strong_topics jsonb not null default '[]',
  interests jsonb not null default '[]',
  recommended_topics jsonb not null default '[]',
  recommended_tasks jsonb not null default '[]',

  summary text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_route_recommendations_student_id_idx on public.ai_route_recommendations(student_id);
create index if not exists ai_route_recommendations_diagnostic_result_id_idx on public.ai_route_recommendations(diagnostic_result_id);

drop trigger if exists ai_route_recommendations_set_updated_at on public.ai_route_recommendations;

create trigger ai_route_recommendations_set_updated_at
before update on public.ai_route_recommendations
for each row
execute function public.set_updated_at();

-- =========================================================
-- 6. ai_student_memory
-- Оқушының AI сыртқы-сессиялық сақтаусы
-- memory_key: бірегей сәйкестер (мыс. "learning_style")
-- memory_value: JSONB деректер
-- =========================================================

create table if not exists public.ai_student_memory (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null references public.profiles(id) on delete cascade,
  memory_key text not null,
  memory_value jsonb not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (student_id, memory_key)
);

create index if not exists ai_student_memory_student_id_idx on public.ai_student_memory(student_id);

drop trigger if exists ai_student_memory_set_updated_at on public.ai_student_memory;

create trigger ai_student_memory_set_updated_at
before update on public.ai_student_memory
for each row
execute function public.set_updated_at();

-- =========================================================
-- 7. RLS enable
-- =========================================================

alter table public.ai_chats enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.ai_task_hints enable row level security;
alter table public.ai_solution_reviews enable row level security;
alter table public.ai_route_recommendations enable row level security;
alter table public.ai_student_memory enable row level security;

-- =========================================================
-- 8. ai_chats RLS
-- =========================================================

drop policy if exists "ai_chats_select_own_or_teacher" on public.ai_chats;
drop policy if exists "ai_chats_insert_own" on public.ai_chats;
drop policy if exists "ai_chats_update_own" on public.ai_chats;
drop policy if exists "ai_chats_delete_admin" on public.ai_chats;

create policy "ai_chats_select_own_or_teacher"
on public.ai_chats
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

create policy "ai_chats_insert_own"
on public.ai_chats
for insert
to authenticated
with check (student_id = auth.uid());

create policy "ai_chats_update_own"
on public.ai_chats
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "ai_chats_delete_admin"
on public.ai_chats
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 9. ai_chat_messages RLS
-- =========================================================

drop policy if exists "ai_chat_messages_select_own_or_teacher" on public.ai_chat_messages;
drop policy if exists "ai_chat_messages_insert_own" on public.ai_chat_messages;
drop policy if exists "ai_chat_messages_delete_admin" on public.ai_chat_messages;

create policy "ai_chat_messages_select_own_or_teacher"
on public.ai_chat_messages
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

create policy "ai_chat_messages_insert_own"
on public.ai_chat_messages
for insert
to authenticated
with check (student_id = auth.uid());

create policy "ai_chat_messages_delete_admin"
on public.ai_chat_messages
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 10. ai_task_hints RLS
-- =========================================================

drop policy if exists "ai_task_hints_select_own_or_teacher" on public.ai_task_hints;
drop policy if exists "ai_task_hints_insert_own" on public.ai_task_hints;
drop policy if exists "ai_task_hints_delete_admin" on public.ai_task_hints;

create policy "ai_task_hints_select_own_or_teacher"
on public.ai_task_hints
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

create policy "ai_task_hints_insert_own"
on public.ai_task_hints
for insert
to authenticated
with check (student_id = auth.uid());

create policy "ai_task_hints_delete_admin"
on public.ai_task_hints
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 11. ai_solution_reviews RLS
-- =========================================================

drop policy if exists "ai_solution_reviews_select_own_or_teacher" on public.ai_solution_reviews;
drop policy if exists "ai_solution_reviews_insert_own" on public.ai_solution_reviews;
drop policy if exists "ai_solution_reviews_delete_admin" on public.ai_solution_reviews;

create policy "ai_solution_reviews_select_own_or_teacher"
on public.ai_solution_reviews
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

create policy "ai_solution_reviews_insert_own"
on public.ai_solution_reviews
for insert
to authenticated
with check (student_id = auth.uid());

create policy "ai_solution_reviews_delete_admin"
on public.ai_solution_reviews
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 12. ai_route_recommendations RLS
-- =========================================================

drop policy if exists "ai_route_recommendations_select_own_or_teacher" on public.ai_route_recommendations;
drop policy if exists "ai_route_recommendations_insert_own" on public.ai_route_recommendations;
drop policy if exists "ai_route_recommendations_update_own" on public.ai_route_recommendations;
drop policy if exists "ai_route_recommendations_delete_admin" on public.ai_route_recommendations;

create policy "ai_route_recommendations_select_own_or_teacher"
on public.ai_route_recommendations
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

create policy "ai_route_recommendations_insert_own"
on public.ai_route_recommendations
for insert
to authenticated
with check (student_id = auth.uid());

create policy "ai_route_recommendations_update_own"
on public.ai_route_recommendations
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "ai_route_recommendations_delete_admin"
on public.ai_route_recommendations
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 13. ai_student_memory RLS
-- =========================================================

drop policy if exists "ai_student_memory_select_own" on public.ai_student_memory;
drop policy if exists "ai_student_memory_insert_own" on public.ai_student_memory;
drop policy if exists "ai_student_memory_update_own" on public.ai_student_memory;
drop policy if exists "ai_student_memory_delete_admin" on public.ai_student_memory;

create policy "ai_student_memory_select_own"
on public.ai_student_memory
for select
to authenticated
using (student_id = auth.uid());

create policy "ai_student_memory_insert_own"
on public.ai_student_memory
for insert
to authenticated
with check (student_id = auth.uid());

create policy "ai_student_memory_update_own"
on public.ai_student_memory
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "ai_student_memory_delete_admin"
on public.ai_student_memory
for delete
to authenticated
using (public.is_admin(auth.uid()));

-- =========================================================
-- 14. Grants
-- =========================================================

grant select, insert, update, delete on public.ai_chats to authenticated;
grant select, insert, update, delete on public.ai_chat_messages to authenticated;
grant select, insert, update, delete on public.ai_task_hints to authenticated;
grant select, insert, update, delete on public.ai_solution_reviews to authenticated;
grant select, insert, update, delete on public.ai_route_recommendations to authenticated;
grant select, insert, update, delete on public.ai_student_memory to authenticated;

-- =========================================================
-- 15. Comments
-- =========================================================

comment on table public.ai_chats is
'Оқушы мен AI арасындағы сұхбат сессиялары. Тақырып бойынша немесе жалпы біліктеу үшін.';

comment on table public.ai_chat_messages is
'Сұхбат ішіндегі жеке хабарлар. Пайдаланушы немесе AI ассистент ролінде.';

comment on table public.ai_task_hints is
'Тапсырма орындау кезінде AI кеңесі. Түрлі деңгейде кеңес беру.';

comment on table public.ai_solution_reviews is
'Оқушы жауап төнеген соң AI талдау. Формула, бірлік, логика, қорытынды анализі.';

comment on table public.ai_route_recommendations is
'Диагностика нәтижесі негіздесінде персоналды оқу маршруты.';

comment on table public.ai_student_memory is
'Оқушының оқу стилі, прогресі және басқа персоналды деректер.';
