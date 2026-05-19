-- =========================================================
-- Plan.Teach_kz
-- 006_ensure_profile_rpc.sql
-- Repair helper for auth users that do not have public.profiles rows.
-- =========================================================

create or replace function public.ensure_profile_for_current_user(
  p_full_name text default null,
  p_role text default 'student'
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  normalized_role text;
  profile_row public.profiles;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  normalized_role := case
    when p_role = 'teacher' then 'teacher'
    else 'student'
  end;

  insert into public.profiles (
    id,
    email,
    full_name,
    role
  )
  values (
    current_user_id,
    auth.jwt() ->> 'email',
    coalesce(nullif(trim(p_full_name), ''), auth.jwt() ->> 'email', 'Атаусыз қолданушы'),
    normalized_role
  )
  on conflict (id) do update set
    email = coalesce(public.profiles.email, excluded.email),
    full_name = case
      when public.profiles.full_name is null
        or trim(public.profiles.full_name) = ''
        or public.profiles.full_name = 'Атаусыз қолданушы'
      then excluded.full_name
      else public.profiles.full_name
    end,
    updated_at = now()
  returning * into profile_row;

  return profile_row;
end;
$$;

revoke all on function public.ensure_profile_for_current_user(text, text) from public;
grant execute on function public.ensure_profile_for_current_user(text, text) to authenticated;

comment on function public.ensure_profile_for_current_user(text, text) is
'Authenticated user үшін missing public.profiles жазбасын қауіпсіз жасайды. Login fallback ретінде қолданылады.';
