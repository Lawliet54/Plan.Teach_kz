-- =========================================================
-- Plan.Teach_kz
-- 012_ai_test_data_seed.sql
-- Test data for AI features and dashboards
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. Seed diagnostic results and AI route recommendations
-- for test students (if they exist in auth.users)
-- =========================================================

-- Get test student IDs from auth.users
with student_users as (
  select id, email
  from auth.users
  where email in ('student@test.kz', 'student2@test.kz')
),
updated_profiles as (
  update public.profiles
  set
    diagnostic_completed = true,
    onboarding_completed = true
  where id in (select id from student_users)
  returning id, email, role, level
)
select * from updated_profiles;

-- Seed diagnostic attempts for test students
with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email in ('student@test.kz', 'student2@test.kz')
),
new_attempts as (
  insert into public.diagnostic_attempts (
    student_id,
    status,
    total_score,
    max_score,
    completed_at
  )
  select
    id,
    'completed',
    35,
    50,
    now() - interval '7 days'
  from test_students
  on conflict do nothing
  returning id, student_id, total_score
)
select * from new_attempts;

-- Seed diagnostic results
with test_students as (
  select p.id, p.level
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email in ('student@test.kz', 'student2@test.kz')
),
test_attempts as (
  select id, student_id
  from public.diagnostic_attempts
  where student_id in (select id from test_students)
  limit 2
),
student_results as (
  insert into public.diagnostic_results (
    attempt_id,
    student_id,
    total_score,
    max_score,
    level,
    grade_scores,
    weak_topics,
    strong_topics,
    ai_summary
  )
  select
    ta.id,
    ta.student_id,
    35,
    50,
    'beginner',
    jsonb_build_object(
      'Өлшемдер', jsonb_build_object('correct', 2, 'total', 4),
      'Жылдамдық', jsonb_build_object('correct', 1, 'total', 3),
      'Тығыздық', jsonb_build_object('correct', 1, 'total', 3)
    ),
    '["Өлшемдер", "Жылдамдық", "Тығыздық"]'::jsonb,
    '["Физикалық құбылыстар", "Ғылыми әдіс"]'::jsonb,
    'Сіз физиканы базалық деңгейде түсінесіз. Өлшемдер мен жылдамдықта еңбек істеу қажет. Физикалық құбылыстарды анықтаудан сіз жақсы басасыз!'
  from test_attempts ta
  where ta.student_id = (
    select id from test_students order by id limit 1
  )
  on conflict do nothing
  returning id, student_id
)
select * from student_results;

-- Seed sample AI chats
with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email = 'student@test.kz'
),
test_topics as (
  select id, title from public.topics limit 1
)
insert into public.ai_chats (
  student_id,
  topic_id,
  title,
  status
)
select
  ts.id,
  tt.id,
  'Сұхбат: ' || tt.title,
  'active'
from test_students ts
cross join test_topics tt
on conflict do nothing;

-- Seed sample AI chat messages
with test_chats as (
  select id, student_id from public.ai_chats limit 1
)
insert into public.ai_chat_messages (
  chat_id,
  student_id,
  role,
  content,
  intent
)
select
  id,
  student_id,
  'user'::text,
  'Бұл тақырыпты түсіндіріп беріңіз',
  'explanation'
from test_chats
union all
select
  id,
  student_id,
  'assistant'::text,
  'Табысы! Бұл тақырыпты түсіндіремін...',
  null
from test_chats
on conflict do nothing;

-- Seed sample AI task hints
with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email = 'student@test.kz'
),
test_tasks as (
  select id, title from public.tasks limit 1
)
insert into public.ai_task_hints (
  student_id,
  task_id,
  hint_level,
  hint_text
)
select
  ts.id,
  tt.id,
  1,
  'Бәрі берілгендерін жазыңыз және табу керектісін анықтаңыз.'
from test_students ts
cross join test_tasks tt
on conflict do nothing;

-- Seed sample AI solution reviews
with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email = 'student@test.kz'
),
test_tasks as (
  select id from public.tasks limit 1
)
insert into public.ai_solution_reviews (
  student_id,
  task_id,
  input_text,
  formula_feedback,
  unit_feedback,
  logic_feedback,
  final_answer_feedback,
  overall_feedback,
  score
)
select
  ts.id,
  tt.id,
  '5 м/с',
  'Формула дұрыс',
  'Бірліктер дұрыс (м/с)',
  'Логика түсінігі жақсы',
  'Жауап дұрыс',
  'Өте жақсы шешілген есеп!',
  85
from test_students ts
cross join test_tasks tt
on conflict do nothing;

-- Seed AI route recommendations
with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email = 'student@test.kz'
),
test_results as (
  select id from public.diagnostic_results limit 1
)
insert into public.ai_route_recommendations (
  student_id,
  diagnostic_result_id,
  level,
  weak_topics,
  strong_topics,
  interests,
  summary
)
select
  ts.id,
  tr.id,
  'beginner',
  '["Өлшемдер", "Жылдамдық"]'::jsonb,
  '["Физикалық құбылыстар"]'::jsonb,
  '["Механика", "Өлшеулер"]'::jsonb,
  'Сіздің оқу маршруты: 1. Өлшемдер қайта қараңыз, 2. Жылдамдықты мысалдармен отынга алыңыз, 3. Механикалық есептерді орындаңыз.'
from test_students ts
cross join test_results tr
on conflict do nothing;

-- Seed AI student memory
with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email = 'student@test.kz'
)
insert into public.ai_student_memory (
  student_id,
  memory_key,
  memory_value
)
select
  id,
  'learning_style',
  '{"preference": "visual", "pace": "slow"}'::jsonb
from test_students
on conflict (student_id, memory_key) do nothing;

-- =========================================================
-- 2. Seed task attempts for test students
-- =========================================================

with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email in ('student@test.kz', 'student2@test.kz')
),
test_tasks as (
  select id from public.tasks limit 5
)
insert into public.task_attempts (
  task_id,
  student_id,
  answer_text,
  is_correct,
  auto_score,
  status,
  auto_feedback,
  created_at
)
select
  (select id from test_tasks order by random() limit 1),
  ts.id,
  '10 м/с',
  random() > 0.3,
  case when random() > 0.3 then 100 else 50 end,
  'auto_checked',
  case when random() > 0.3 then 'Дұрыс!' else 'Қайтадан ойланыңыз' end,
  now() - (random() * interval '7 days')
from test_students ts
cross join generate_series(1, 3)
on conflict do nothing;

-- =========================================================
-- 3. Seed student interests
-- =========================================================

with test_students as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email = 'student@test.kz'
),
interest_topics as (
  values
    ('Механика'),
    ('Есеп шығару'),
    ('Өлшеулер және тәжірибе')
)
insert into public.student_interests (
  student_id,
  topic_title
)
select ts.id, t.column1
from test_students ts
cross join interest_topics t
on conflict do nothing;

-- =========================================================
-- 4. Ensure teacher-student links exist
-- =========================================================

with teacher_users as (
  select id from auth.users where email = 'teacher@test.kz'
),
student_users as (
  select p.id
  from public.profiles p
  join auth.users u on p.id = u.id
  where u.email in ('student@test.kz', 'student2@test.kz')
),
updated_student_profiles as (
  update public.profiles
  set teacher_id = (select id from teacher_users)
  where id in (select id from student_users)
    and teacher_id is null
  returning id
)
select * from updated_student_profiles;

-- =========================================================
-- Comments
-- =========================================================

comment on table public.ai_chats is
'Test AI chat data for demo purposes.';

comment on table public.ai_task_hints is
'Test AI hint data for demo purposes.';

comment on table public.ai_solution_reviews is
'Test AI solution review data for demo purposes.';

comment on table public.ai_route_recommendations is
'Test AI route recommendation data for demo purposes.';
