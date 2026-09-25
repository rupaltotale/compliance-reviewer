import { ListChecks, MessageSquareText } from "lucide-react";
import { ExampleLanguage } from "@/components/compliance/example-language";

export type RequestedChange = {
  id: string;
  category: string;
  flaggedText: string;
  recommendation: string;
  suggestedRewrites: string[];
};

export function RevisionChecklist({
  requestedChanges,
  reviewerComment,
  nextVersion,
}: {
  requestedChanges: RequestedChange[];
  reviewerComment?: string | null;
  nextVersion: number;
}) {
  if (requestedChanges.length === 0 && !reviewerComment) return null;

  return (
    <section className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm shadow-orange-100/50">
      <div className="flex items-center gap-3 border-b border-orange-100 bg-orange-50 px-5 py-4">
        <span className="grid size-9 place-items-center rounded-lg bg-orange-100 text-orange-700">
          <ListChecks className="size-4.5" />
        </span>
        <div>
          <h2 className="font-semibold text-orange-950">Requested changes</h2>
          <p className="mt-0.5 text-xs text-orange-700">
            Use this checklist while preparing version {nextVersion}.
          </p>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {requestedChanges.map((change) => (
          <div key={change.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr]">
            <div>
              <p className="text-sm font-semibold text-slate-900">{change.category}</p>
              <p className="mt-1 text-xs text-slate-500">“{change.flaggedText}”</p>
            </div>
            <div>
              <p className="text-sm leading-6 text-slate-700">{change.recommendation}</p>
              <ExampleLanguage examples={change.suggestedRewrites} className="mt-3" />
            </div>
          </div>
        ))}
        {reviewerComment && (
          <div className="flex gap-3 px-5 py-4">
            <MessageSquareText className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reviewer comment
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {reviewerComment}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
