import { Lightbulb, ListPlus, Undo2, X } from "lucide-react";
import { updateFindingAction } from "@/app/actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExampleLanguage } from "@/components/compliance/example-language";
import type { ComplianceFinding } from "@/lib/types";

export function FindingCard({
  finding,
  index,
  readOnly = false,
}: {
  finding: ComplianceFinding;
  index: number;
  readOnly?: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {index + 1}
          </span>
          <h3 className="font-semibold text-slate-950">{finding.category}</h3>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={finding.severity} />
          {finding.status !== "open" && <StatusBadge value={finding.status} />}
        </div>
      </div>
      <div className="mt-4 rounded-lg border-l-2 border-amber-400 bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Flagged text</p>
        <p className="mt-1 text-sm font-medium text-slate-900">“{finding.flaggedText}”</p>
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Potential issue
        </p>
        <p className="mt-1.5 text-sm leading-6 text-slate-600">{finding.explanation}</p>
      </div>
      <details className="group mt-3 rounded-lg border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-slate-600 marker:hidden hover:text-slate-900">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-400 transition-transform group-open:rotate-90">›</span>
            Why rated {finding.severity}?
          </span>
        </summary>
        <p className="border-t border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-600">
          {finding.severityRationale}
        </p>
      </details>
      <div className="mt-4 flex gap-3 rounded-lg bg-teal-50/70 p-3 text-sm text-teal-950">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-teal-700" />
        <div>
          <span className="font-semibold">Suggested change: </span>
          {finding.recommendation}
          <ExampleLanguage examples={finding.suggestedRewrites} className="mt-3" />
        </div>
      </div>
      {(finding.status === "open" || finding.status === "requested") && !readOnly && (
        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <form action={updateFindingAction}>
            <input type="hidden" name="findingId" value={finding.id} />
            <input
              type="hidden"
              name="status"
              value={finding.status === "requested" ? "open" : "requested"}
            />
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700">
              {finding.status === "requested" ? (
                <>
                  <Undo2 className="size-3.5" /> Remove from request
                </>
              ) : (
                <>
                  <ListPlus className="size-3.5" /> Request this change
                </>
              )}
            </button>
          </form>
          <form action={updateFindingAction}>
            <input type="hidden" name="findingId" value={finding.id} />
            <input type="hidden" name="status" value="dismissed" />
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <X className="size-3.5" /> Dismiss
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
