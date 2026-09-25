import { Bot, Lightbulb, MessageSquareText } from "lucide-react";
import { ExampleLanguage } from "@/components/compliance/example-language";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ComplianceFinding, RequestComment } from "@/lib/types";

export function RevisionInputs({
  findings,
  requestComments,
}: {
  findings: ComplianceFinding[];
  requestComments: RequestComment[];
}) {
  if (findings.length === 0 && requestComments.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <h2 className="font-semibold text-slate-950">Revision inputs</h2>
      <p className="mt-1 text-sm text-slate-500">
        These open items are included in AI drafting and should be addressed in the new version.
      </p>

      <div className="mt-5 space-y-3">
        {findings.map((finding) => (
          <article key={finding.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="size-4 shrink-0 text-amber-700" />
                <h3 className="text-sm font-semibold text-slate-950">{finding.category}</h3>
              </div>
              <StatusBadge value={finding.severity} />
            </div>

            <div className="mt-4 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                Flagged text
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                “{finding.flaggedText}”
              </p>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Potential issue
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{finding.explanation}</p>
            </div>

            <div className="mt-4 flex gap-3 rounded-lg bg-teal-50/70 p-3 text-sm text-teal-950">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-teal-700" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold">Suggested change: </span>
                {finding.recommendation}
                <ExampleLanguage examples={finding.suggestedRewrites} className="mt-3" />
              </div>
            </div>
          </article>
        ))}
        {requestComments.map((requestComment) => (
          <div key={requestComment.id} className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-blue-700" />
            <div>
              <p className="text-sm font-semibold text-blue-950">Reviewer request</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-blue-900">
                {requestComment.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
