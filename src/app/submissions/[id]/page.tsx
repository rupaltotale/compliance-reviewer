import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Calendar,
  CircleCheck,
  ExternalLink,
  FileText,
  Link2,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FindingCard } from "@/components/compliance/finding-card";
import { DecisionForm } from "@/components/compliance/decision-form";
import { HighlightedContent } from "@/components/submissions/highlighted-content";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSubmission } from "@/lib/db/repository";
import { formatDate, formatDateTime, humanize } from "@/lib/utils";

type DetailProps = { params: Promise<{ id: string }> };

export default async function SubmissionDetailPage({ params }: DetailProps) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();
  const openFindings = submission.findings.filter((finding) => finding.status === "open");

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-[1440px] px-6 py-8 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4" /> Back to review queue
        </Link>
        <div className="mt-5 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={submission.status} />
              <StatusBadge value={submission.riskLevel} dot />
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{submission.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Submitted {formatDateTime(submission.createdAt)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Open findings</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{openFindings.length}</p>
          </div>
        </div>

        <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-7">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
              <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
                <FileText className="size-4 text-slate-400" />
                <h2 className="font-semibold text-slate-950">Marketing content</h2>
              </div>
              <div className="p-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 text-[15px] leading-8 text-slate-800">
                  <HighlightedContent content={submission.content} findings={submission.findings} />
                </div>
                {openFindings.length > 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    Highlighted copy is associated with an open automated finding.
                  </p>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bot className="size-5 text-teal-700" />
                    <h2 className="text-lg font-semibold text-slate-950">Automated pre-review</h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{submission.analysisSummary}</p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">Advisory</span>
              </div>
              <div className="space-y-4">
                {submission.findings.length > 0 ? (
                  submission.findings.map((finding, index) => (
                    <FindingCard key={finding.id} finding={finding} index={index} />
                  ))
                ) : (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                    <div className="flex items-center gap-2 font-semibold">
                      <CircleCheck className="size-4" /> No issues surfaced
                    </div>
                    <p className="mt-1.5 leading-6">The demonstration rules found no clear issues. Human review is still required.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
              <h2 className="font-semibold text-slate-950">Submission</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <Detail icon={FileText} label="Product" value={humanize(submission.productType)} />
                <Detail icon={Link2} label="Channel" value={humanize(submission.channel)} />
                {submission.affiliateName && <Detail icon={Link2} label="Affiliate" value={submission.affiliateName} />}
                <Detail icon={UserRound} label="Submitted by" value={submission.submittedBy} />
                <Detail icon={Calendar} label="Submitted" value={formatDate(submission.createdAt)} />
              </dl>
              {submission.destinationUrl && (
                <a
                  href={submission.destinationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:text-teal-700"
                >
                  View destination <ExternalLink className="size-3.5" />
                </a>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
              <h2 className="font-semibold text-slate-950">Reviewer decision</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Your decision is recorded with your name and timestamp.</p>
              <div className="mt-5"><DecisionForm submissionId={submission.id} /></div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
              <h2 className="font-semibold text-slate-950">Audit trail</h2>
              <ol className="mt-5 space-y-0">
                {submission.auditEvents.map((event, index) => (
                  <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < submission.auditEvents.length - 1 && (
                      <span className="absolute left-[5px] top-3 h-full w-px bg-slate-200" />
                    )}
                    <span className="relative mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-white bg-teal-600 ring-1 ring-teal-200" />
                    <div>
                      <p className="text-sm font-medium leading-5 text-slate-800">{event.detail}</p>
                      <p className="mt-1 text-xs text-slate-400">{event.actor} · {formatDateTime(event.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div>
        <dt className="text-xs font-medium text-slate-400">{label}</dt>
        <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
      </div>
    </div>
  );
}
