alter table public.compliance_findings
  add column severity_rationale text not null
  default 'Severity assigned under the configured demonstration policy.';

update public.compliance_findings
set severity_rationale = case severity
  when 'high' then
    'High because the claim could materially mislead consumers about approval, eligibility, pricing, cost, or comparative value.'
  when 'medium' then
    'Medium because the claim needs qualification, context, or substantiation but is not an explicit material guarantee.'
  else
    'Low because the concern is limited and is unlikely to materially change a reasonable consumer’s understanding.'
end;
