"use client";

import { useRouter } from "next/navigation";
import type { Submission } from "@/lib/types";
import { formatDate, humanize } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export function QueueTable({
  submissions,
  showSubmitter = true,
}: {
  submissions: Submission[];
  showSubmitter?: boolean;
}) {
  const router = useRouter();

  if (submissions.length === 0) {
    return (
      <div className="grid min-h-52 place-items-center rounded-b-xl border border-t-0 border-slate-200 bg-white text-sm text-slate-500">
        No submissions match these filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-b-xl border border-t-0 border-slate-200 bg-white">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3">Submission</th>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Channel</th>
            {showSubmitter && <th className="px-4 py-3">Submitted by</th>}
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              role="link"
              tabIndex={0}
              aria-label={`Open ${submission.title}`}
              onClick={() => router.push(`/submissions/${submission.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  router.push(`/submissions/${submission.id}`);
                }
              }}
              className="cursor-pointer hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-600"
            >
              <td className="max-w-xs px-5 py-4">
                <span className="font-semibold text-slate-900">{submission.title}</span>
                {submission.affiliateName && (
                  <p className="mt-0.5 truncate text-xs text-slate-500">{submission.affiliateName}</p>
                )}
                {submission.versionNumber > 1 && (
                  <p className="mt-0.5 text-xs font-medium text-violet-600">
                    Version {submission.versionNumber}
                  </p>
                )}
              </td>
              <td className="px-4 py-4 text-slate-600">{humanize(submission.productType)}</td>
              <td className="px-4 py-4 text-slate-600">{humanize(submission.channel)}</td>
              {showSubmitter && (
                <td className="px-4 py-4 text-slate-600">{submission.submittedBy}</td>
              )}
              <td className="px-4 py-4"><StatusBadge value={submission.riskLevel} dot /></td>
              <td className="px-4 py-4"><StatusBadge value={submission.status} /></td>
              <td className="px-4 py-4 text-slate-500">{formatDate(submission.createdAt, { year: undefined })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
