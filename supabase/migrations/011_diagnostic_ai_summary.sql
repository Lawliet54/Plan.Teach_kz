-- =========================================================
-- Plan.Teach_kz
-- 011_diagnostic_ai_summary.sql
-- Enhance diagnostic_results for AI integration
-- =========================================================

create extension if not exists pgcrypto;

-- Add AI summary generation status tracking if needed
-- The ai_summary and recommended_route already exist in diagnostic_results
-- from 002_diagnostic.sql

-- Add index for faster lookups of results needing summary
create index if not exists diagnostic_results_ai_summary_idx
on public.diagnostic_results(ai_summary)
where ai_summary is null;

-- Add index for recommended route lookups
create index if not exists diagnostic_results_recommended_route_idx
on public.diagnostic_results(created_at desc);

-- Ensure RLS is applied
alter table public.diagnostic_results enable row level security;

-- The RLS policies should already exist from 002_diagnostic.sql
-- Make sure the student can select their own results
drop policy if exists "diagnostic_results_select_access" on public.diagnostic_results;

create policy "diagnostic_results_select_access"
on public.diagnostic_results
for select
to authenticated
using (
  student_id = auth.uid()
  or public.can_view_student(auth.uid(), student_id)
  or public.is_admin(auth.uid())
);

-- Allow updates for AI summary (student own records)
drop policy if exists "diagnostic_results_update_own" on public.diagnostic_results;

create policy "diagnostic_results_update_own"
on public.diagnostic_results
for update
to authenticated
using (
  student_id = auth.uid()
  or public.is_admin(auth.uid())
)
with check (
  student_id = auth.uid()
  or public.is_admin(auth.uid())
);

grant select, update on public.diagnostic_results to authenticated;
