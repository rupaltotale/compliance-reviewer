"use client";

import { useState, useTransition } from "react";
import { Bot, Check, LoaderCircle, Sparkles } from "lucide-react";
import {
  generateRevisionDraftAction,
  type RevisionDraftActionState,
} from "@/app/actions";
import { StatusBadge } from "@/components/ui/status-badge";

export function AiRevisionAssistant({
  submissionId,
  requestedChangeCount,
  onApply,
}: {
  submissionId: string;
  requestedChangeCount: number;
  onApply: (draft: string) => void;
}) {
  const [result, setResult] = useState<RevisionDraftActionState>();
  const [applied, setApplied] = useState(false);
  const [pending, startTransition] = useTransition();

  if (requestedChangeCount === 0) return null;

  function generate() {
    setApplied(false);
    startTransition(async () => {
      setResult(await generateRevisionDraftAction(submissionId));
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm shadow-violet-100/40">
      <div className="flex flex-col justify-between gap-4 border-b border-violet-100 bg-violet-50/70 px-5 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
            <Bot className="size-4.5" />
          </span>
          <div>
            <h2 className="font-semibold text-violet-950">AI-assisted revision</h2>
            <p className="mt-0.5 text-xs leading-5 text-violet-700">
              Draft from {requestedChangeCount} requested change
              {requestedChangeCount === 1 ? "" : "s"}, then pre-review it before previewing.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {pending ? "Drafting and reviewing…" : result?.draft ? "Generate again" : "Generate draft"}
        </button>
      </div>

      {result?.message && (
        <p className="px-5 py-4 text-sm text-red-700">{result.message}</p>
      )}

      {result?.draft && (
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Revision preview</p>
              <p className="mt-1 text-xs text-slate-500">
                Generated and pre-reviewed in {result.passes} pass
                {result.passes === 1 ? "" : "es"}.
              </p>
            </div>
            {result.riskLevel && <StatusBadge value={result.riskLevel} dot />}
          </div>

          <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {result.draft}
          </div>

          {result.changeSummary && (
            <p className="text-xs leading-5 text-slate-500">
              <strong className="font-semibold text-slate-700">What changed:</strong>{" "}
              {result.changeSummary}
            </p>
          )}

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Internal pre-review
            </p>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{result.analysisSummary}</p>
            {result.remainingFindings && result.remainingFindings.length > 0 ? (
              <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {result.remainingFindings.map((finding, index) => (
                  <li key={`${finding.category}-${index}`} className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                    <StatusBadge value={finding.severity} />
                    <span>
                      <strong className="font-semibold text-slate-800">{finding.category}:</strong>{" "}
                      {finding.explanation}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                No clear issues were identified by the pre-review. Human review is still required.
              </p>
            )}
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="max-w-xl text-xs leading-5">
              {result.riskLevel === "high" ? (
                <p className="font-medium text-red-700">
                  High-risk concerns remain. Use this only as a starting point and address the
                  residual findings before submission.
                </p>
              ) : result.riskLevel === "medium" ? (
                <p className="font-medium text-amber-700">
                  Additional review is still recommended before creating the next version.
                </p>
              ) : (
                <p className="text-slate-500">
                  No clear issues were found, but verify placeholders, product terms, and
                  disclosures. Human review is still required.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                onApply(result.draft!);
                setApplied(true);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Check className="size-4" />
              {applied
                ? "Draft applied"
                : result.riskLevel === "high"
                  ? "Apply as starting point"
                  : "Use this draft"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
