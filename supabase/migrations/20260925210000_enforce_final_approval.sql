create or replace function public.approve_submission(
  target_submission_id uuid,
  approval_reviewer text,
  approval_comment text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_submission public.submissions%rowtype;
begin
  select *
  into target_submission
  from public.submissions
  where id = target_submission_id
  for update;

  if not found then
    raise exception 'Submission not found.';
  end if;

  if target_submission.status = 'approved' then
    raise exception 'This submission is already approved.';
  end if;

  if exists (
    select 1
    from public.submissions
    where submission_group_id = target_submission.submission_group_id
      and version_number > target_submission.version_number
  ) then
    raise exception 'Only the latest submission version can be approved.';
  end if;

  if exists (
    select 1
    from public.compliance_findings
    where submission_id = target_submission_id
      and status not in ('resolved', 'dismissed')
  ) then
    raise exception 'Address or dismiss every open finding before approving.';
  end if;

  update public.submissions
  set status = 'approved'
  where id = target_submission_id;

  insert into public.reviews (submission_id, reviewer, decision, comment)
  values (target_submission_id, approval_reviewer, 'approved', approval_comment);

  insert into public.audit_events (submission_id, event_type, actor, detail)
  values (target_submission_id, 'approved', approval_reviewer, 'Submission approved');
end;
$$;

grant execute on function public.approve_submission(uuid, text, text) to anon;

create or replace function public.prevent_approved_submission_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'approved' then
    raise exception 'Approved submissions are frozen.';
  end if;
  return new;
end;
$$;

create trigger submissions_prevent_approved_changes
before update on public.submissions
for each row execute function public.prevent_approved_submission_changes();

create or replace function public.prevent_approved_finding_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_status text;
  parent_submission_id uuid;
begin
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

create trigger compliance_findings_prevent_approved_changes
before insert or update or delete on public.compliance_findings
for each row execute function public.prevent_approved_finding_changes();

create or replace function public.prevent_version_after_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  predecessor_status text;
begin
  if new.previous_version_id is null then
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

create trigger submissions_prevent_version_after_approval
before insert on public.submissions
for each row execute function public.prevent_version_after_approval();
