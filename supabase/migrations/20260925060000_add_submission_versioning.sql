alter table public.submissions
  add column submission_group_id uuid default gen_random_uuid(),
  add column version_number integer not null default 1
    check (version_number > 0),
  add column previous_version_id uuid;

update public.submissions
set submission_group_id = id
where submission_group_id is null;

alter table public.submissions
  alter column submission_group_id set not null,
  add constraint submissions_previous_version_id_fkey
    foreign key (previous_version_id) references public.submissions(id),
  add constraint submissions_group_version_key
    unique (submission_group_id, version_number),
  add constraint submissions_version_predecessor_check
    check (
      (version_number = 1 and previous_version_id is null)
      or (version_number > 1 and previous_version_id is not null)
    );

create index submissions_group_id_idx
  on public.submissions(submission_group_id, version_number desc);
