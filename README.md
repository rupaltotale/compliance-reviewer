# ClearPath Marketing Compliance Review

A polished vertical slice of an internal review workspace for a fictional consumer finance company. ClearPath replaces an Excel-and-email process with a prioritized queue, advisory automated pre-review, human decisions, and a visible audit trail.

> **Important:** The included rules are illustrative demonstration rules. They are not legal advice and do not represent a complete consumer-finance compliance program. Production policies must be created, reviewed, versioned, and maintained with qualified legal and compliance stakeholders.

## Product problem

ClearPath markets personal loans, credit cards, and mortgage prequalification through owned and affiliate channels. Compliance reviews currently move through spreadsheets and email, making ownership unclear, fragmenting context, and limiting marketing throughput.

## Product hypothesis

A centralized review queue plus automated first-pass analysis can reduce time spent finding routine issues and coordinating state. Human reviewers remain accountable for every final decision.

The core workflow is:

**Marketing submission → automated pre-review → prioritized queue → human review → approve/request changes → audit trail**

## Demo path

1. Open the review queue and scan risk, status, and workload metrics.
2. Open **Fast Funds affiliate landing page**, a high-risk seeded example.
3. Review source-linked findings and highlighted copy.
4. Resolve or dismiss a finding.
5. Approve the asset or request changes with a comment.
6. Edit the asset as a new version and see AI rerun without overwriting prior review history.
7. Navigate between immutable versions and review their individual decisions and audit events.
8. Create a new submission and see its structured pre-review.

The app includes an in-memory seeded mode when Supabase is not configured, so local evaluation is immediate. A configured deployment persists all changes in Supabase/Postgres. When `OPENAI_API_KEY` is absent, an explicitly labeled deterministic demo analyzer exercises the same structured workflow; configured deployments use OpenAI structured outputs.

## Key decisions

- **AI performs pre-review, never final approval.** Model output creates advisory findings and a risk signal. Only a named human reviewer can approve or request changes.
- **Findings point to source copy.** Exact triggering text is stored and highlighted to make verification fast and reduce unsupported model conclusions.
- **Severity is explained and aggregate risk is deterministic.** The model explains why each finding is low, medium, or high. The server validates those findings and sets submission risk to the highest finding severity rather than accepting a model-generated aggregate rating.
- **Recommendations include guarded drafting examples.** Findings can offer one to three alternative phrasings, but must use placeholders instead of inventing rates, fees, deadlines, eligibility criteria, or disclosure terms. The UI labels them as drafting aids rather than approved language.
- **Rules and prompt are inspectable.** Demonstration policy configuration and model instructions live outside React components.
- **Submitted copy is untrusted.** The system prompt explicitly prevents instructions in marketing content from overriding review behavior.
- **Human actions are durable workflow events.** Finding disposition and decisions append to the audit trail with actor and timestamp.
- **Finding disposition feeds the decision.** Reviewers add valid findings to a consolidated change request or dismiss false positives. Selected recommendations prefill the final request-changes comment, while approval is blocked until requested changes are cleared.
- **Edits create immutable versions.** A revised asset enters review as a new pending version with fresh findings. Earlier copy, findings, decisions, and audit events remain read-only and attributable.
- **The product is a queue, not a chatbot.** The primary value is prioritization, shared state, fast review, and accountability.
- **Server-only trust boundary.** OpenAI and Supabase service credentials are never exposed to client components.

## Architecture

```text
src/
  app/                       App Router pages and server actions
  components/                Queue, review, form, and UI components
  lib/
    ai/                      Structured OpenAI analysis and system prompt
    compliance/              Inspectable demonstration rules
    db/                      Supabase boundary and seeded local repository
    schemas.ts               Zod input/output contracts
    types.ts                 Domain types
supabase/
  migrations/                Postgres schema, constraints, indexes, RLS
  seed.sql                   Realistic review dataset
```

Business logic is kept out of React components. Pages consume a small repository boundary, and all writes occur in server actions.

## Data model

- `submissions`: marketing asset, product/channel context, workflow state, risk, and analysis summary
- `compliance_findings`: source-linked advisory concern, recommendation, severity, and reviewer disposition
- `reviews`: append-only human decision and comment
- `audit_events`: append-only actor/event timeline

Submissions are grouped by `submission_group_id`, ordered by `version_number`, and linked to their predecessor. The queue shows only the latest version while detail pages retain navigation to historical versions.

The migrations enforce supported enum values, foreign keys, unique group/version pairs, finding severity rationales, useful indexes, and updated timestamps. Existing installations should apply every migration in filename order before using the edit or severity-rationale flows.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables are required for seeded in-memory demo mode.

### Supabase persistence

1. Create a Supabase project.
2. Apply the SQL in `supabase/migrations/`.
3. Run `supabase/seed.sql` in the SQL editor.
4. Set the Supabase values from `.env.example`.

`SUPABASE_SERVICE_ROLE_KEY` is server-only and is used for the unauthenticated take-home demo. Never expose it through a `NEXT_PUBLIC_` variable.

### Reseeding demo data

After applying every migration, run `supabase/seed.sql` again in the Supabase SQL Editor. The seed runs in a transaction and resets only the ten built-in ClearPath demo submission groups, including their generated versions, findings, reviews, and audit events. Submissions created through the UI outside those known groups are preserved.

### OpenAI analysis

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`. The server sends product, channel, copy, URL context, and applicable rules to OpenAI and validates the structured response with Zod before persistence. Errors are surfaced rather than converted into success-shaped results.

## Validation

```bash
npm run lint
npm run build
```

## Assumptions

- The evaluator is a trusted internal demo user; the fixed reviewer identity is **Alex Morgan**.
- Full authentication and account setup are intentionally omitted.
- Pasted copy is the primary V1 asset type.
- Destination URLs are displayed as context but are not crawled or ingested.
- Edits create a complete new submission version rather than a field-level diff.
- Risk is an advisory prioritization signal, not an approval decision.
- The local in-memory mode is for evaluation only; Supabase is the persistent deployment path.

## Production considerations

A production system would require:

- authentication, SSO, and role-based access control
- tenant/data isolation and restrictive RLS policies
- richer asset diffs and disclosure-specific versioning
- configurable policy ownership and policy/rule version history
- formal regulatory and legal review of every rule
- immutable/tamper-evident audit storage
- SLA, escalation, assignment, and notification workflows
- affiliate onboarding and management
- safe document, image, and destination-page ingestion
- integrations with marketing and content-management systems
- operational analytics and reviewer reporting
- model monitoring, evaluation sets, prompt/model version capture, and drift analysis
- rate limits, abuse controls, observability, retries, and transactional write orchestration

## Vercel deployment

Import the repository in Vercel, configure the variables from `.env.example`, and deploy. The application uses standard Next.js server actions and is Vercel-compatible.
