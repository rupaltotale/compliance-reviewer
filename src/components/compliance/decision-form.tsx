"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { submitDecisionAction, type DecisionActionState } from "@/app/actions";

function DecisionButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
    >
      <CheckCircle2 className="size-4" /> Approve
    </button>
  );
}

export function DecisionForm({
  submissionId,
  outstandingItemCount,
}: {
  submissionId: string;
  outstandingItemCount: number;
}) {
  const initialState: DecisionActionState = {};
  const [state, action] = useActionState(
    submitDecisionAction.bind(null, submissionId),
    initialState,
  );
  const canApprove = outstandingItemCount === 0;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="comment" className="text-sm font-semibold text-slate-800">
          Approval comment <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="Add context for the approval audit trail…"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
        {!canApprove && (
          <p className="mt-1.5 text-xs font-medium text-amber-700">
            Address or dismiss {outstandingItemCount} open review item
            {outstandingItemCount === 1 ? "" : "s"} before approving.
          </p>
        )}
      </div>
      {state.message && (
        <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}
      <DecisionButton disabled={!canApprove} />
      <p className="text-xs leading-5 text-slate-500">
        Approval is final and freezes findings, request comments, decisions, and version creation.
      </p>
    </form>
  );
}
