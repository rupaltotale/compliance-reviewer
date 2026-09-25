import { Check, MessageSquarePlus, X } from "lucide-react";
import {
  createRequestCommentAction,
  updateRequestCommentAction,
} from "@/app/actions";
import { StatusBadge } from "@/components/ui/status-badge";
import type { RequestComment } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function RequestComments({
  submissionId,
  comments,
  readOnly,
}: {
  submissionId: string;
  comments: RequestComment[];
  readOnly: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/30">
      <div>
        <h2 className="font-semibold text-slate-950">Independent request comments</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Add revision instructions that are not tied to an automated finding.
        </p>
      </div>

      {comments.length > 0 && (
        <div className="mt-5 space-y-3">
          {comments.map((requestComment) => (
            <article key={requestComment.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {requestComment.comment}
                </p>
                {requestComment.status !== "open" && (
                  <StatusBadge value={requestComment.status} />
                )}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {requestComment.requestedBy} · {formatDateTime(requestComment.createdAt)}
              </p>
              {requestComment.status === "open" && !readOnly && (
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <CommentStatusButton
                    commentId={requestComment.id}
                    status="resolved"
                    label="Mark addressed"
                    icon={<Check className="size-3.5" />}
                    primary
                  />
                  <CommentStatusButton
                    commentId={requestComment.id}
                    status="dismissed"
                    label="Dismiss"
                    icon={<X className="size-3.5" />}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!readOnly && (
        <form action={createRequestCommentAction.bind(null, submissionId)} className="mt-5">
          <label htmlFor="request-comment" className="text-sm font-semibold text-slate-800">
            New request comment
          </label>
          <textarea
            id="request-comment"
            name="comment"
            required
            minLength={3}
            maxLength={2000}
            rows={3}
            placeholder="Describe an additional change needed in the next version…"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
          <button className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <MessageSquarePlus className="size-3.5" /> Add request comment
          </button>
        </form>
      )}
    </section>
  );
}

function CommentStatusButton({
  commentId,
  status,
  label,
  icon,
  primary = false,
}: {
  commentId: string;
  status: "resolved" | "dismissed";
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <form action={updateRequestCommentAction}>
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={
          primary
            ? "inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            : "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        }
      >
        {icon} {label}
      </button>
    </form>
  );
}
