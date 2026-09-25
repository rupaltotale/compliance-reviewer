create extension if not exists pgcrypto;

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  product_type text not null check (product_type in ('personal_loan', 'credit_card', 'mortgage')),
  channel text not null check (channel in ('website', 'email', 'paid_social', 'affiliate', 'other')),
  submitted_by text not null check (char_length(submitted_by) between 2 and 80),
  affiliate_name text,
  content text not null check (char_length(content) between 20 and 20000),
  destination_url text,
  status text not null default 'pending'
    check (status in ('pending', 'in_review', 'changes_requested', 'approved')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  analysis_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (channel <> 'affiliate' or nullif(trim(affiliate_name), '') is not null)
);

create table public.compliance_findings (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  flagged_text text not null,
  explanation text not null,
  recommendation text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  reviewer text not null,
  decision text not null check (decision in ('approved', 'changes_requested')),
  comment text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  event_type text not null,
  actor text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index submissions_status_idx on public.submissions(status);
create index submissions_risk_level_idx on public.submissions(risk_level);
create index submissions_product_type_idx on public.submissions(product_type);
create index submissions_created_at_idx on public.submissions(created_at desc);
create index compliance_findings_submission_id_idx
  on public.compliance_findings(submission_id, created_at);
create index reviews_submission_id_idx on public.reviews(submission_id, created_at desc);
create index audit_events_submission_id_idx on public.audit_events(submission_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger submissions_set_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

alter table public.submissions enable row level security;
alter table public.compliance_findings enable row level security;
alter table public.reviews enable row level security;
alter table public.audit_events enable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on public.submissions to anon;
grant select, insert, update, delete on public.compliance_findings to anon;
grant select, insert, update, delete on public.reviews to anon;
grant select, insert, update, delete on public.audit_events to anon;

create policy "Demo anon access" on public.submissions
for all to anon using (true) with check (true);

create policy "Demo anon access" on public.compliance_findings
for all to anon using (true) with check (true);

create policy "Demo anon access" on public.reviews
for all to anon using (true) with check (true);

create policy "Demo anon access" on public.audit_events
for all to anon using (true) with check (true);

