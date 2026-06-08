begin;

grant select, insert, update
on table public.lesson_mini_task_progress
to authenticated;

grant usage, select
on all sequences in schema public
to authenticated;

commit;