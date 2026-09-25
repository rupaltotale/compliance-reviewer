insert into public.submissions (
  id, title, product_type, channel, submitted_by, affiliate_name, content,
  destination_url, status, risk_level, analysis_summary, created_at, updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'Fast Funds affiliate landing page',
    'personal_loan',
    'affiliate',
    'Sarah Chen',
    'Fast Funds Network',
    'You’re guaranteed to qualify for up to $50,000. Act now and get the money you need as soon as tomorrow.',
    'https://example.com/fast-funds',
    'pending',
    'high',
    'Three potential issues require human review before publication.',
    now() - interval '4 hours',
    now() - interval '4 hours'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Balance transfer launch email',
    'credit_card',
    'email',
    'Jordan Williams',
    null,
    '0% interest credit card — apply today! Move your balance and start saving with no fees.',
    'https://example.com/balance-transfer',
    'in_review',
    'high',
    'Rate, fee, and urgency claims need additional context.',
    now() - interval '1 day 7 hours',
    now() - interval '1 day 5 hours'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Spring mortgage search campaign',
    'mortgage',
    'paid_social',
    'Priya Patel',
    null,
    'Get the lowest mortgage rate available. See your options in minutes with no impact to your credit score.',
    'https://example.com/mortgage',
    'pending',
    'high',
    'The comparative rate claim may require substantiation and clearer scope.',
    now() - interval '2 days 1 hour',
    now() - interval '2 days 1 hour'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Debt consolidation overview',
    'personal_loan',
    'website',
    'Miguel Santos',
    null,
    'Explore personal loan options for consolidating eligible debts. Rates and terms vary based on creditworthiness and other factors.',
    'https://example.com/debt-consolidation',
    'approved',
    'low',
    'No clear issues were identified by the demonstration rules.',
    now() - interval '3 days 4 hours',
    now() - interval '2 days 4 hours'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Travel card benefits page',
    'credit_card',
    'website',
    'Avery Brooks',
    null,
    'Earn rewards on eligible travel purchases. Review the rates, fees, reward terms, and eligibility requirements before applying.',
    'https://example.com/travel-card',
    'approved',
    'low',
    'No clear issues were identified by the demonstration rules.',
    now() - interval '5 days 1 hour',
    now() - interval '4 days'
  ),
  (
    '66666666-6666-4666-8666-666666666666',
    'Homebuyer prequalification nurture',
    'mortgage',
    'email',
    'Nora Kim',
    null,
    'Understand how much home you may be able to afford. Prequalification is an estimate, not a commitment to lend.',
    null,
    'changes_requested',
    'medium',
    'One disclosure placement question was surfaced for reviewer attention.',
    now() - interval '6 days 5 hours',
    now() - interval '5 days 2 hours'
  ),
  (
    '77777777-7777-4777-8777-777777777777',
    'Weekend loan social creative',
    'personal_loan',
    'paid_social',
    'Ethan Reed',
    null,
    'A personal loan could help cover an unexpected expense. Check available terms with no obligation to accept an offer.',
    'https://example.com/personal-loans',
    'in_review',
    'low',
    'No clear issues were identified by the demonstration rules.',
    now() - interval '6 hours',
    now() - interval '5 hours'
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    'Card comparison affiliate article',
    'credit_card',
    'affiliate',
    'Leah Morgan',
    'Wallet Weekly',
    'ClearPath is the best rewards card for every traveler. Limited time: apply today for our biggest welcome offer.',
    'https://example.com/card-comparison',
    'changes_requested',
    'medium',
    'Comparative and urgency language needs substantiation or revision.',
    now() - interval '8 days 3 hours',
    now() - interval '7 days'
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    'Mortgage education hub refresh',
    'mortgage',
    'website',
    'Olivia Martin',
    null,
    'Learn how down payments, loan terms, and credit profiles can affect mortgage pricing before you request prequalification.',
    'https://example.com/mortgage-guide',
    'approved',
    'low',
    'Educational content presents balanced qualification context.',
    now() - interval '9 days 2 hours',
    now() - interval '8 days 4 hours'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Preferred partner loan banner',
    'personal_loan',
    'affiliate',
    'Marcus Lee',
    'Credit Compass',
    'See personalized personal loan offers from ClearPath. Checking options does not guarantee approval; terms vary by applicant.',
    'https://example.com/partner-loans',
    'pending',
    'low',
    'No clear issues were identified by the demonstration rules.',
    now() - interval '22 hours',
    now() - interval '22 hours'
  )
on conflict (id) do update set
  title = excluded.title,
  product_type = excluded.product_type,
  channel = excluded.channel,
  submitted_by = excluded.submitted_by,
  affiliate_name = excluded.affiliate_name,
  content = excluded.content,
  destination_url = excluded.destination_url,
  status = excluded.status,
  risk_level = excluded.risk_level,
  analysis_summary = excluded.analysis_summary,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at;

insert into public.compliance_findings (
  id, submission_id, category, severity, flagged_text, explanation,
  recommendation, status, created_at
) values
  (
    'f1111111-1111-4111-8111-111111111111',
    '11111111-1111-4111-8111-111111111111',
    'Approval and qualification claims',
    'high',
    'guaranteed to qualify',
    'This absolute wording may imply that underwriting or eligibility requirements do not apply.',
    'Replace the guarantee with conditional language and identify material eligibility criteria.',
    'open',
    now() - interval '4 hours'
  ),
  (
    'f1111111-1111-4111-8111-111111111112',
    '11111111-1111-4111-8111-111111111111',
    'Qualification disclosure',
    'medium',
    'up to $50,000',
    'The maximum amount may not be available to all applicants.',
    'Explain that amounts depend on underwriting, creditworthiness, and applicable limits.',
    'open',
    now() - interval '4 hours'
  ),
  (
    'f1111111-1111-4111-8111-111111111113',
    '11111111-1111-4111-8111-111111111111',
    'Urgency and pressure',
    'medium',
    'Act now',
    'Urgency may pressure consumers if no genuine deadline exists.',
    'Remove the phrase or clearly support the factual deadline.',
    'open',
    now() - interval '4 hours'
  ),
  (
    'f2222222-2222-4222-8222-222222222221',
    '22222222-2222-4222-8222-222222222222',
    'Rates and APR context',
    'high',
    '0% interest',
    'The claim lacks duration, eligibility, and post-promotional APR context.',
    'State the introductory period, eligibility requirements, and applicable APR after it ends.',
    'open',
    now() - interval '1 day 7 hours'
  ),
  (
    'f3333333-3333-4333-8333-333333333331',
    '33333333-3333-4333-8333-333333333333',
    'Comparative claims',
    'high',
    'lowest mortgage rate available',
    'The superlative claim lacks a comparison set, time period, and substantiation.',
    'Scope and substantiate the comparison or remove the superlative.',
    'open',
    now() - interval '2 days 1 hour'
  ),
  (
    'f6666666-6666-4666-8666-666666666661',
    '66666666-6666-4666-8666-666666666666',
    'Qualification disclosure',
    'medium',
    'Prequalification is an estimate, not a commitment to lend.',
    'The disclosure is present, but its placement should remain prominent and near the associated affordability claim.',
    'Keep the disclosure visually connected to the primary prequalification claim.',
    'resolved',
    now() - interval '6 days 5 hours'
  ),
  (
    'f8888888-8888-4888-8888-888888888881',
    '88888888-8888-4888-8888-888888888888',
    'Comparative claims',
    'medium',
    'best rewards card for every traveler',
    'This broad superlative lacks a defined comparison set and may not be supportable for every consumer.',
    'Define and substantiate a narrower comparison or remove the superlative.',
    'open',
    now() - interval '8 days 3 hours'
  ),
  (
    'f8888888-8888-4888-8888-888888888882',
    '88888888-8888-4888-8888-888888888888',
    'Urgency and pressure',
    'medium',
    'Limited time: apply today',
    'The copy creates urgency without stating the offer deadline or basis for the limitation.',
    'State the factual end date and applicable conditions, or remove the urgency language.',
    'open',
    now() - interval '8 days 3 hours'
  )
on conflict (id) do update set
  submission_id = excluded.submission_id,
  category = excluded.category,
  severity = excluded.severity,
  flagged_text = excluded.flagged_text,
  explanation = excluded.explanation,
  recommendation = excluded.recommendation,
  status = excluded.status,
  created_at = excluded.created_at;

insert into public.reviews (
  id, submission_id, reviewer, decision, comment, created_at
) values
  (
    'b4444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-444444444444',
    'Alex Morgan',
    'approved',
    'Qualification language is clear and appropriately placed.',
    now() - interval '2 days 4 hours'
  ),
  (
    'b6666666-6666-4666-8666-666666666666',
    '66666666-6666-4666-8666-666666666666',
    'Alex Morgan',
    'changes_requested',
    'Move the non-commitment disclosure closer to the primary prequalification claim.',
    now() - interval '5 days 2 hours'
  )
on conflict (id) do update set
  submission_id = excluded.submission_id,
  reviewer = excluded.reviewer,
  decision = excluded.decision,
  comment = excluded.comment,
  created_at = excluded.created_at;

delete from public.audit_events
where event_type in ('submission_created', 'analysis_completed')
  and submission_id in (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    '66666666-6666-4666-8666-666666666666',
    '77777777-7777-4777-8777-777777777777',
    '88888888-8888-4888-8888-888888888888',
    '99999999-9999-4999-8999-999999999999',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  );

insert into public.audit_events (
  submission_id, event_type, actor, detail, created_at
)
select
  submission.id,
  event.event_type,
  event.actor,
  event.detail,
  submission.created_at + event.offset_time
from public.submissions as submission
cross join lateral (
  values
    ('submission_created', submission.submitted_by, 'Submission created', interval '0 seconds'),
    (
      'analysis_completed',
      'ClearPath AI',
      'Automated pre-review completed with ' ||
        (select count(*) from public.compliance_findings as finding
          where finding.submission_id = submission.id)::text ||
        ' potential issues',
      interval '1 minute'
    )
) as event(event_type, actor, detail, offset_time)
where submission.id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555',
  '66666666-6666-4666-8666-666666666666',
  '77777777-7777-4777-8777-777777777777',
  '88888888-8888-4888-8888-888888888888',
  '99999999-9999-4999-8999-999999999999',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
);

insert into public.audit_events (
  id, submission_id, event_type, actor, detail, created_at
) values
  (
    'a4444444-4444-4444-8444-444444444444',
    '44444444-4444-4444-8444-444444444444',
    'approved',
    'Alex Morgan',
    'Submission approved',
    now() - interval '2 days 4 hours'
  ),
  (
    'a6666666-6666-4666-8666-666666666661',
    '66666666-6666-4666-8666-666666666666',
    'finding_resolved',
    'Alex Morgan',
    'Finding resolved: Qualification disclosure',
    now() - interval '5 days 3 hours'
  ),
  (
    'a6666666-6666-4666-8666-666666666662',
    '66666666-6666-4666-8666-666666666666',
    'changes_requested',
    'Alex Morgan',
    'Changes requested',
    now() - interval '5 days 2 hours'
  ),
  (
    'a8888888-8888-4888-8888-888888888888',
    '88888888-8888-4888-8888-888888888888',
    'changes_requested',
    'Alex Morgan',
    'Changes requested',
    now() - interval '7 days'
  )
on conflict (id) do update set
  submission_id = excluded.submission_id,
  event_type = excluded.event_type,
  actor = excluded.actor,
  detail = excluded.detail,
  created_at = excluded.created_at;
