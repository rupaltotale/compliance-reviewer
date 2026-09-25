"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import {
  createSubmissionAction,
  createSubmissionVersionAction,
  type SubmissionActionState,
} from "@/app/actions";
import { channels, productTypes, type Channel, type ProductType } from "@/lib/types";
import { humanize } from "@/lib/utils";
import {
  RevisionChecklist,
  type RequestedChange,
} from "@/components/submissions/revision-checklist";

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      {pending
        ? "Running pre-review…"
        : isEditing
          ? "Create version and rerun review"
          : "Submit for pre-review"}
      {!pending && <ArrowRight className="size-4" />}
    </button>
  );
}

type SubmissionFormValues = {
  title: string;
  productType: ProductType;
  channel: Channel;
  submittedBy: string;
  affiliateName: string;
  destinationUrl: string;
  content: string;
};

export function SubmissionForm({
  initialValues,
  sourceSubmissionId,
  requestedChanges = [],
  reviewerComment,
  nextVersion,
}: {
  initialValues?: SubmissionFormValues;
  sourceSubmissionId?: string;
  requestedChanges?: RequestedChange[];
  reviewerComment?: string | null;
  nextVersion?: number;
}) {
  const isEditing = Boolean(sourceSubmissionId);
  const [channel, setChannel] = useState<Channel>(initialValues?.channel ?? "website");
  const [productType, setProductType] = useState(initialValues?.productType ?? "");
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [submittedBy, setSubmittedBy] = useState(initialValues?.submittedBy ?? "Taylor Brooks");
  const [affiliateName, setAffiliateName] = useState(initialValues?.affiliateName ?? "");
  const [destinationUrl, setDestinationUrl] = useState(initialValues?.destinationUrl ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const initialState: SubmissionActionState = {};
  const versionAction = sourceSubmissionId
    ? createSubmissionVersionAction.bind(null, sourceSubmissionId)
    : createSubmissionAction;
  const [state, action] = useActionState(versionAction, initialState);
  const field = (name: string) => state.fieldErrors?.[name]?.[0];
  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

  return (
    <form action={action} className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <div className="mb-6">
          <h2 className="font-semibold text-slate-950">Submission details</h2>
          <p className="mt-1 text-sm text-slate-500">Help the reviewer understand where and how this material will appear.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" error={field("title")} className="sm:col-span-2">
            <input className={inputClass} name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Summer balance transfer email" />
          </Field>
          <Field label="Product" error={field("productType")}>
            <select className={inputClass} name="productType" value={productType} onChange={(event) => setProductType(event.target.value as ProductType)}>
              <option value="" disabled>Select product</option>
              {productTypes.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
            </select>
          </Field>
          <Field label="Channel" error={field("channel")}>
            <select className={inputClass} name="channel" value={channel} onChange={(event) => setChannel(event.target.value as Channel)}>
              {channels.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
            </select>
          </Field>
          <Field label="Submitted by" error={field("submittedBy")}>
            <input className={inputClass} name="submittedBy" value={submittedBy} onChange={(event) => setSubmittedBy(event.target.value)} />
          </Field>
          <Field label="Affiliate name" error={field("affiliateName")} hint={channel === "affiliate" ? "Required for affiliate submissions." : "Optional"}>
            <input className={inputClass} name="affiliateName" value={affiliateName} onChange={(event) => setAffiliateName(event.target.value)} placeholder="Partner or publisher name" />
          </Field>
          <Field label="Destination URL" error={field("destinationUrl")} hint="Optional" className="sm:col-span-2">
            <input className={inputClass} name="destinationUrl" value={destinationUrl} onChange={(event) => setDestinationUrl(event.target.value)} type="url" placeholder="https://clearpath.example/offer" />
          </Field>
        </div>
      </section>

      {isEditing && nextVersion && (
        <RevisionChecklist
          requestedChanges={requestedChanges}
          reviewerComment={reviewerComment}
          nextVersion={nextVersion}
        />
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
        <h2 className="font-semibold text-slate-950">Marketing content</h2>
        <p className="mt-1 text-sm text-slate-500">Paste the exact copy consumers will see. Formatting can be approximate.</p>
        <Field label="Marketing copy" error={field("content")} className="mt-5">
          <textarea className={inputClass} name="content" value={content} onChange={(event) => setContent(event.target.value)} rows={11} placeholder="Paste headline, body copy, call to action, and disclosures…" />
        </Field>
      </section>

      {state.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</div>
      )}
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
        <p className="max-w-lg text-xs leading-5 text-slate-500">
          {isEditing
            ? "The current version and its review history remain unchanged. This edit becomes a new pending version."
            : "AI performs an advisory first pass. A compliance reviewer makes and records every final decision."}
        </p>
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {hint && <span className="ml-2 text-xs font-normal text-slate-400">{hint}</span>}
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
