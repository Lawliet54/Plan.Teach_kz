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
