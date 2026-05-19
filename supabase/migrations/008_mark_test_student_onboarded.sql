-- =========================================================
-- Plan.Teach_kz
-- 008_mark_test_student_onboarded.sql
-- Local/test helper: make student@test.kz skip first-time onboarding.
-- =========================================================

update public.profiles
set
  teacher_id = (
    select id
    from public.profiles
    where email = 'teacher@test.kz'
    limit 1
  ),
  diagnostic_completed = true,
  onboarding_completed = true,
  level = coalesce(level, 'beginner'),
  updated_at = now()
where email = 'student@test.kz';
