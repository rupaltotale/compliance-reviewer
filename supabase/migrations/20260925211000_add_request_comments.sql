create table public.request_comments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  comment text not null check (char_length(trim(comment)) between 3 and 2000),
  requested_by text not null,
  status text not null default 'open'
    check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index request_comments_submission_id_idx
  on public.request_comments(submission_id, created_at);

alter table public.request_comments enable row level security;

grant select, insert, update, delete on public.request_comments to anon;

create policy "Demo anon access" on public.request_comments
for all to anon using (true) with check (true);

create trigger request_comments_prevent_approved_changes
before insert or update or delete on public.request_comments
for each row execute function public.prevent_approved_finding_changes();

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

  if exists (
    select 1
    from public.request_comments
    where submission_id = target_submission_id
      and status = 'open'
  ) then
    raise exception 'Address or dismiss every open request comment before approving.';
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
