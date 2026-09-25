alter table public.compliance_findings
  drop constraint compliance_findings_status_check;

alter table public.compliance_findings
  add constraint compliance_findings_status_check
  check (status in ('open', 'requested', 'resolved', 'dismissed'));
