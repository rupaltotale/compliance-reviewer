"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { submitDecisionAction, type DecisionActionState } from "@/app/actions";

function DecisionButton({
  value,
  children,
  variant,
}: {
  value: "approved" | "changes_requested";
  children: React.ReactNode;
  variant: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="decision"
      value={value}
      disabled={pending}
      className={
        variant === "primary"
          ? "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
          : "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      }
    >
      {children}
    </button>
  );
}

export function DecisionForm({ submissionId }: { submissionId: string }) {
  const initialState: DecisionActionState = {};
  const [state, action] = useActionState(
    submitDecisionAction.bind(null, submissionId),
    initialState,
  );
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="comment" className="text-sm font-semibold text-slate-800">
          Reviewer comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="Summarize your decision or explain the changes needed…"
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
        <p className="mt-1.5 text-xs text-slate-500">Required when requesting changes.</p>
      </div>
      {state.message && (
        <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <DecisionButton value="approved" variant="primary">
          <CheckCircle2 className="size-4" /> Approve
        </DecisionButton>
        <DecisionButton value="changes_requested" variant="secondary">
          <RotateCcw className="size-4" /> Request changes
        </DecisionButton>
      </div>
      <p className="text-xs leading-5 text-slate-500">
        Automated findings are advisory. You remain responsible for the final decision.
      </p>
    </form>
  );
}
