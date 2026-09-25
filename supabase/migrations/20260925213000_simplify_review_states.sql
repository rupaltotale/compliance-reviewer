update public.submissions
set status = 'in_review'
where status in ('pending', 'changes_requested');

alter table public.submissions
  alter column status set default 'in_review',
  drop constraint submissions_status_check;

alter table public.submissions
  add constraint submissions_status_check
  check (status in ('in_review', 'approved'));

update public.compliance_findings
set status = 'open'
where status = 'requested';

alter table public.compliance_findings
  drop constraint compliance_findings_status_check;

alter table public.compliance_findings
  add constraint compliance_findings_status_check
  check (status in ('open', 'resolved', 'dismissed'));

delete from public.reviews
where decision = 'changes_requested';

alter table public.reviews
  drop constraint reviews_decision_check;

alter table public.reviews
  add constraint reviews_decision_check
  check (decision = 'approved');
