alter table public.compliance_findings
  add column suggested_rewrites text[] not null default '{}';

update public.compliance_findings
set suggested_rewrites = case category
  when 'Approval and qualification claims' then
    array['Check your eligibility for a personal loan. Approval and available terms depend on underwriting and creditworthiness.']
  when 'Qualification disclosure' then
    array['Explore loan amounts up to $50,000. Available amounts and terms vary based on creditworthiness and underwriting.']
  when 'Rates and APR context' then
    array['Qualified applicants may receive a 0% introductory APR for [duration]. After that, a variable APR of [range] applies.']
  when 'Comparative claims' then
    array['Explore competitive mortgage rates available based on your loan details and qualifications.']
  when 'Urgency and pressure' then
    array['Apply by [date] to be considered for this offer. Eligibility and terms apply.']
  when 'Fees and costs' then
    array['No [specific fee]. Other fees and costs may apply; review the terms for details.']
  else
    array[]::text[]
end;
