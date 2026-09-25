create or replace function public.is_clearpath_seed_reset()
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    current_user in ('postgres', 'supabase_admin')
    and current_setting('clearpath.seed_mode', true) = 'on';
$$;

create or replace function public.prevent_approved_submission_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'approved' and not public.is_clearpath_seed_reset() then
    raise exception 'Approved submissions are frozen.';
  end if;
  return new;
end;
$$;

create or replace function public.prevent_approved_finding_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_status text;
  parent_submission_id uuid;
begin
  if public.is_clearpath_seed_reset() then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    parent_submission_id := old.submission_id;
  else
    parent_submission_id := new.submission_id;
  end if;

  select status
  into parent_status
  from public.submissions
  where id = parent_submission_id
  for update;

  if parent_status = 'approved' then
    raise exception 'Approved submissions are frozen.';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_version_after_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  predecessor_status text;
begin
  if new.previous_version_id is null or public.is_clearpath_seed_reset() then
    return new;
  end if;

  select status
  into predecessor_status
  from public.submissions
  where id = new.previous_version_id
  for update;

  if predecessor_status = 'approved' then
    raise exception 'Approved submissions are frozen and cannot have new versions.';
  end if;
  return new;
end;
$$;
