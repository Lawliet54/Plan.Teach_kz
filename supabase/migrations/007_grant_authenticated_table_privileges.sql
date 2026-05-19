-- =========================================================
-- Plan.Teach_kz
-- 007_grant_authenticated_table_privileges.sql
-- Supabase RLS policies still require table privileges.
-- =========================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.teacher_student_links to authenticated;

grant select on public.diagnostic_questions to authenticated;
grant select, insert, update, delete on public.diagnostic_attempts to authenticated;
grant select, insert, update, delete on public.diagnostic_answers to authenticated;
grant select, insert, update, delete on public.diagnostic_results to authenticated;

grant select, insert, update, delete on public.student_interests to authenticated;

grant select on public.learning_sections to authenticated;
grant select on public.topics to authenticated;
grant select on public.topic_objectives to authenticated;
grant select on public.topic_contents to authenticated;
grant select on public.labs to authenticated;
grant select on public.project_tasks to authenticated;
grant select on public.assessments to authenticated;
